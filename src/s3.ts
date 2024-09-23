import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
  } from "@aws-sdk/client-s3";
  
  const s3 = new S3Client({
    region: process.env.S3_REGION as string,
    forcePathStyle: true,
    endpoint: process.env.S3_URL as string,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_ACCESS_KEY_SECRET as string,
    },
  });
  
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
      Bucket: process.env.S3_BUCKET_MAIN as string,
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
      Bucket: process.env.S3_BUCKET_MAIN as string,
      Key: filename,
    });
  
    await s3.send(deleteCommand);
  };

  export { read, create, remove, s3};