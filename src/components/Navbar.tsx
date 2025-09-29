"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import PesoLogo from "../../public/assets/pesoLogo.png";

const SimpleNavBar = (props: { pathname: string }) => {
  return (
    <nav>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/">
              <Image src={PesoLogo} alt="PESO Logo" />
            </Link>
          </li>
          <li>
            <Link href="/">
              <button
                className={
                  props.pathname === "/"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Home
              </button>
            </Link>
          </li>
          <li>
            <Link href="/job-opportunities">
              <button
                className={
                  props.pathname === "/job-opportunities"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Job Opportunities
              </button>
            </Link>
          </li>
          <li>
            <Link href="/how-it-works">
              <button
                className={
                  props.pathname === "/how-it-works"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                How it Works
              </button>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <button
                className={
                  props.pathname === "/about"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                About
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const FlexBoxNav = (props: { pathname: string }) => {
  return (
    <nav>
      <div className="nav-container">
        <Link className="nav-img-container" href="/">
          <Image src={PesoLogo} alt="Peso Logo" />
        </Link>
        <ul>
          <li>
            <Link href="/">
              <button
                className={
                  props.pathname === "/"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Home
              </button>
            </Link>
          </li>
          <li>
            <Link href="/job-opportunities">
              <button
                className={
                  props.pathname === "/job-opportunities"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Job Opportunities
              </button>
            </Link>
          </li>
          <li>
            <Link href="/how">
              <button
                className={
                  props.pathname === "/how"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                How it Works
              </button>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <button
                className={
                  props.pathname === "/about"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                About
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const Navbar = () => {
  const pathname = usePathname();

  return <SimpleNavBar pathname={pathname} />;
};

export default Navbar;
