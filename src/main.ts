import { Elysia, t } from "elysia";
import { read, create, createInsideFolder, remove, rename, list } from "./s3";

const app = new Elysia({ prefix: "/proxy" });

app.get(
  "/get/:name",
  async ({ set, params }) => {
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
  },
  { detail: { tags: ["Main"], summary: "Get file" } }
);

app.get(
  "/list/:key",
  async ({ set, params }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[params.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const { data, length } = await list();
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return { list: data, length: length };
  },
  {
    detail: { tags: ["Main"], summary: "List file" },
  }
);

app.post(
  "/post",
  async ({ set, body }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[body.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const data = await create(body.file, body.filename);
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return { file: body.filename, status: "uploaded" };
  },
  {
    body: t.Object({ file: t.File(), filename: t.String(), key: t.String() }),
    detail: { tags: ["Main"], summary: "Post file" },
  }
);

app.post(
  "/postFD",
  async ({ set, body }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[body.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const data = await createInsideFolder(body.file, body.filename, body.folder);
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return { file: body.filename, status: "uploaded" };
  },
  {
    body: t.Object({ file: t.File(), filename: t.String(), folder: t.String(), key: t.String() }),
    detail: { tags: ["Main"], summary: "Post file inside folder" },
  }
);

app.put(
  "/rename",
  async ({ set, body }) => {
    const key = JSON.parse(process.env.S3_KEY_ALLOW as string);
    if (key[body.key] !== "true") {
      set.status = 401;
      return "Unauthorized";
    }
    const data = await rename(body.filename, body.newFilename);
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return { file: body.filename, status: "renamed" };
  },
  {
    body: t.Object({
      filename: t.String(),
      newFilename: t.String(),
      key: t.String(),
    }),
    detail: { tags: ["Main"], summary: "Rename file" },
  }
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
    set.headers["access-control-allow-origin"] = "*";
    set.status = 200;
    return { file: body.filename, status: "removed" };
  },
  {
    body: t.Object({ filename: t.String(), key: t.String() }),
    detail: { tags: ["Main"], summary: "Delete file" },
  }
);

export default app;
