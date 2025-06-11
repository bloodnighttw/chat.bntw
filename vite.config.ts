import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { reactRouterHonoServer } from "react-router-hono-server/dev"; // add this
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // @ts-expect-error this plugin is not typed yet
    reactRouterHonoServer(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
