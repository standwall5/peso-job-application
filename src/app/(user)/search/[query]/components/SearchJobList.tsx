"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "@/app/(user)/job-opportunities/JobHome.module.css";
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";
import BlocksWave from "@/components/BlocksWave";

import { createClient } from "@/utils/supabase/client";
import UserProfile from "@/app/(user)/profile/components/UserProfile";
import Link from "next/link";
import Button from "@/components/Button";
import TakeExam from "@/app/(user)/job-opportunities/[companyId]/components/exam/TakeExam";
import ExamResultView from "@/app/(user)/job-opportunities/[companyId]/components/exam/ExamResultView";
import VerifiedIdUpload from "@/app/(user)/job-opportunities/[companyId]/components/verification/VerifiedIdUpload";
import Toast from "@/components/toast/Toast";
import { submitExam } from "@/lib/db/services/exam.service";

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  companies: {
    name: string;
    logo: string | null;
  };
  exam_id: number;
}

interface ExamData {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: Choice[];
}

interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
}

interface PrivateJobListProps {
  searchParent?: string;
  onSearchChange?: (value: string) => void;
}

interface ApplicationProgress {
  resume_viewed: boolean;
  exam_completed: boolean;
  verified_id_uploaded: boolean;
}

interface ApplicationProgressResponse {
  job_id: number;
  applicant_id: number;
  resume_viewed: boolean;
  exam_completed: boolean;
  verified_id_uploaded: boolean;
  created_at: string;
  updated_at: string;
}

interface ExamAttemptData {
  attempt: {
    attempt_id: number;
    exam_id: number;
    applicant_id: number;
    date_submitted: string;
    score: number;
  };
  answers: Array<{
    question_id: number;
    choice_id?: number;
    text_answer?: string;
    questions?: {
      question_text: string;
      choices?: Array<{ id: number; choice_text: string }>;
    };
    choices?: {
      choice_text: string;
    };
  }>;
  correctAnswers: Array<{
    question_id: number;
    choice_id?: number;
    correct_text?: string;
  }>;
}

const SearchJobList = ({
  searchParent,
  onSearchChange,
}: PrivateJobListProps) => {
  // Get query directly from URL params and decode it
  const params = useParams();
  const rawQuery = Array.isArray(params.query)
    ? params.query[0]
    : params.query || "";
  const urlQuery = decodeURIComponent(rawQuery);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState(urlQuery || searchParent || "");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationSelect, setApplicationSelect] = useState("previewResume");
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loadingExam, setLoadingExam] = useState(false);

  const [examAttempt, setExamAttempt] = useState<ExamAttemptData | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
  });

  // Track application progress online
  const [applicationProgress, setApplicationProgress] = useState<
    Record<number, ApplicationProgress>
  >({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  const showToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
  };

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const res = await fetch("/api/application-progress");
      const data = await res.json();
      if (data.progress && Array.isArray(data.progress)) {
        const progressMap: Record<number, ApplicationProgress> = {};
        data.progress.forEach((p: ApplicationProgressResponse) => {
          progressMap[p.job_id] = {
            resume_viewed: p.resume_viewed,
            exam_completed: p.exam_completed,
            verified_id_uploaded: p.verified_id_uploaded,
          };
        });
        setApplicationProgress(progressMap);
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const updateProgress = async (
    jobId: number,
    updates: Partial<ApplicationProgress>,
  ) => {
    const currentProgress = applicationProgress[jobId] || {
      resume_viewed: false,
      exam_completed: false,
      verified_id_uploaded: false,
    };

    const newProgress = { ...currentProgress, ...updates };

    // Optimistically update UI
    setApplicationProgress((prev) => ({
      ...prev,
      [jobId]: newProgress,
    }));

    // Save to server
    try {
      await fetch("/api/application-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          resumeViewed: newProgress.resume_viewed,
          examCompleted: newProgress.exam_completed,
          verifiedIdUploaded: newProgress.verified_id_uploaded,
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
      // Revert on error
      setApplicationProgress((prev) => ({
        ...prev,
        [jobId]: currentProgress,
      }));
    }
  };

  const fetchExamAttempt = async (jobId: number, examId: number) => {
    setLoadingAttempt(true);
    try {
      const res = await fetch(
        `/api/exams/attempt?jobId=${jobId}&examId=${examId}`,
      );
      const data = await res.json();
      console.log("Exam attempt data:", data); // Debug log

      // If attempt exists, set it with all the data
      if (data.attempt) {
        setExamAttempt(data);
      } else {
        setExamAttempt(null);
      }
    } catch (err) {
      console.error("Failed to fetch exam attempt:", err);
      setExamAttempt(null);
    } finally {
      setLoadingAttempt(false);
    }
  };

  const fetchExam = async (examId: number) => {
    setLoadingExam(true);
    try {
      const response = await fetch(`/api/getExam?id=${examId}`);
      const data = await response.json();
      setExamData(data);
    } catch (err) {
      console.error("Failed to fetch exam:", err);
      setExamData(null);
    } finally {
      setLoadingExam(false);
    }
  };

  const handleExamSubmit = async (
    answers: Record<number, number | number[] | string>,
  ) => {
    try {
      // Validate selectedJob exists
      if (!selectedJob?.exam_id || !selectedJob?.id) {
        throw new Error("Job or exam information is missing");
      }

      const result = await submitExam({
        examId: selectedJob.exam_id,
        jobId: selectedJob.id,
        answers,
      });

      if (result.success) {
        // Mark exam as completed in progress
        if (selectedJob) {
          await updateProgress(selectedJob.id, { exam_completed: true });
        }

        // Build the toast message
        let message = "";
        if (result.autoGradedCount > 0) {
          if (result.score !== null) {
            message += `Auto-graded score: ${result.score}% (${result.correctCount}/${result.autoGradedCount} correct)\n`;
          }
        }
        if (result.paragraphCount > 0) {
          message += `${result.paragraphCount} paragraph question(s) pending admin review.`;
        }
        if (!message) {
          message = "Your exam has been submitted successfully!";
        }

        showToast("Exam Submitted! 🎉", message.trim());

        // Refresh exam attempt to show results
        if (selectedJob?.id && selectedJob?.exam_id) {
          await fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
        }
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast(
        "Exam Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      // Fetch ALL jobs for search functionality
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(*)");

      if (error) {
        console.log(error);
        return;
      }
      setJobs(Array.isArray(data) ? data : []);
    }
    fetchData();
  }, []);

  // Update search when URL query changes
  useEffect(() => {
    setSearch(urlQuery || searchParent || "");
  }, [urlQuery, searchParent]);

  // useEffect(() => {
  //   async function fetchData() {
  //     const supabase = createClient();
  //     // Fetch jobs for this company, including company details
  //     const { data, error } = await supabase
  //       .from("jobs")
  //       .select("*, companies(*)");

  //     if (error) {
  //       console.log(error);
  //       return;
  //     }
  //     setJobs(data || []);
  //   }
  //   fetchData();
  //   setSearch(searchParent || "");
  // }, [search, searchParent]);

  const [userApplications, setUserApplications] = useState<number[]>([]);

  async function fetchUserApplications() {
    try {
      const res = await fetch("/api/getUserApplications");
      const data = await res.json();
      setUserApplications(data.map((app: { job_id: number }) => app.job_id));
    } catch (err) {
      console.log("Error: " + err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserApplications();
    fetchProgress();
  }, []);

  const submitFinalApplication = async (job_id: number) => {
    try {
      const response = await fetch("/api/submitResume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: job_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      console.log(result);
      showToast(
        "Application Submitted! 🎉",
        "Your application has been successfully submitted.",
      );

      // Clear progress for this job
      try {
        await fetch(`/api/application-progress?jobId=${job_id}`, {
          method: "DELETE",
        });
        setApplicationProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[job_id];
          return newProgress;
        });
      } catch (err) {
        console.error("Failed to clear progress:", err);
      }

      fetchUserApplications();
      setSelectedJob(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      showToast(
        "Submission Failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const searchLower = search.toLowerCase();
    return (
      job.title?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.companies?.name?.toLowerCase().includes(searchLower)
    );
  });

  console.log("SearchJobList Debug:", {
    urlQuery,
    searchParent,
    search,
    totalJobs: jobs.length,
    filteredJobs: filteredJobs.length,
    sampleJob: jobs[0],
  });

  if (loading || loadingProgress) {
    return <BlocksWave />;
  }

  const jobCards = filteredJobs.map((job) => {
    const hasApplied = userApplications.includes(job.id);
    return (
      <div
        key={job.id}
        className={`${styles.jobCard} ${jobStyle.jobSpecificCard}`}
        onClick={() => {
          setSelectedJob(job);
          setExamData(null);

          // Mark resume as viewed if not already applied
          if (!hasApplied) {
            updateProgress(job.id, { resume_viewed: true });
          }

          if (job.exam_id) {
            fetchExam(job.exam_id);
          }
        }}
      >
        <div className={`${styles.jobCompany} ${jobStyle.companyInformation}`}>
          <img
            src={job.companies.logo || "/assets/images/default_profile.png"}
            alt={job.companies.name + " logo"}
            className={styles.companyLogo}
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
            }}
          />
          <span>{job.companies?.name}</span>
        </div>
        <div className={jobStyle.jobDetails}>
          <h2>{job.title}</h2>
          <p>{job.place_of_assignment}</p>
          <p>{job.sex}</p>
          <p>{job.education}</p>
          <p>{job.eligibility}</p>
          <p>
            {new Date(job.posted_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <Button variant="success" disabled={hasApplied}>
            {hasApplied ? "Applied" : "Apply"}
          </Button>
        </div>
      </div>
    );
  });

  return (
    <section className={styles.section}>
      <div className={styles.jobList}>
        {jobCards.length > 0 ? jobCards : <p>No jobs found.</p>}
      </div>
      {selectedJob && (
        <div
          className={jobStyle.modalOverlay}
          onClick={() => {
            setSelectedJob(null);
            setExamData(null);
          }}
        >
          <div
            className={`${jobStyle.modal} ${jobStyle.applicationModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedJob(null);
                setExamData(null);
              }}
              style={{ fontWeight: "bold", right: 40, position: "absolute" }}
            >
              X
            </button>
            <div className={jobStyle.applicationContainer}>
              <div
                key={selectedJob.id}
                className={`${styles.jobCard} ${jobStyle.applicationJobCompany}`}
                onClick={() => setSelectedJob(selectedJob)}
              >
                <div
                  className={`${styles.jobCompany} ${jobStyle.companyInformation}`}
                >
                  <img
                    src={
                      selectedJob.companies?.logo ||
                      "/assets/images/default_profile.png"
                    }
                    alt={(selectedJob.companies?.name || "Company") + " logo"}
                    className={styles.companyLogo}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                    }}
                  />
                  <span>{selectedJob.companies?.name}</span>
                </div>
                <div className={jobStyle.jobDetails}>
                  <h2>{selectedJob.title}</h2>
                  <p>{selectedJob.place_of_assignment}</p>
                  <p>{selectedJob.sex}</p>
                  <p>{selectedJob.education}</p>
                  <p>{selectedJob.eligibility}</p>
                  <p>
                    {new Date(selectedJob.posted_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className={jobStyle.applicationDetails}>
                <ul className={jobStyle.applicationNav}>
                  <li
                    className={
                      applicationSelect === "previewResume"
                        ? jobStyle.active
                        : ""
                    }
                    onClick={() => setApplicationSelect("previewResume")}
                  >
                    Preview Resume
                  </li>
                  <li
                    className={
                      applicationSelect === "exam" ? jobStyle.active : ""
                    }
                    onClick={() => {
                      setApplicationSelect("exam");
                      // THIS IS CRITICAL - must fetch exam attempt!
                      if (selectedJob?.id && selectedJob?.exam_id) {
                        console.log(
                          "Fetching exam attempt for job:",
                          selectedJob.id,
                          "exam:",
                          selectedJob.exam_id,
                        );
                        fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
                      } else {
                        console.log(
                          "Cannot fetch exam attempt - missing job or exam ID:",
                          selectedJob,
                        );
                      }
                    }}
                  >
                    Exam
                  </li>

                  <li
                    className={
                      applicationSelect === "verifiedId" ? jobStyle.active : ""
                    }
                    onClick={() => {
                      setApplicationSelect("verifiedId");
                      if (selectedJob?.id && selectedJob?.exam_id) {
                        fetchExamAttempt(selectedJob.id, selectedJob.exam_id);
                      }
                    }}
                  >
                    Verified ID
                  </li>
                </ul>
                {applicationSelect === "previewResume" && (
                  <div className={`${jobStyle.applicantDetail}`}>
                    <div className={jobStyle.applicantDetailResume}>
                      <UserProfile />
                    </div>
                    <div className={jobStyle.applicantDetailButtons}>
                      {!userApplications.includes(selectedJob.id) ? (
                        <>
                          <Link href="/profile">
                            <Button variant="primary">Edit Profile</Button>
                          </Link>
                          <Button
                            variant="success"
                            onClick={() => {
                              setApplicationSelect("exam");
                              showToast(
                                "Resume Reviewed ✓",
                                "Please proceed to take the exam.",
                              );
                            }}
                          >
                            Continue to Exam
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link href="/profile">
                            <Button variant="primary">View Profile</Button>
                          </Link>
                          <Button disabled variant="success">
                            Application Submitted
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {applicationSelect === "exam" ? (
                  <div className={jobStyle.applicantDetail}>
                    {(() => {
                      console.log("=== EXAM TAB DEBUG ===");
                      console.log("loadingAttempt:", loadingAttempt);
                      console.log("loadingExam:", loadingExam);
                      console.log("examAttempt:", examAttempt);
                      console.log("examData:", examData);
                      console.log(
                        "userApplications.includes(selectedJob.id):",
                        userApplications.includes(selectedJob.id),
                      );
                      console.log("====================");
                      return null;
                    })()}

                    {loadingAttempt || loadingExam ? (
                      <BlocksWave />
                    ) : examAttempt && examAttempt.attempt ? (
                      // User has taken exam - show results
                      <ExamResultView
                        attempt={examAttempt.attempt}
                        answers={examAttempt.answers}
                        correctAnswers={examAttempt.correctAnswers}
                      />
                    ) : examData &&
                      !userApplications.includes(selectedJob.id) ? (
                      // User hasn't taken exam and hasn't submitted final app - show exam form
                      <TakeExam exam={examData} onSubmit={handleExamSubmit} />
                    ) : userApplications.includes(selectedJob.id) ? (
                      // Final application submitted
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2rem",
                          textAlign: "center",
                          gap: "1rem",
                        }}
                      >
                        <h2>✅ Application Submitted</h2>
                        <p>Your application has been submitted successfully.</p>
                      </div>
                    ) : (
                      <div className={jobStyle.noExam}>
                        <p>No exam available for this job.</p>
                      </div>
                    )}
                  </div>
                ) : null}

                {applicationSelect === "verifiedId" ? (
                  userApplications.includes(selectedJob.id) ? (
                    <div className={jobStyle.applicantDetail}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2rem",
                          textAlign: "center",
                          gap: "1rem",
                        }}
                      >
                        <h2>✅ Application Already Submitted</h2>
                        <p>
                          You have already submitted your application for this
                          job.
                        </p>
                      </div>
                    </div>
                  ) : examAttempt && examAttempt.attempt ? (
                    applicationProgress[selectedJob.id]
                      ?.verified_id_uploaded ? (
                      <div className={jobStyle.applicantDetail}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2rem",
                            textAlign: "center",
                            gap: "1rem",
                          }}
                        >
                          <h2>✅ All Steps Complete!</h2>
                          <p>
                            You have completed all required steps. Click below
                            to submit your final application.
                          </p>
                          <Button
                            variant="success"
                            onClick={() =>
                              submitFinalApplication(selectedJob.id)
                            }
                          >
                            Submit Final Application
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={jobStyle.applicantDetail}>
                        <VerifiedIdUpload
                          jobId={selectedJob.id}
                          onSubmitted={() => {
                            updateProgress(selectedJob.id, {
                              verified_id_uploaded: true,
                            });
                            showToast(
                              "Verified ID Uploaded! ✓",
                              "All steps complete. You can now submit your application.",
                            );
                          }}
                        />
                      </div>
                    )
                  ) : (
                    <div className={jobStyle.applicantDetail}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2rem",
                          textAlign: "center",
                          gap: "1rem",
                        }}
                      >
                        <h2>⚠️ Exam Required</h2>
                        <p>
                          Please complete the exam first before uploading your
                          Verified ID.
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setApplicationSelect("exam");
                            if (selectedJob?.id && selectedJob?.exam_id) {
                              fetchExamAttempt(
                                selectedJob.id,
                                selectedJob.exam_id,
                              );
                            }
                          }}
                        >
                          Go to Exam
                        </Button>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
      />
    </section>
  );
};

export default SearchJobList;
