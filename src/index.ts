import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import main from "./main";
import middleware from "./middleware";

const app = new Elysia();

app.use(
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "S3 API Documentation",
        version: "1.0.0",
      },
      tags: [
        { name: "Main", description: "General endpoints" },
      ],
    },
  })
);

app.use(middleware);
app.use(main);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
