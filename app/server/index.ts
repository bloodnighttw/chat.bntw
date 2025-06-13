import { createHonoServer } from "react-router-hono-server/node";
import { hello } from "./hello"; 
import { chat } from "./chat";
import { app as auth } from "./auth";

export default await createHonoServer({
  configure(server) {
    // Mount the API routes under /api
    server.route("/api", hello);
    server.route("/api", chat);
    server.route("/api", auth);
  }
});