import { Hono } from "hono";
import { auth } from "~/auth";

export const app = new Hono().basePath("/auth");
 
app.on(["POST", "GET"], "/**", (c) => auth.handler(c.req.raw));
 