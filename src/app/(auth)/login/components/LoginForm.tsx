import Image from "next/image";
import Link from "next/link";
import "@/app/home.css";
import { login } from "@/lib/auth-actions";

const LoginForm = () => {
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
          <form method="">
            <input type="email" placeholder="Enter your e-mail" name="email" />
            <input
              type="password"
              placeholder="Enter your password"
              name="password"
            />
            <Link href="/resetPassword">Forgot password?</Link>
            <button formAction={login} className="custom-button">
              Login
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
