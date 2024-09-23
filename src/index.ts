import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import main from "./main";
import sub from "./sub/sub";
const app = new Elysia();

app.use(
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "PrakasitJ S3 API Documentation",
        version: "1.0.0",
      },
      tags: [
        { name: "Main", description: "General endpoints" },
        { name: "Sub (Euro)", description: "Authentication endpoints" },
      ],
    },
  })
);

app.use(main);
app.use(sub);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
