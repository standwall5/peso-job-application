import React from "react";
import Link from "next/link";
import Image from "next/image";
import PesoLogo from "../../public/assets/pesoLogo.png";
import DoleLogo from "../../public/assets/doleLogo.webp";
import ParanaqueLogo from "../../public/assets/paranaqueLogo.png";

const Footer = () => {
  return (
    <footer>
      <ul>
        <li>
          <Image src={PesoLogo} alt="Public Employment Service Office"></Image>
        </li>
        <li>
          <Image src={DoleLogo} alt="Public Employment Service Office"></Image>
        </li>
        <li>
          <Image
            src={ParanaqueLogo}
            alt="Public Employment Service Office"
          ></Image>
        </li>
        <li>
          A system dedicated to conneting job seekers with opportunities,
          developed in partnership with DOLE and PESO Paranaque
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
