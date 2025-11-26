"use client";

import Link from "next/link";
import "@/app/home.css";
import { login } from "@/lib/auth-actions";
import { useState } from "react";
import OneEightyRing from "@/components/OneEightyRing";
import Button from "@/components/Button";
import Image from "next/image";

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          <Image
            src="/assets/loginSlogan.webp"
            alt="Public Employment Service Office"
            width={1000}
            height={1000}
          />
          <p>Connecting You to Opportunity</p>
        </div>
        <div className="login-section">
          <form method="" onSubmit={handleSubmit}>
            {error && (
              <div className="error-banner">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="input-wrapper">
              <svg
                className="input-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 4H2C0.9 4 0.01 4.9 0.01 6L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V6C20 4.9 19.1 4 18 4ZM18 8L10 11.5L2 8V6L10 9.5L18 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="email"
                placeholder="Enter your e-mail"
                name="email"
                required
                disabled={loading}
              />
            </div>

            <div className="input-wrapper">
              <svg
                className="input-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 7H14V5C14 2.24 11.76 0 9 0C6.24 0 4 2.24 4 5V7H3C1.9 7 1 7.9 1 9V17C1 18.1 1.9 19 3 19H15C16.1 19 17 18.1 17 17V9C17 7.9 16.1 7 15 7ZM9 14C7.9 14 7 13.1 7 12C7 10.9 7.9 10 9 10C10.1 10 11 10.9 11 12C11 13.1 10.1 14 9 14ZM12.1 7H5.9V5C5.9 3.29 7.29 1.9 9 1.9C10.71 1.9 12.1 3.29 12.1 5V7Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                name="password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3M12 17C9.24 17 7 14.76 7 12C7 11.18 7.19 10.4 7.54 9.72L9.06 11.24C9.03 11.49 9 11.74 9 12C9 13.66 10.34 15 12 15C12.26 15 12.51 14.97 12.76 14.94L14.28 16.46C13.6 16.81 12.82 17 12 17ZM14.97 11.17C14.82 9.77 13.72 8.68 12.33 8.53L14.97 11.17Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>

            <Link href="/resetPassword">Forgot password?</Link>
            <Button
              variant="primary"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                width: "fit-content",
                alignSelf: "center",
              }}
            >
              {loading && <OneEightyRing color="white" />}
              Login
            </Button>
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
