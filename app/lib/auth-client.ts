import { createAuthClient } from "better-auth/react"
import { redirect } from "react-router";

export const { signIn, signUp, useSession, getSession } = createAuthClient()

export const redirectAuthed = async () => {
  const session = await getSession();
  if (session.data) {
    redirect("/"); // Redirect to home if already logged in
  }
}