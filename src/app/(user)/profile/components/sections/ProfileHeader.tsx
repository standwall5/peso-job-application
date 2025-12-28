// src/app/(user)/profile/components/sections/ProfileHeader.tsx
import React from "react";
import Button from "@/components/Button";
import styles from "../Profile.module.css";
import { User } from "../../types/profile.types";

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
}) => {
  return (
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

        <h4>{user?.name || "No name"}</h4>

        {showEdit ? (
          <form
            className={styles.profileDetailsInfo}
            onSubmit={onSaveProfileDetails}
          >
            <span>
              <strong>PHONE:</strong>
              <Button className="grey-button" variant="warning">
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
              </Button>
            </span>
            <span>
              <strong>EMAIL:</strong>
              <Button className="grey-button" variant="warning">
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
              </Button>
            </span>
            <span>
              <strong>PREFERRED PLACE OF ASSIGNMENT: </strong>
              <input
                type="text"
                placeholder={
                  user?.preferred_poa || "No preferred place of assignment"
                }
                value={editPreferredPoa}
                name="preferred_poa"
                onChange={(e) => setEditPreferredPoa(e.target.value)}
              />
            </span>
            <span>
              <strong>APPLICANT TYPE: </strong>
              <input
                type="text"
                placeholder={user?.applicant_type || "No applicant type"}
                value={editApplicantType}
                name="applicant_type"
                onChange={(e) => setEditApplicantType(e.target.value)}
              />
            </span>
            <Button variant="success">Save</Button>
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
              <p>{user?.preferred_poa || "No preferred place of assignment"}</p>
            </span>
            <span>
              <strong>APPLICANT TYPE: </strong>
              <p>{user?.applicant_type || "No applicant type"}</p>
            </span>
          </div>
        )}

        <Button
          className="grey-button"
          onClick={onShowEditToggle}
          type="submit"
          variant="warning"
        >
          {showEdit ? "Exit" : "Edit"}
        </Button>
      </div>
    </div>
  );
};
