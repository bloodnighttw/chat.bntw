import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
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
import { getSession, redirectAuthed, signUp } from "~/lib/auth-client";

export const clientLoader = redirectAuthed;

function Success() {
  const [counter, setCounter] = React.useState(2);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [navigate]);

  return (
    <Card className="min-w-xl">
      <CardHeader>
        <CardTitle>Sign Up Successful!</CardTitle>
        <CardDescription>
          You can now log in with your new account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-green-600">Thank you for signing up!</p>
      </CardContent>
      <CardFooter className="flex-col gap-2 items-start">
        <p className="dark:text-zinc-500">
          You will be redirected to the login page in {counter} seconds.
        </p>
        <Button onClick={() => (window.location.href = "/login")}>
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SignUp() {
  const formRef = React.useRef<HTMLFormElement>(null);

  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [padding, setPadding] = useState<boolean>(false);

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formRef.current) {
      console.error("Form reference is not set.");
      return;
    }
    const formData = new FormData(formRef.current);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    if (!email || !password || !confirmPassword) {
      console.error("Email, password, and confirm password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPadding(true);
    try {
      const response = await signUp.email({ email, password, name: email });
      if (response.error) {
        console.error("Sign up failed:", response.error);
        setError("Sign up failed. Please try again.");
      } else {
        console.log("Sign up successful:", response);
        setError(null); // Clear any previous errors
        setSuccess(true);
      }
    } catch (error) {
      console.error("An error occurred during sign up:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setPadding(false);
    }
  };

  if (success) {
    return <Success />;
  }

  return (
    <Card className="max-w-xl w-full m-2">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>

      <CardContent>
        <form ref={formRef} onSubmit={submitForm} aria-disabled={padding}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                disabled={padding}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="enter your password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                name="confirm-password"
                disabled={padding}
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button onClick={submitForm} disabled={padding}>
          SignUp
        </Button>
        {error ? (
          <div className="text-red-500 mt-2">{error}</div>
        ) : (
          <div className="ml-auto text-zinc-400 text-sm">
            already have account? Login {" "}
            <Link to={{ pathname: "/login" }} className="text-zinc-100">here</Link>!
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
