import { Outlet } from "react-router";
import { Card } from "../ui/card";

export default function AuthLayout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <Outlet/>
    </div>
  );
}