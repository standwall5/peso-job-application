import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <h2>Purpose of System</h2>
      <div className={styles.aboutContent}>
        <p>Text here</p>
      </div>
    </div>
  );
};

export default About;
