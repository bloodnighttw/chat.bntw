import { useState } from "react"
import { signUp } from "~/utils/auth-client";

export default function SignUp() {

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    return <div>
        <h1>Sign Up</h1>
        <p>Sign up to create a new account.</p>
        <p>{loading && "loading"}</p>
        <p>{error && "An error occurred"}</p>
        {/* Add your sign-up form or components here */}
        <form onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            const email = e.currentTarget.email.value;
            const password = e.currentTarget.password.value;
            const confirmPassword = e.currentTarget.confirmPassword.value;
            if (password !== confirmPassword) {
                setError(true);
                setLoading(false);
                return;
            }
            signUp.email({ email, password, name: email }).then((data) => {
                console.log("Sign up successful", data);
                setLoading(false);
            }
            ).catch((err) => {
                console.error("Sign up failed", err);
                setError(true);
                setLoading(false);
            }
            );
        }}>
            <label>
                Email:
                <input type="email" name="email" required />
            </label>
            <br />
            <label>
                Password:
                <input type="password" name="password" required />
            </label>
            <br />
            <label>
                Confirm Password:
                <input type="password" name="confirmPassword" required />
            </label>
            <br />
            <button type="submit">Sign Up</button>
        </form >
        

    </div>
}