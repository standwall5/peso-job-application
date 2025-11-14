"use client";

import Link from "next/link";
import "@/app/home.css";
import { login } from "@/lib/auth-actions";
import { useState } from "react";
import OneEightyRing from "@/components/OneEightyRing";

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <section>
      <div className="login-container">
        <div className="login-slogan">
          <img
            src="/assets/loginSlogan.webp"
            alt="Public Employment Service Office"
          />
          <p>Connecting You to Opportunity</p>
        </div>
        <div className="login-section">
          <form method="" onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  color: "red",
                  position: "absolute",
                  marginTop: "-2rem",
                  left: "5.5rem",
                }}
              >
                {error}
              </div>
            )}
            <input type="email" placeholder="Enter your e-mail" name="email" />
            <input
              type="password"
              placeholder="Enter your password"
              name="password"
            />
            <Link href="/resetPassword">Forgot password?</Link>
            <button
              className="custom-button"
              style={{ display: "flex", alignItems: "center", gap: ".5rem" }}
            >
              {loading && <OneEightyRing color="white" />} Login
            </button>
          </form>
          <p>
            No account yet? <Link href="/signup">Register now</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
