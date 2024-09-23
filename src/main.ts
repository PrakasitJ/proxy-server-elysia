import { Elysia, t } from "elysia";
import { read, create, remove } from "./s3";

const app = new Elysia({ prefix: "/proxy" });

app.get("/get/:name", async ({ set, params }) => {
  const name = params.name as string;
  const { data, length, contentType } = await read(name);
  set.headers["Content-Type"] = contentType;
  set.headers["cache-control"] = "immutable, max-age=31536000";
  set.headers["content-length"] = `bytes ${0}-${
    parseInt(length) - 1
  }/${length}`;
  set.headers["Accept-Ranges"] = "bytes";
  set.headers["access-control-allow-origin"] = "*";
  set.status = 200;
  return data;
});

app.post(
  "/post",
  async ({ set, body }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[body.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const data = await create(body.file, body.filename);
    set.status = 200;
    return {file:body.filename, status: "uploaded"};
  },
  { body: t.Object({ file: t.File(), filename: t.String(), key: t.String() }) }
);

app.delete(
  "/delete",
  async ({ set, body }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[body.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const data = await remove(body.filename);
    set.status = 200;
    return { file: body.filename, status: "removed" };
  },
  { body: t.Object({ filename: t.String(), key: t.String() }) }
);

export default app;