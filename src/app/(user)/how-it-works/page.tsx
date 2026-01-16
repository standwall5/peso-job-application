import React from "react";
import styles from "./How.module.css";
import { DocumentTextIcon, BriefcaseIcon, ChartBarIcon, EnvelopeIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

const HowItWorks = () => {
  return (
    <div className={styles.howContainer}>
      <div className={styles.coachingContainer}>
        <h2 className={styles.sectionTitle}>Employment Coaching</h2>
        <div className={styles.coachingContent}>
          <div className={styles.contentWrapper}>
            <p className={styles.intro}>
              Follow these simple steps to apply for jobs in our system and maximize your chances of success.
            </p>
            
            <h3 className={styles.subheading}>How to Apply:</h3>
            
            <div className={styles.offeringsGrid}>
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <DocumentTextIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Upload Your Resume</h4>
                  <p>Start by uploading your updated resume to your profile. Make sure it's current and highlights your skills.</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <BriefcaseIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Browse Job Opportunities</h4>
                  <p>Explore available positions in the Job Opportunities section and find roles that match your qualifications.</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <ChartBarIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Complete Your Application</h4>
                  <p>Fill out the application form with accurate information and attach your resume.</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <EnvelopeIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Submit & Track</h4>
                  <p>Submit your application and track its status in your dashboard.</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <AcademicCapIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Prepare for Interview</h4>
                  <p>If selected, you'll be contacted for an interview. Review the job details and prepare accordingly.</p>
                </div>
              </div>
            </div>
            
            <p className={styles.callToAction}>
              Ready to start your job search? Browse available opportunities and submit your application today!
            </p>
          </div>
        </div>
        
        {/* OLD COACHING CONTENT - COMMENTED OUT */}
        {/* 
        <div className={styles.coachingContent}>
          <div className={styles.contentWrapper}>
            <p className={styles.intro}>
              Our employment coaching services are designed to help you succeed in your job search journey. 
              We provide personalized guidance and support throughout the entire application process.
            </p>
            
            <h3 className={styles.subheading}>What We Offer:</h3>
            
            <div className={styles.offeringsGrid}>
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <DocumentTextIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Resume Review</h4>
                  <p>Get expert feedback on your resume to make it stand out to employers</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <BriefcaseIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Interview Preparation</h4>
                  <p>Practice common interview questions and learn effective strategies</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <ChartBarIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Job Search Strategy</h4>
                  <p>Develop a targeted approach to finding opportunities that match your skills</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <EnvelopeIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Application Assistance</h4>
                  <p>Guidance on completing applications and writing compelling cover letters</p>
                </div>
              </div>
              
              <div className={styles.offeringItem}>
                <div className={styles.iconBox}>
                  <AcademicCapIcon className={styles.icon} />
                </div>
                <div>
                  <h4>Career Development</h4>
                  <p>Long-term planning to achieve your professional goals</p>
                </div>
              </div>
            </div>
            
            <p className={styles.callToAction}>
              Our experienced coaches are here to support you every step of the way. Schedule a session today 
              to start maximizing your employment opportunities.
            </p>
          </div>
        </div>
        */}
      </div>
      
      <div className={styles.tutorialContainer}>
        <h2 className={styles.sectionTitle}>Video Tutorial</h2>
        <div className={styles.tutorialContent}>
          <iframe
            src="https://drive.google.com/file/d/1Co2uLUStL4cFtFUxxOJHU-tcEUBPr-a9/preview"
            width="100%"
            height="100%"
            allow="autoplay"
            allowFullScreen
            className={styles.videoIframe}
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
