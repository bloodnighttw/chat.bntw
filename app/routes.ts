import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("components/layout/auth.tsx", [
    route("/login", "routes/login.tsx"),
    route("/register", "routes/signup.tsx"),
  ]),
] satisfies RouteConfig;
