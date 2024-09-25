import {
    CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../s3";

const read = async (
  name: string
): Promise<{
  data: any;
  length: string;
  contentType: string;
}> => {
  const readCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_SUB as string,
    Key: name,
  });
  const object = await s3.send(readCommand);
  const byteArray = await object.Body;
  const length = object.ContentLength?.toString();

  return {
    data: byteArray,
    length: length ?? "0",
    contentType: object.ContentType ?? "application/octet-stream",
  };
};

const create = async (file: File, filename: string): Promise<string> => {
  const params = {
    Body: Buffer.from(await file.arrayBuffer()),
    Bucket: process.env.S3_BUCKET_SUB as string,
    Key: filename,
    ContentType: file.type,
  };

  // Upload file to S3
  const uploadCommand = new PutObjectCommand(params);
  const response = await s3.send(uploadCommand);
  return filename;
};

const remove = async (filename: string): Promise<void> => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_SUB as string,
    Key: filename,
  });

  await s3.send(deleteCommand);
};

const rename = async (filename: string, newFilename: string): Promise<void> => {
  const copyCommand = new CopyObjectCommand({
    Bucket: process.env.S3_BUCKET_SUB as string,
    CopySource: (process.env.S3_BUCKET_SUB as string) + "/" + filename,
    Key: newFilename,
  });
  const response = await s3.send(copyCommand);
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_SUB as string,
    Key: filename,
  });
  await s3.send(deleteCommand);
};

export { read, create, remove, rename};
