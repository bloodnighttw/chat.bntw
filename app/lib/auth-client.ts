import { createAuthClient } from "better-auth/react"
import { redirect } from "react-router";

export const { signIn, signUp, useSession, getSession } = createAuthClient()

export const redirectAuthed = async () => {
  const session = await getSession();
  if (session.data) {
    redirect("/chat"); // Redirect to home if already logged in
  }
}

// this function checks if the user is authenticated
// and redirects to the login page if not
export const requiredAuth = async () => {
  const session = await getSession();
  if (!session.data) {
    throw redirect("/login"); // Redirect to login if not authenticated
  }
  return session;
}