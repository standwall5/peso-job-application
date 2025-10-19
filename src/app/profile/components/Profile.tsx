"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./Profile.module.css";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import Resume from "./Resume";
import BlocksWave from "@/components/BlocksWave";
import Link from "next/link";
import Toast from "@/components/toast/Toast";

function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
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

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [resume, setResume] = useState<any>(null);
  const [showEditResume, setShowEditResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileOptionsNav, setProfileOptionsNav] = useState("viewResume");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const resumeRef = useRef<HTMLDivElement>(null);

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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [workExperiences, setWorkExperiences] = useState<any>(null);

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

  useEffect(() => {
    async function fetchAll() {
      try {
        const userResponse = await fetch("/api/getUser");
        const resumeResponse = await fetch("/api/getResume");
        const userData = await userResponse.json();
        const resumeData = await resumeResponse.json();
        setUser(userData || null);
        setResume(resumeData || null);
      } catch (err) {
        console.error("Fetch failed:", err);
        setUser(null);
        setResume(null);
      } finally {
        setLoading(false);
        console.log(resume);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (showEditSuccess) {
      async function fetchAll() {
        try {
          const userResponse = await fetch("/api/getUser");
          const userData = await userResponse.json();
          setUser(userData || null);
        } catch (err) {
          console.error("Fetch failed:", err);
          setUser(null);
        }
      }
      fetchAll();
    }
  }, [showEditSuccess]);

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
      // ...other fields
    }
  }, [showEditResume, user, resume]);

  useEffect(() => {
    setEditSchool(resume?.education?.school ?? "");
    setEditEducationLocation(resume?.education?.location ?? "");
    setEditEducationStartDate(resume?.education?.start_date ?? "");
    setEditEducationEndDate(resume?.education?.end_date ?? "");
  }, [resume, showEditResume]);

  // When initializing or syncing workExperiences state:
  useEffect(() => {
    if (resume?.work_experiences) {
      if (Array.isArray(resume.work_experiences)) {
        setWorkExperiences(resume.work_experiences);
      } else {
        setWorkExperiences([resume.work_experiences]); // wrap single object in array
      }
    } else {
      setWorkExperiences([{ company: "", start_date: "", end_date: "" }]);
    }
  }, [resume]);

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
        skills: skills,
        work_experiences: workExperiences,
        profile_introduction: editIntroduction,
        // ...other fields as needed
      }),
    });
    setShowEditSuccess(true);
  };
  // ...and so on for other fields

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

  const onCropComplete = useCallback((_: any, area: any) => {
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
      setUser((prev: any) => ({
        ...prev,
        profile_pic_url: result.url + "?t=" + dateNow,
      }));
    }
    setUploading(false);
    setShowModal(false);
    setSelectedFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };
  useEffect(() => {
    if (showEditSuccess) {
      const timer = setTimeout(() => setShowEditSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showEditSuccess]);
  if (loading) return <BlocksWave />;
  if (!user) return <div>No user found.</div>;

  // Success Modal

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
            <h3
              style={{
                textAlign: "center",
              }}
            >
              Edit Profile Picture
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Show current profile pic if no file selected */}
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

              {/* Show cropper if file selected */}
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
            {/* {showEditSuccess && (
              
            )} */}

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
            {profileOptionsNav === "viewResume" &&
              (editIntroduction === "" && showEditResume ? (
                <>
                  <form className={styles.editResume}>
                    <h2>Personal Information</h2>
                    <div className={styles.row}>
                      <div>
                        <label htmlFor="name">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editName}
                          placeholder="Full Name"
                          // onChange={...}
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
                          // onChange={...}
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
                          // onChange={...}
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
                          // onChange={...}
                          onChange={(e) => setEditAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="barangay">Barangay</label>
                        <select
                          name="barangay"
                          value={editBarangay}
                          // onChange={...}
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
                            setEditDistrict(e.target.value); // reset barangay when district changes
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
                          <label htmlFor="school">School</label>
                          <input
                            id="school"
                            type="text"
                            name="school"
                            value={editSchool}
                            placeholder="School"
                            onChange={(e) => setEditSchool(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="educationLocation">Location</label>
                          <input
                            id="educationLocation"
                            type="text"
                            name="educationLocation"
                            value={editEducationLocation}
                            placeholder="Location"
                            onChange={(e) =>
                              setEditEducationLocation(e.target.value)
                            }
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
                              Start Date
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
                            />
                          </div>
                          <div>
                            <label htmlFor="educationEndDate">End Date</label>
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
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.workExperiencesRow}>
                      <label>Work Experience (Optional)</label>
                      {workExperiences.map((exp, idx) => (
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
                            <label htmlFor={`position-${idx}`}>Position</label>
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
                            <label htmlFor={`location-${idx}`}>Location</label>
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
                      ))}
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
                      <label>
                        Skills<span style={{ color: "red" }}>*</span>
                      </label>
                      <div className={`${styles.row} ${styles.skillsRow}`}>
                        {skills.map((skill, idx) => (
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
                        // onChange={...}
                        onChange={(e) => setEditIntroduction(e.target.value)}
                      />
                    </div>
                  </form>
                </>
              ) : editIntroduction === "" ? (
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
              ) : (
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
                    workExperiences={resume?.work_experiences}
                    profileIntroduction={resume?.profile_introduction}
                  />
                </div>
              ))}
            {editIntroduction === "" && showEditResume ? (
              <>
                <button
                  className={styles.resumeButton}
                  onClick={() => setShowEditResume((prev) => !prev)}
                >
                  Cancel
                </button>
                <button
                  className={styles.resumeButton}
                  onClick={handleResumeSave}
                >
                  Save
                </button>
              </>
            ) : editIntroduction === "" ? (
              <>
                {/* <button
                  className={`${styles.resumeButton} ${styles.createResumeButton}`}
                  onClick={() => setShowEditResume((prev) => !prev)}
                >
                  Create Resume
                </button> */}
              </>
            ) : (
              <>
                <button
                  className={styles.resumeButton}
                  onClick={handleDownload}
                >
                  Download Resume
                </button>
                <button
                  className={styles.resumeButton}
                  onClick={() => setShowEditResume((prev) => !prev)}
                >
                  Edit Resume
                </button>
              </>
            )}
            {profileOptionsNav === "appliedJobs" && (
              <div className={styles.appliedJobs}>
                {/* Render exam content here */}
                <p>Exam section for this job/applicant.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
