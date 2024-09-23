import { Elysia, t } from "elysia";
import main from "./main";
import sub from "./sub/sub";
const app = new Elysia();

app.use(main);
app.use(sub);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
