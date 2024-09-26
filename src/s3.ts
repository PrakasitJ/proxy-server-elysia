import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { unlink } from "node:fs/promises";

const s3 = new S3Client({
  region: process.env.S3_REGION as string,
  forcePathStyle: true,
  endpoint: process.env.S3_URL as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET as string,
  },
});

const list = async (): Promise<{
  data: any;
  length: string;
}> => {
  const listCommand = new ListObjectsCommand({
    Bucket: process.env.S3_BUCKET_MAIN as string,
    Prefix: "",
  });
  const object = await s3.send(listCommand);
  const byteArray = await object.Contents;
  const length = object.Contents?.length.toString();

  return {
    data: byteArray,
    length: length ?? "0",
  };
};

const read = async (
  name: string
): Promise<{
  data: any;
  length: string;
  contentType: string;
}> => {
  const readCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_MAIN as string,
    Key: name,
  });
  const object = await s3.send(readCommand);
  const blob = await object.Body;
  const length = object.ContentLength?.toString();
  const file = (await blob?.transformToByteArray()) as any;
  await Bun.write(`public/${name}`, file);

  return {
    data: file,
    length: length ?? "0",
    contentType: object.ContentType ?? "application/octet-stream",
  };
};

const create = async (file: File, filename: string): Promise<string> => {
  const params = {
    Body: Buffer.from(await file.arrayBuffer()),
    Bucket: process.env.S3_BUCKET_MAIN as string,
    Key: filename,
    ContentType: file.type,
  };
  
  await Bun.write(`public/${filename}`, await file.arrayBuffer());

  // Upload file to S3
  const uploadCommand = new PutObjectCommand(params);
  const response = await s3.send(uploadCommand);
  return filename;
};

const remove = async (filename: string): Promise<void> => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_MAIN as string,
    Key: filename,
  });
  await s3.send(deleteCommand);
  await unlink("public/" + filename);
};

const rename = async (filename: string, newFilename: string): Promise<void> => {
  const copyCommand = new CopyObjectCommand({
    Bucket: process.env.S3_BUCKET_MAIN as string,
    CopySource: (process.env.S3_BUCKET_MAIN as string) + "/" + filename,
    Key: newFilename,
  });

  try {
    const file = await Bun.file(`public/${filename}`);
    const newFile = await Bun.write(`public/${newFilename}`, file);
    unlink("public/" + filename);
  } catch (error) {
    console.log(error);
  }

  const response = await s3.send(copyCommand);
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_MAIN as string,
    Key: filename,
  });
  await s3.send(deleteCommand);
};

export { list, read, create, remove, rename, s3 };
