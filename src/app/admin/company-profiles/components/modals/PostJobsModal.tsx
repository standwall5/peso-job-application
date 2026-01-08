import React, { useState, useEffect, useRef } from "react";
import styles from "./PostJobsModal.module.css";
import Modal from "./Modal";
import ConfirmCloseModal from "./ConfirmCloseModal";
import { Exam as ExamType } from "../exam/Exam";
import ExamList from "../exam/ExamList";
import Button from "@/components/Button";
import SkillsInput from "@/components/SkillsInput";
import { CompanyWithStats } from "../../types/company.types";
import Cropper from "react-easy-crop";

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

interface Jobs {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  exam_id?: number | null;
  skills?: string[];
  icon_url?: string | null;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface PostJobsModalProps {
  company: CompanyWithStats;
  job: Jobs;
  exams: ExamType[];
  fetchExams: () => void;
  onClose?: () => void;
  refetchJobs?: () => void;
}

const PostJobsModal: React.FC<PostJobsModalProps> = ({
  company,
  job,
  onClose,
  exams,
  fetchExams,
  refetchJobs,
}) => {
  // Track which exam is selected for this job
  const [selectedExamId, setSelectedExamId] = useState<number | null>(
    job?.exam_id ?? null,
  );

  // Track skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    job?.skills || [],
  );

  // Icon upload states
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(
    job?.icon_url || null,
  );
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Track form changes
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Store initial values
  const initialValuesRef = useRef({
    title: job.title,
    poa: job.place_of_assignment,
    sex: job.sex,
    education: job.education,
    eligibility: job.eligibility,
    examId: job.exam_id ?? null,
    skills: job.skills || [],
    iconUrl: job.icon_url || null,
  });

  console.log("PostJobsModal - selectedExamId:", selectedExamId);
  console.log("PostJobsModal - job.exam_id:", job?.exam_id);
  console.log("PostJobsModal - full job:", job);

  // Check if form has changes
  const checkForChanges = (formData?: FormData) => {
    if (formData) {
      const currentTitle = formData.get("title") as string;
      const currentPoa = formData.get("poa") as string;
      const currentSex = formData.get("gender") as string;
      const currentEducation = formData.get("education") as string;
      const currentEligibility = formData.get("eligibility") as string;

      const hasFormChanges =
        currentTitle !== initialValuesRef.current.title ||
        currentPoa !== initialValuesRef.current.poa ||
        currentSex !== initialValuesRef.current.sex ||
        currentEducation !== initialValuesRef.current.education ||
        currentEligibility !== initialValuesRef.current.eligibility;

      const hasExamChange = selectedExamId !== initialValuesRef.current.examId;

      const hasSkillsChange =
        JSON.stringify(selectedSkills.sort()) !==
        JSON.stringify(initialValuesRef.current.skills.sort());

      const hasIconChange = iconPreview !== initialValuesRef.current.iconUrl;

      return (
        hasFormChanges || hasExamChange || hasSkillsChange || hasIconChange
      );
    }

    // Check if exam selection or skills or icon changed
    const hasExamChange = selectedExamId !== initialValuesRef.current.examId;
    const hasSkillsChange =
      JSON.stringify(selectedSkills.sort()) !==
      JSON.stringify(initialValuesRef.current.skills.sort());
    return hasExamChange || hasSkillsChange;
  };

  // Update hasChanges when inputs change
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    const handleInput = () => {
      const formData = new FormData(form);
      setHasChanges(checkForChanges(formData));
    };

    // Add event listeners to all form inputs
    const inputs = form.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleInput);
    });

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleInput);
      });
    };
  }, [selectedExamId, selectedSkills]); // NEW: Add selectedSkills to dependencies

  const handleExamSelect = (examId: number) => {
    setSelectedExamId(examId);
    // Check if this creates a change
    setHasChanges(examId !== initialValuesRef.current.examId);
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    const hasSkillsChange =
      JSON.stringify(skills.sort()) !==
      JSON.stringify(initialValuesRef.current.skills.sort());
    setHasChanges(hasSkillsChange);
  };

  // Handle icon file selection
  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
      setIconFile(file);
    }
  };

  // Handle crop complete
  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Save cropped image
  const handleSaveCrop = async () => {
    if (!tempImageSrc || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      setIconPreview(croppedImage);
      setShowCropModal(false);
      setHasChanges(true);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  // Remove icon
  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    setHasChanges(true);
  };

  // Crop image helper function
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      }, "image/jpeg");
    });
  };

  // Handle close with confirmation
  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      if (onClose) onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    if (onClose) onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  // ######################### Handle submit for job submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Upload icon if changed
    let uploadedIconUrl = iconPreview;
    if (iconFile && iconPreview && iconPreview !== job.icon_url) {
      // Convert blob URL to file
      const blob = await fetch(iconPreview).then((r) => r.blob());
      const file = new File([blob], `job-icon-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("jobId", job.id.toString());

      const uploadResponse = await fetch("/api/upload-job-icon", {
        method: "POST",
        body: uploadFormData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        uploadedIconUrl = uploadData.url;
      }
    }

    const jobData = {
      company_id: company.id,
      title: formData.get("title") as string,
      description: job.description,
      place_of_assignment: formData.get("poa") as string,
      sex: formData.get("gender") as string,
      education: formData.get("education") as string,
      eligibility: formData.get("eligibility") as string,
      exam_id: selectedExamId,
      skills: selectedSkills,
      icon_url: uploadedIconUrl,
    };

    try {
      let response;
      if (job && job.id) {
        // Edit existing job
        response = await fetch(`/api/jobs?id=${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      } else {
        // Create new job
        response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save job");
      }

      if (refetchJobs) refetchJobs();

      // Reset hasChanges since we successfully saved
      setHasChanges(false);

      // Close modal without confirmation
      if (onClose) onClose();
    } catch (err) {
      // Handle error (show toast, etc.)
      console.error(err);
    }
  };

  return (
    <>
      <Modal onClose={handleCloseAttempt}>
        <div className={styles.header}>
          <span>
            <img
              src={company.logo || "/assets/images/default_profile.png"}
              alt={company.name}
            />

            <h2>{company.name}</h2>
          </span>
          <span>Edit Job</span>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.jobContainer}>
            <form onSubmit={handleSubmit}>
              <label htmlFor="poa">Place of Assignment</label>
              <input
                id="poa"
                type="text"
                name="poa"
                defaultValue={job.place_of_assignment}
                required
              />

              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                type="text"
                name="title"
                defaultValue={job.title}
                required
              />

              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" defaultValue={job.sex} required>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Any">Any</option>
              </select>

              <label htmlFor="education">Education</label>
              <select
                id="education"
                name="education"
                defaultValue={job.education}
                required
              >
                <option value="Senior High School or Graduate">
                  Senior High School or Graduate
                </option>
                <option value="College Graduate">College Graduate</option>
                <option value="Any">Any</option>
              </select>

              <label htmlFor="eligibility">Eligibility</label>
              <select
                id="eligibility"
                name="eligibility"
                defaultValue={job.eligibility}
                required
              >
                <option value="With or without experience">
                  With or without experience
                </option>
                <option value="Experienced">Experienced</option>
              </select>

              {/* Skills Input */}
              <div style={{ marginTop: "1rem" }}>
                <SkillsInput
                  skills={selectedSkills}
                  onSkillsChange={handleSkillsChange}
                  placeholder="Search and add required skills..."
                  label="Required Skills"
                  required={false}
                />
              </div>

              {/* Job Icon Upload */}
              <div style={{ marginTop: "1rem" }}>
                <label>Job Icon (Optional)</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {iconPreview && (
                    <div style={{ position: "relative" }}>
                      <img
                        src={iconPreview}
                        alt="Job icon preview"
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "cover",
                          borderRadius: "0.375rem",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveIcon}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconSelect}
                    style={{ display: "none" }}
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#3498db",
                      color: "white",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    {iconPreview ? "Change Icon" : "Upload Icon"}
                  </label>
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "0.5rem",
                  }}
                >
                  Upload a custom icon for this job posting. Square images work
                  best.
                </p>
              </div>

              <Button variant="success" style={{ marginTop: "1rem" }}>
                Post Job
              </Button>
            </form>
          </div>
          <div className={styles.exam}>
            {/*Selected Exam Id is tied to a certain job*/}
            {/*Need a post request that puts the job and the changes*/}
            <h3>Exams</h3>
            <ExamList
              exams={exams}
              selectedExamId={selectedExamId}
              onSelect={(exam) => handleExamSelect(exam.id)}
            />
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      {showConfirmClose && (
        <ConfirmCloseModal
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      )}

      {/* Crop Modal */}
      {showCropModal && tempImageSrc && (
        <Modal onClose={() => setShowCropModal(false)}>
          <div style={{ padding: "1rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Crop Job Icon</h3>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                background: "#000",
              }}
            >
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#64748b",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </button>
              <Button variant="success" onClick={handleSaveCrop}>
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PostJobsModal;
