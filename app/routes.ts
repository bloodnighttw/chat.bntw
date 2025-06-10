import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/layout/auth.tsx", [
    route("/login", "routes/login.tsx"),
    route("/signup", "routes/signup.tsx"),
  ]),
] satisfies RouteConfig;
