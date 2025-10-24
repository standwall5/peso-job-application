"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./Profile.module.css";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import Resume from "./Resume";
import BlocksWave from "@/components/BlocksWave";
import Link from "next/link";
import Toast from "@/components/toast/Toast";

interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
}

interface Education {
  school: string;
  degree: string;
  attainment: string;
  location: string;
  start_date: string;
  end_date: string;
}

interface ResumeData {
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[] | WorkExperience;
  profile_introduction: string;
}

interface User {
  name: string;
  birth_date: string;
  age: number;
  address: string;
  sex: string;
  barangay: string;
  district: string;
  email: string;
  phone: string;
  profile_pic_url: string | null;
  preferred_poa: string;
  applicant_type: string;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject();
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject();
      }, "image/jpeg");
    };
    image.onerror = reject;
  });
}

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
}

interface UserApplication {
  job_id: number;
  applied_date: string;
  status: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [showEditResume, setShowEditResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileOptionsNav, setProfileOptionsNav] = useState("viewResume");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const resumeRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [editPreferredPoa, setEditPreferredPoa] = useState(
    user?.preferred_poa ?? ""
  );
  const [editApplicantType, setEditApplicantType] = useState(
    user?.applicant_type ?? ""
  );
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Modal & cropper states
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(
    null
  );
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  // Resume Edit
  const [editName, setEditName] = useState(user?.name ?? "");
  const [editBirthDate, setEditBirthDate] = useState(user?.birth_date ?? "");
  const [editAddress, setEditAddress] = useState(user?.address ?? "");
  const [editSex, setEditSex] = useState(user?.sex ?? "");
  const [editBarangay, setEditBarangay] = useState(user?.barangay ?? "");
  const [editDistrict, setEditDistrict] = useState(user?.district ?? "");
  const [editEducationAttainment, setEditEducationAttainment] = useState(
    resume?.education?.attainment ?? ""
  );
  const [editDegree, setEditDegree] = useState(resume?.education?.degree ?? "");
  const [editIntroduction, setEditIntroduction] = useState(
    resume?.profile_introduction ?? ""
  );
  const [editSchool, setEditSchool] = useState(resume?.education?.school ?? "");
  const [editEducationLocation, setEditEducationLocation] = useState(
    resume?.education?.location ?? ""
  );
  const [editEducationStartDate, setEditEducationStartDate] = useState(
    resume?.education?.start_date ?? ""
  );
  const [editEducationEndDate, setEditEducationEndDate] = useState(
    resume?.education?.end_date ?? ""
  );

  // Showing edit states
  const [showEdit, setShowEdit] = useState(false);

  // Fetch applied jobs
  useEffect(() => {
    async function fetchData() {
      try {
        const jobsRes = await fetch("/api/getJobs");
        const jobsData = await jobsRes.json();
        setJobs(jobsData || []);
      } catch (error) {
        console.log(error);
        setJobs([]);
      }
    }
    fetchData();
  }, []);

  const [userApplications, setUserApplications] = useState<UserApplication[]>(
    []
  );
  async function fetchUserApplications() {
    try {
      const res = await fetch("/api/getUserApplications");
      const data = await res.json();
      // data is an array of { job_id: number, created_at: string }
      setUserApplications(data);
    } catch (err) {
      console.log("Error: " + err);
    }
  }
  useEffect(() => {
    fetchUserApplications();
  }, []);

  // Fetch user + resume
  useEffect(() => {
    async function fetchAll() {
      try {
        const [userResponse, resumeResponse] = await Promise.all([
          fetch("/api/getUser"),
          fetch("/api/getResume"),
        ]);

        let userData: User | null = null;
        if (userResponse.ok) {
          const json = await userResponse.json();
          userData =
            json && Object.keys(json).length > 0 ? (json as User) : null;
        }

        let resumeData: ResumeData | null = null;
        if (resumeResponse.ok) {
          const json = await resumeResponse.json();
          resumeData =
            json && Object.keys(json).length > 0 ? (json as ResumeData) : null;
        } // non-OK (e.g. 404) => keep as null

        setUser(userData);
        setResume(resumeData);
      } catch (err) {
        console.error("Fetch failed:", err);
        setUser(null);
        setResume(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Refresh user (toast success)
  useEffect(() => {
    if (showEditSuccess) {
      async function refreshUser() {
        try {
          const res = await fetch("/api/getUser");
          if (res.ok) {
            const json = await res.json();
            setUser(json || null);
          }
        } catch (err) {
          console.error("Fetch failed:", err);
          setUser(null);
        }
      }
      refreshUser();
    }
  }, [showEditSuccess]);

  // Sync basic edit fields when user/resume or when opening edit
  useEffect(() => {
    setEditPreferredPoa(user?.preferred_poa ?? "");
    setEditApplicantType(user?.applicant_type ?? "");
  }, [user]);

  useEffect(() => {
    if (showEditResume) {
      setEditName(user?.name ?? "");
      setEditBirthDate(user?.birth_date ?? "");
      setEditAddress(user?.address ?? "");
      setEditBarangay(user?.barangay ?? "");
      setEditDistrict(user?.district ?? "");
      setEditSex(user?.sex ?? "");
      setEditEducationAttainment(resume?.education?.attainment ?? "");
      setEditDegree(resume?.education?.degree ?? "");
      setEditIntroduction(resume?.profile_introduction ?? "");
      setEditSchool(resume?.education?.school ?? "");
      setEditEducationLocation(resume?.education?.location ?? "");
      setEditEducationStartDate(resume?.education?.start_date ?? "");
      setEditEducationEndDate(resume?.education?.end_date ?? "");
    }
  }, [showEditResume, user, resume]);

  // Work experiences init/sync
  useEffect(() => {
    if (resume?.work_experiences) {
      if (Array.isArray(resume.work_experiences)) {
        setWorkExperiences(resume.work_experiences);
      } else {
        setWorkExperiences([resume.work_experiences]);
      }
    } else {
      setWorkExperiences([
        {
          company: "",
          position: "",
          location: "",
          start_date: "",
          end_date: "",
        },
      ]);
    }
  }, [resume]);

  // Skills init/sync
  useEffect(() => {
    if (Array.isArray(resume?.skills)) {
      setSkills(resume.skills);
    } else {
      setSkills([]);
    }
  }, [resume]);

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (resumeRef.current) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `${user?.name} Resume.pdf`,
          image: { type: "jpeg", quality: 0.2 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(resumeRef.current)
        .save();
    }
  };

  const handleProfileDetailsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    await fetch("/api/updateProfileDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferred_poa: formData.get("preferred_poa"),
        applicant_type: formData.get("applicant_type"),
        name: formData.get("name"),
      }),
    });
    setShowEditSuccess(true);
  };

  const handleResumeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/updateResume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        birth_date: editBirthDate,
        address: editAddress,
        sex: editSex,
        barangay: editBarangay,
        district: editDistrict,
        education: {
          attainment: editEducationAttainment,
          degree: editDegree,
          school: editSchool,
          location: editEducationLocation,
          start_date: editEducationStartDate,
          end_date: editEducationEndDate,
        },
        skills,
        work_experiences: workExperiences,
        profile_introduction: editIntroduction,
      }),
    });
    // refetch the resume so preview shows up immediately
    try {
      const res = await fetch("/api/getResume");
      if (res.ok) {
        const json = await res.json();
        setResume(
          json && Object.keys(json).length > 0 ? (json as ResumeData) : null
        );
      }
    } catch {}
    setShowEditResume(false);
    setShowEditSuccess(true);
  };

  // Dropzone for drag-and-drop or click-to-select
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const onCropComplete = useCallback((_: unknown, area: PixelCrop) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleCropAndUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;
    setUploading(true);
    const imageUrl = URL.createObjectURL(selectedFile);
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
    URL.revokeObjectURL(imageUrl);

    const formData = new FormData();
    const croppedFile = new File([croppedBlob], "profile.jpg", {
      type: "image/jpeg",
    });
    formData.append("file", croppedFile);
    const res = await fetch("/api/uploadProfilePic", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    if (result.url) {
      setDateNow(Date.now());
      setUser((prev) =>
        prev
          ? {
              ...prev,
              profile_pic_url: result.url + "?t=" + dateNow,
            }
          : null
      );
    }
    setUploading(false);
    setShowModal(false);
    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  // Toast auto-hide
  useEffect(() => {
    if (showEditSuccess) {
      const timer = setTimeout(() => setShowEditSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEditSuccess]);

  const getApplicationDate = (id: number) =>
    userApplications.find((app) => app.job_id === id);

  const filteredJobs = jobs.filter((job) =>
    userApplications.some((app) => app.job_id === job.id)
  );

  const jobCards = filteredJobs.map((job) => {
    return (
      <div key={job.id} className={`${styles.jobCard}`}>
        <div className={`${styles.jobCompany}`}>
          {job.companies?.logo && (
            <img
              src={job.companies.logo}
              alt={job.companies.name + " logo"}
              className={styles.companyLogo}
              style={{
                width: "64px",
                height: "64px",
                objectFit: "contain",
              }}
            />
          )}
          <span>{job.companies?.name}</span>
          <span>{job.title}</span>
        </div>
        <div className={styles.jobDetails}>
          <span>
            {getApplicationDate(job.id)?.applied_date &&
            !isNaN(new Date(getApplicationDate(job.id)!.applied_date).getTime())
              ? new Date(
                  getApplicationDate(job.id)!.applied_date
                ).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No application date"}
          </span>
          <span
            className={`${styles.status} ${
              getApplicationDate(job.id)?.status ? styles.pending : ""
            }`}
          >
            {getApplicationDate(job.id)?.status === "Pending" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {getApplicationDate(job.id)!.status}
              </>
            ) : getApplicationDate(job.id)?.status === "Referred" ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                {getApplicationDate(job.id)!.status}
              </>
            ) : null}
          </span>
        </div>
      </div>
    );
  });

  if (loading) return <BlocksWave />;
  if (!user) return <div>No user found.</div>;

  return (
    <>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 10,
              minWidth: 340,
            }}
          >
            <h3 style={{ textAlign: "center" }}>Edit Profile Picture</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {!selectedFile && (
                <>
                  <img
                    src={
                      user.profile_pic_url
                        ? user.profile_pic_url + "?t=" + dateNow
                        : "/assets/images/default_profile.png"
                    }
                    alt="Profile"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      marginBottom: 16,
                    }}
                  />
                  <div
                    {...getRootProps()}
                    style={{
                      border: "2px dashed #aaa",
                      borderRadius: 8,
                      padding: 24,
                      textAlign: "center",
                      cursor: "pointer",
                      background: isDragActive ? "#f0f0f0" : "#fafafa",
                      marginBottom: 16,
                    }}
                  >
                    <input {...getInputProps()} />
                    {isDragActive
                      ? "Drop the image here ..."
                      : "Drag & drop a new image here, or click to select"}
                  </div>
                </>
              )}

              {selectedFile && (
                <>
                  <div
                    style={{
                      position: "relative",
                      width: 300,
                      height: 300,
                      marginBottom: 16,
                    }}
                  >
                    <Cropper
                      image={URL.createObjectURL(selectedFile)}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCropAndUpload} disabled={uploading}>
                      {uploading ? "Uploading..." : "Crop & Upload"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setCroppedAreaPixels(null);
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              <button
                style={{ marginTop: 24 }}
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedAreaPixels(null);
                }}
                disabled={uploading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Always mounted toast; slide via show prop */}
      <Toast
        show={showEditSuccess}
        onClose={() => setShowEditSuccess(false)}
        title="Success"
        message="Details updated!"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        }
      />

      <div className={styles.profileContainer}>
        <div className={styles.profileDetailsContainer}>
          <div className={styles.profileDetailsContent}>
            <div className={styles.profileDetailsImage}>
              <div
                className={styles.profilePicWrapper}
                style={{ cursor: "pointer" }}
                onClick={() => setShowModal(true)}
              >
                <img
                  src={
                    user.profile_pic_url
                      ? user.profile_pic_url + "?t=" + dateNow
                      : "/assets/images/default_profile.png"
                  }
                  alt="Profile"
                  className={styles.profilePic}
                  style={{ borderRadius: "50%" }}
                />
                <span className={styles.editIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <h4>{user?.name || "No name"}</h4>

            {showEdit ? (
              <form
                className={styles.profileDetailsInfo}
                onSubmit={handleProfileDetailsSave}
              >
                <span>
                  <strong>PHONE:</strong>
                  <button className="grey-button">
                    <span>
                      Edit on settings
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                </span>
                <span>
                  <strong>EMAIL:</strong>
                  <button className="grey-button">
                    <span>
                      Edit on settings
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                </span>
                <span>
                  <strong>PREFERRED PLACE OF ASSIGNMENT: </strong>
                  <input
                    type="text"
                    placeholder={
                      user?.preferred_poa || "No preferred place of assignment"
                    }
                    name="preferred_poa"
                  />
                </span>
                <span>
                  <strong>APPLICANT TYPE: </strong>
                  <input
                    type="text"
                    placeholder={user?.applicant_type || "No no applicant type"}
                    name="applicant_type"
                  />
                </span>
                <button className="green-button">Save</button>
              </form>
            ) : (
              <div className={styles.profileDetailsInfo}>
                <span>
                  <strong>PHONE:</strong> <p>{user?.phone || "No phone"}</p>
                </span>
                <span>
                  <strong>EMAIL:</strong> <p>{user?.email || "No email"}</p>
                </span>
                <span>
                  <strong>PREFERRED PLACE OF ASSIGNMENT: </strong>
                  <p>
                    {user?.preferred_poa || "No preferred place of assignment"}
                  </p>
                </span>
                <span>
                  <strong>APPLICANT TYPE: </strong>
                  <p>{user?.applicant_type || "No no applicant type"}</p>
                </span>
              </div>
            )}

            <button
              className="grey-button"
              onClick={() => {
                setShowEdit((prev) => !prev);
                setShowEditSuccess(false);
              }}
              type="submit"
            >
              {showEdit ? "Exit" : "Edit"}
            </button>
          </div>
        </div>

        <div className={styles.profileOptionsContainer}>
          <div className={styles.profileOptionsContent}>
            <ul className={styles.profileOptionsNav}>
              <li
                className={
                  profileOptionsNav === "viewResume" ? styles.active : ""
                }
                onClick={() => setProfileOptionsNav("viewResume")}
              >
                Preview Resume
              </li>
              <li
                className={
                  profileOptionsNav === "appliedJobs" ? styles.active : ""
                }
                onClick={() => setProfileOptionsNav("appliedJobs")}
              >
                Applied Jobs
              </li>
            </ul>

            {profileOptionsNav === "viewResume" && (
              <>
                {showEditResume ? (
                  // Edit form takes priority even if resume is null
                  <form
                    className={styles.editResume}
                    onSubmit={handleResumeSave}
                  >
                    <h2>Personal Information</h2>
                    <div className={styles.row}>
                      <div>
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editName}
                          placeholder="Full Name"
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.row}>
                      <div>
                        <label htmlFor="birthDate">Date of Birth</label>
                        <input
                          type="date"
                          name="birthDate"
                          value={editBirthDate}
                          placeholder="YYYY-MM-DD"
                          onChange={(e) => setEditBirthDate(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="age">Age</label>
                        <input
                          type="text"
                          name="age"
                          value={user?.age ?? ""}
                          placeholder="Age"
                          disabled
                        />
                      </div>
                      <div>
                        <label htmlFor="sex">Sex</label>
                        <select
                          name="sex"
                          value={editSex}
                          onChange={(e) => setEditSex(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select Sex
                          </option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.row}>
                      <div>
                        <label htmlFor="address">
                          Address (House number, Street, etc.)
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editAddress}
                          placeholder="Address"
                          onChange={(e) => setEditAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="barangay">Barangay</label>
                        <select
                          name="barangay"
                          value={editBarangay}
                          onChange={(e) => setEditBarangay(e.target.value)}
                        >
                          <option value="" disabled>
                            Select Barangay
                          </option>
                          {editDistrict === "District 1" && (
                            <>
                              <option value="Baclaran">Baclaran</option>
                              <option value="Don Galo">Don Galo</option>
                              <option value="La Huerta">La Huerta</option>
                              <option value="San Dionisio">San Dionisio</option>
                              <option value="Santo Niño">Santo Niño</option>
                              <option value="Tambo">Tambo</option>
                              <option value="Vitalez">Vitalez</option>
                            </>
                          )}
                          {editDistrict === "District 2" && (
                            <>
                              <option value="BF Homes">BF Homes</option>
                              <option value="Don Bosco">Don Bosco</option>
                              <option value="Marcelo Green">
                                Marcelo Green
                              </option>
                              <option value="Merville">Merville</option>
                              <option value="Moonwalk">Moonwalk</option>
                              <option value="San Antonio">San Antonio</option>
                              <option value="San Isidro">San Isidro</option>
                              <option value="San Martin de Porres">
                                San Martin de Porres
                              </option>
                              <option value="Sun Valley">Sun Valley</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="district">District</label>
                        <select
                          name="district"
                          value={editDistrict}
                          onChange={(e) => {
                            setEditDistrict(e.target.value);
                          }}
                          required
                        >
                          <option value="" disabled>
                            Select District
                          </option>
                          <option value="District 1">District 1</option>
                          <option value="District 2">District 2</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.educationRow}>
                      <label>Education</label>
                      <div
                        className={styles.rowInput}
                        style={{
                          marginBottom: "1rem",
                          border: "1px solid black",
                          backgroundColor: "white",
                          padding: "1rem",
                          borderRadius: "6px",
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <label htmlFor="school">
                            School<span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="school"
                            type="text"
                            name="school"
                            value={editSchool}
                            placeholder="School"
                            onChange={(e) => setEditSchool(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="educationDegree">
                            Degree<span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="educationDegree"
                            type="text"
                            name="educationDegree"
                            value={editDegree}
                            placeholder="Degree"
                            onChange={(e) => setEditDegree(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="educationLocation">
                            Location<span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            id="educationLocation"
                            type="text"
                            name="educationLocation"
                            value={editEducationLocation}
                            placeholder="Location"
                            onChange={(e) =>
                              setEditEducationLocation(e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className={styles.row}>
                          <div>
                            <label htmlFor="educationAttainment">
                              Highest Educational Attainment
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <select
                              id="educationAttainment"
                              name="educationAttainment"
                              value={editEducationAttainment}
                              onChange={(e) =>
                                setEditEducationAttainment(e.target.value)
                              }
                            >
                              <option value="">
                                Select Highest Educational Attainment
                              </option>
                              <option value="Elementary">Elementary</option>
                              <option value="High School">High School</option>
                              <option value="Senior High School">
                                Senior High School
                              </option>
                              <option value="Vocational">Vocational</option>
                              <option value="College">College</option>
                              <option value="Post Graduate">
                                Post Graduate
                              </option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="educationStartDate">
                              Start Date<span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              id="educationStartDate"
                              type="number"
                              min="1900"
                              max="2099"
                              name="educationStartDate"
                              value={editEducationStartDate}
                              placeholder="Start Year"
                              onChange={(e) =>
                                setEditEducationStartDate(e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="educationEndDate">
                              End Date<span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              id="educationEndDate"
                              type="number"
                              min="1900"
                              max="2099"
                              name="educationEndDate"
                              value={editEducationEndDate}
                              placeholder="End Year"
                              onChange={(e) =>
                                setEditEducationEndDate(e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.workExperiencesRow}>
                      <label>Work Experience (Optional)</label>
                      {workExperiences.map(
                        (exp: WorkExperience, idx: number) => (
                          <div
                            className={styles.rowInput}
                            key={idx}
                            style={{
                              marginBottom: "1rem",
                              border: "1px solid black",
                              backgroundColor: "white",
                              padding: "1rem",
                              borderRadius: "6px",
                            }}
                          >
                            <div>
                              <label htmlFor={`company-${idx}`}>Company</label>
                              <input
                                id={`company-${idx}`}
                                type="text"
                                name={`company-${idx}`}
                                value={exp.company ?? ""}
                                placeholder="Company"
                                onChange={(e) => {
                                  const newArr = [...workExperiences];
                                  newArr[idx].company = e.target.value;
                                  setWorkExperiences(newArr);
                                }}
                              />
                            </div>
                            <div>
                              <label htmlFor={`position-${idx}`}>
                                Position
                              </label>
                              <input
                                id={`position-${idx}`}
                                type="text"
                                name={`position-${idx}`}
                                value={exp.position ?? ""}
                                placeholder="Position"
                                onChange={(e) => {
                                  const newArr = [...workExperiences];
                                  newArr[idx].position = e.target.value;
                                  setWorkExperiences(newArr);
                                }}
                              />
                            </div>
                            <div>
                              <label htmlFor={`location-${idx}`}>
                                Location
                              </label>
                              <input
                                id={`location-${idx}`}
                                type="text"
                                name={`location-${idx}`}
                                value={exp.location ?? ""}
                                placeholder="Location"
                                onChange={(e) => {
                                  const newArr = [...workExperiences];
                                  newArr[idx].location = e.target.value;
                                  setWorkExperiences(newArr);
                                }}
                              />
                            </div>
                            <div>
                              <label htmlFor={`startDate-${idx}`}>
                                Start Date
                              </label>
                              <input
                                id={`startDate-${idx}`}
                                type="number"
                                min="1800"
                                max="2099"
                                name={`startDate-${idx}`}
                                value={exp.start_date ?? ""}
                                placeholder="Start Date"
                                onChange={(e) => {
                                  const newArr = [...workExperiences];
                                  newArr[idx].start_date = e.target.value;
                                  setWorkExperiences(newArr);
                                }}
                              />
                            </div>
                            <div>
                              <label htmlFor={`endDate-${idx}`}>End Date</label>
                              <input
                                id={`endDate-${idx}`}
                                type="number"
                                min="1800"
                                max="2099"
                                name={`endDate-${idx}`}
                                value={exp.end_date ?? ""}
                                placeholder="End Date"
                                onChange={(e) => {
                                  const newArr = [...workExperiences];
                                  newArr[idx].end_date = e.target.value;
                                  setWorkExperiences(newArr);
                                }}
                              />
                            </div>
                            {workExperiences.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setWorkExperiences(
                                    workExperiences.filter((_, i) => i !== idx)
                                  )
                                }
                                style={{ marginTop: "1rem" }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setWorkExperiences([
                            ...workExperiences,
                            {
                              company: "",
                              position: "",
                              location: "",
                              start_date: "",
                              end_date: "",
                            },
                          ])
                        }
                        style={{ marginTop: "1rem" }}
                      >
                        Add Work Experience
                      </button>
                    </div>

                    <div>
                      <label>Skills</label>
                      <div className={`${styles.row} ${styles.skillsRow}`}>
                        {skills.map((skill: string, idx: number) => (
                          <span key={idx} style={{ marginRight: "-1rem" }}>
                            {skill}
                            <button
                              type="button"
                              onClick={() =>
                                setSkills(skills.filter((_, i) => i !== idx))
                              }
                              style={{ marginLeft: 4 }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          name="skills"
                          value={newSkill}
                          placeholder="Add Skills"
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newSkill.trim()) {
                              setSkills([...skills, newSkill.trim()]);
                              setNewSkill("");
                              e.preventDefault();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSkill.trim()) {
                              setSkills([...skills, newSkill.trim()]);
                              setNewSkill("");
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="introduction">
                        Introduction<span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        name="introduction"
                        value={editIntroduction}
                        placeholder="Tell About Yourself..."
                        rows={3}
                        cols={40}
                        style={{ width: "100%" }}
                        onChange={(e) => setEditIntroduction(e.target.value)}
                        required
                      />
                    </div>

                    {/* Actions inside the form for proper submit */}
                    <div style={{ marginTop: "1rem", display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className={styles.resumeButton}
                        onClick={() => setShowEditResume(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.resumeButton}>
                        Save
                      </button>
                    </div>
                  </form>
                ) : resume ? (
                  <div className={styles.resume}>
                    <Resume
                      ref={resumeRef}
                      profilePicUrl={
                        user.profile_pic_url
                          ? user.profile_pic_url + "?t=" + dateNow
                          : "/assets/images/default_profile.png"
                      }
                      name={user?.name}
                      birthDate={user?.birth_date}
                      address={user?.address}
                      barangay={user?.barangay}
                      district={user?.district}
                      email={user?.email}
                      phone={user?.phone}
                      education={{
                        school: resume?.education?.school,
                        degree: resume?.education?.degree,
                        location: resume?.education?.location,
                        start_date: resume?.education?.start_date,
                        end_date: resume?.education?.end_date,
                      }}
                      skills={resume?.skills}
                      workExperiences={
                        Array.isArray(resume?.work_experiences)
                          ? resume.work_experiences
                          : resume?.work_experiences
                          ? [resume.work_experiences]
                          : []
                      }
                      profileIntroduction={resume?.profile_introduction}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "2rem 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <h3>No resume found.</h3>
                    <p>Click below to create your resume.</p>
                    <button
                      className={styles.createResumeButton}
                      onClick={() => setShowEditResume(true)}
                    >
                      Create Resume
                    </button>
                  </div>
                )}
              </>
            )}

            {resume &&
            !showEditResume &&
            profileOptionsNav !== "appliedJobs" ? (
              <div style={{ marginTop: "1rem", display: "flex", gap: 8 }}>
                <button
                  className={styles.resumeButton}
                  onClick={handleDownload}
                >
                  Download Resume
                </button>
                <button
                  className={styles.resumeButton}
                  onClick={() => setShowEditResume(true)}
                >
                  Edit Resume
                </button>
              </div>
            ) : null}

            {profileOptionsNav === "appliedJobs" && (
              <div className={styles.appliedJobs}>{jobCards}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
