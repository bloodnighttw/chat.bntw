import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-96 max-w-md p-6 rounded-lg shadow-md dark:bg-zinc-700">
        <Outlet/>
      </div>
    </div>
  );
}