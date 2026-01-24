import React from "react";
import styles from "./About.module.css";
import Image from "next/image";

const About = () => {
  return (
    <>
      {/*<div className={styles.aboutWrapper}>*/}
      <div className={styles.aboutContainer}>
        <header className={styles.header}>
          <Image
            src="/assets/pesoLogo.png"
            alt="PESO Logo"
            width={100}
            height={100}
          ></Image>
          <h2>Public Employment Service Office: I-Apply Mo Parañaqueno</h2>
        </header>
        <div className={styles.aboutContent}>
          <p>
            <span>
              The PESO Job Application System is a streamlined employment
              platform designed to connect jobseekers and employers within
              Parañaque City. It simplifies every step of the hiring process,
              offering a centralized space where applicants can search job
              openings, create digital resumes, take required assessments, and
              submit applications online.
            </span>
            <span>
              For PESO staff and partner companies, the system provides
              efficient tools for managing applicants, reviewing qualifications,
              monitoring exam results, and handling referrals. By reducing
              paperwork and eliminating the need for physical submissions, the
              platform promotes faster, more transparent, and more accessible
              employment services for the community.{" "}
            </span>
            <span>
              Built to support both jobseekers and employers, the PESO Job
              Application System aims to modernize local employment services and
              create a smoother path toward meaningful work opportunities.
            </span>
          </p>
        </div>
      </div>
      <div className={styles.aboutContainer}>
        <header className={`${styles.header} ${styles.peso}`}>
          <Image
            src="/assets/pesoLogo.png"
            alt="PESO Logo"
            width={100}
            height={100}
          ></Image>
          <h2>Public Employment Service Office Parañaque</h2>
        </header>
        <div className={styles.aboutContent}>
          <p>
            <span>
              The Public Employment Service Office (PESO) Parañaque is a local
              government unit dedicated to providing accessible and
              community-focused employment services for residents of Parañaque
              City. As the city’s primary hub for job assistance, PESO Parañaque
              connects jobseekers with legitimate employment opportunities and
              supports employers in finding qualified workers.
            </span>
            <span>
              PESO Parañaque offers essential services such as job matching and
              referral, skills training coordination, labor market information,
              livelihood support, and special employment programs for youth,
              students, and vulnerable sectors. By partnering with local
              businesses, educational institutions, and national government
              agencies, the office ensures that employment services remain
              relevant, transparent, and responsive to the needs of the
              community.
            </span>
            <span>
              Committed to promoting economic development and improving the
              quality of life for Parañaque residents, PESO Parañaque continues
              to strengthen its programs and adopt modern systems to make
              employment services more efficient and inclusive.
            </span>
          </p>
        </div>
      </div>
      {/*</div>*/}
    </>
  );
};

export default About;
