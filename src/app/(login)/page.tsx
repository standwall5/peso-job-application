import Image from "next/image";
import Link from "next/link";
import PesoLogo from "../../../public/assets/pesoLogo.png";
import CityHall from "../../../public/assets/paranaqueCityHall.jpg";
import Slogan from "../../../public/assets/loginSlogan.webp";
import "../home.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Home() {
  return (
    <section>
      <div className="login-container">
        <div className="login-slogan">
          <Image src={Slogan} alt="Public Employment Service Office"></Image>
          <p>Connecting You to Opportunity</p>
        </div>
        <div className="login-section">
          <form method="POST">
            <input type="email" placeholder="Enter your e-mail" name="email" />
            <input
              type="password"
              placeholder="Enter your password"
              name="password"
            />
            <Link href="/resetPassword">Forgot password?</Link>
            <button className="custom-button">Login</button>
          </form>
          <p>
            No account yet? <Link href="/register">Register now</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
