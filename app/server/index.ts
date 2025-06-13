import { hello } from "./hello"; 
import { chat } from "./chat";
import { app as auth } from "./auth";
import { Hono } from "hono";

const app = new Hono();

app.route("/api", hello);
app.route("/api", chat);
app.route("/api", auth);

export default app;