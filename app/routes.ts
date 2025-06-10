import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  ...prefix("/chat", [
    layout("components/layout/chat.tsx", [index("routes/chat/index.tsx")]),
  ]),
  layout("components/layout/auth.tsx", [
    route("/login", "routes/login.tsx"),
    route("/signup", "routes/signup.tsx"),
  ]),
] satisfies RouteConfig;
