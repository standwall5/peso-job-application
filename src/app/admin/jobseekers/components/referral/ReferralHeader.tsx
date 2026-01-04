import React from "react";
import styles from "../ReferralLetter.module.css";

export default function ReferralHeader() {
  return (
    <>
      <div className={styles.header}>
        {/* Left Logos */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <img
              src="/assets/paranaqueLogo.png"
              alt="Parañaque Logo"
              className={styles.logoImage}
            />
          </div>

          <div className={styles.logo}>
            <img
              src="/assets/doleLogo.webp"
              alt="DOLE Logo"
              className={styles.logoImage}
            />
          </div>
        </div>

        {/* Center Content */}
        <div className={styles.centerContent}>
          <p>Republika ng Pilipinas</p>
          <p>TANGGAPAN NG SERBISYO SA PUBLIKONG EMPLEO</p>
          <p>(PUBLIC EMPLOYMENT SERVICE OFFICE – PESO)</p>
          <p>Lungsod ng Parañaque</p>
        </div>

        {/* Right Logos */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <img
              src="/assets/bagongPilipinas.png"
              alt="Bagong Pilipinas Logo"
              className={styles.logoImage}
            />
          </div>
          <div className={styles.logo}>
            <img
              src="/assets/pesoLogo.png"
              alt="PESO Logo"
              className={styles.logoImage}
            />
          </div>
        </div>
      </div>

      <hr className={styles.divider} />
    </>
  );
}
