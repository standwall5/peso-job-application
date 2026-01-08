// src/app/(user)/profile/components/sections/ProfileHeader.tsx
import React, { useState } from "react";
import Button from "@/components/Button";
import styles from "../Profile.module.css";
import { User } from "../../types/profile.types";
import { EditContactModal } from "../modals/EditContactModal";

// Import constants from signup
const PREFERRED_PLACES = ["Paranaque", "Las Piñas", "Muntinlupa"] as const;

const APPLICANT_TYPES = [
  "Student",
  "Indigenous Person (IP)",
  "Out of School Youth",
  "Person with Disability (PWD)",
  "Rehabilitation Program Graduate",
  "Reintegrated Individual (Former Detainee)",
  "Returning Overseas Filipino Worker (OFW)",
  "Senior Citizen",
  "Solo Parent/Single Parent",
  "Others",
] as const;

interface ProfileHeaderProps {
  user: User;
  dateNow: number;
  showEdit: boolean;
  editPreferredPoa: string;
  editApplicantType: string;
  onShowEditToggle: () => void;
  onProfilePicClick: () => void;
  onSaveProfileDetails: (e: React.FormEvent) => void;
  setEditPreferredPoa: (value: string) => void;
  setEditApplicantType: (value: string) => void;
  onDataRefresh: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  dateNow,
  showEdit,
  editPreferredPoa,
  editApplicantType,
  onShowEditToggle,
  onProfilePicClick,
  onSaveProfileDetails,
  setEditPreferredPoa,
  setEditApplicantType,
  onDataRefresh,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<"email" | "phone" | "name">("email");

  const handleOpenEditModal = (type: "email" | "phone" | "name") => {
    setEditType(type);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    // Trigger parent component to refresh data
    onDataRefresh();
  };

  return (
    <>
      <EditContactModal
        show={showEditModal}
        type={editType}
        currentValue={
          editType === "email"
            ? user.email
            : editType === "phone"
              ? user.phone
              : user.name
        }
        onClose={() => setShowEditModal(false)}
        onSuccess={handleModalSuccess}
      />

      <div className={styles.profileDetailsContainer}>
        <div className={styles.profileDetailsContent}>
          <div className={styles.profileDetailsImage}>
            <div
              className={styles.profilePicWrapper}
              style={{ cursor: "pointer" }}
              onClick={onProfilePicClick}
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

          <div className={styles.nameContainer}>
            <h4>{user?.name || "No name"}</h4>
            <button
              className={styles.editNameButton}
              onClick={() => handleOpenEditModal("name")}
              title="Edit name"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13L2 21l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l12.932-12.931Zm0 0L19.5 7.125"
                />
              </svg>
            </button>
          </div>

          {showEdit ? (
            <form
              className={styles.profileDetailsInfo}
              onSubmit={onSaveProfileDetails}
            >
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                  PHONE
                </span>
                <span className={styles.infoValue}>
                  {user?.phone || "Not set"}
                </span>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => handleOpenEditModal("phone")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13L2 21l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l12.932-12.931Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  EMAIL
                </span>
                <span className={styles.infoValue}>
                  {user?.email || "Not set"}
                </span>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => handleOpenEditModal("email")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13L2 21l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l12.932-12.931Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  PREFERRED PLACE
                </span>
                <select
                  value={editPreferredPoa}
                  name="preferred_poa"
                  onChange={(e) => setEditPreferredPoa(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select preferred place</option>
                  {PREFERRED_PLACES.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  APPLICANT TYPE
                </span>
                <select
                  value={editApplicantType}
                  name="applicant_type"
                  onChange={(e) => setEditApplicantType(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select applicant type</option>
                  {APPLICANT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.buttonRow}>
                <Button
                  type="button"
                  variant="warning"
                  onClick={onShowEditToggle}
                >
                  Cancel
                </Button>
                <Button variant="success">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className={styles.profileDetailsInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                  PHONE
                </span>
                <p>{user?.phone || "Not set"}</p>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  EMAIL
                </span>
                <p>{user?.email || "Not set"}</p>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  PREFERRED PLACE
                </span>
                <p>{user?.preferred_poa || "Not set"}</p>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  APPLICANT TYPE
                </span>
                <p>{user?.applicant_type || "Not set"}</p>
              </div>
            </div>
          )}

          {!showEdit && (
            <Button
              className="grey-button"
              onClick={onShowEditToggle}
              type="button"
              variant="warning"
            >
              Edit Details
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
