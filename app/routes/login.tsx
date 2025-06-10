import { signIn } from "~/utils/auth-client";

export default function Login() {
  return <div>
    <h1>Login</h1>
    <p>Login page content goes here.</p>
    {/* Add your login form or components here */}
    <form onSubmit={(e)=> {
      e.preventDefault();
      const email = e.currentTarget.email.value;
      const password = e.currentTarget.password.value;

      signIn.email({ email, password}).then((data)=> {
        console.log("Login successful", data);
      })
    }}>
      <label>
        Username:
        <input type="email" name="email" required />
      </label>
      <br />
      <label>
        Password: 
        <input type="password" name="password" required />
      </label>
      <br />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="/register">Register here</a>.</p>
    <p>Forgot your password? <a href="/reset-password">Reset it here</a>.</p>
    <p>Need help? <a href="/help">Contact support</a>.</p>
    <p>Back to <a href="/">Home</a>.</p>
  </div>;
}
