import { Label } from "@radix-ui/react-label";
import React from "react";
import { Link, redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getSession, signIn } from "~/utils/auth-client";

export async function clientLoader() {
  const session = await getSession();
  if (session.data) {
    return redirect("/"); // Redirect to home if already logged in
  }
}

function Success() {
  const [counter, setCounter] = React.useState(2);
  const navigate = useNavigate();
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev === 0) {
          clearInterval(interval);
          navigate("/login"); // Redirect to login after 2 seconds
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }
  , [navigate]);
  return (
    <Card className="min-w-xl">
      <CardHeader>
        <CardTitle>Login Successful!</CardTitle>
        <CardDescription>
          You can now access your account.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-2 items-start">
        <p className="dark:text-zinc-500">
          You will be redirected to the home page in {counter} seconds.
        </p>
        <Button onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function Login() {

  const formRef = React.useRef<HTMLFormElement>(null);
  const [success, setSuccess] = React.useState(false);

  if(success){
    return <Success />;
  }
  
  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formRef.current) {
      console.error("Form reference is not set.");
      return;
    }
    const formData = new FormData(formRef.current);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      console.error("Email and password are required.");
      return;
    }

    try {
      const response = await signIn.email({email, password});
      if (response.error) {
        console.error("Login failed:", response.error);
      } else {
        console.log("Login successful:", response);
        setSuccess(true); // Set success state to true
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
    }
  }

  return (
    <Card className="max-w-xl w-full m-2">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Please enter your credentials to log in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={submitForm}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="email@example.com"
                tabIndex={1}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-zinc-400"
                  tabIndex={3}
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" name="password" placeholder="Passowrd" tabIndex={2} required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="gap-4">
        <Button type="submit" onClick={submitForm}>
          Login
        </Button>
        <div className="ml-auto text-zinc-400 text-sm">
          Don't have an account?{" "}
          <Link
            to={{pathname: "/signup"}}
            className="text-blue-500 hover:underline"
            tabIndex={4}
          >
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
