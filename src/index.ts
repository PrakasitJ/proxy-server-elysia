import { Elysia, t } from "elysia";
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
    Bucket: process.env.S3_BUCKET as string,
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

const app = new Elysia();

app.get(
  "/proxy/get/:name",
  async ({ set,params }) => {
    const name = params.name as string;
    const { data, length,contentType } = await read(name);
    set.headers["Content-Type"] = contentType;
    set.headers["cache-control"] = "immutable, max-age=31536000";
    set.headers["content-length"] = `bytes ${0}-${parseInt(length)-1}/${length}`;
    set.headers["Accept-Ranges"] = "bytes";
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return data;
  }
);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
