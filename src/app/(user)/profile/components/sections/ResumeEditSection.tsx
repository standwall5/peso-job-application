// src/app/(user)/profile/components/sections/ResumeEditSection.tsx
import React from "react";
import Button from "@/components/Button";
import styles from "../Profile.module.css";
import { User, WorkExperience } from "../../types/profile.types";

interface ResumeEditSectionProps {
  user: User | null;
  editName: string;
  editBirthDate: string;
  editAddress: string;
  editSex: string;
  editBarangay: string;
  editDistrict: string;
  editEducationAttainment: string;
  editDegree: string;
  editSchool: string;
  editEducationLocation: string;
  editEducationStartDate: string;
  editEducationEndDate: string;
  editIntroduction: string;
  skills: string[];
  newSkill: string;
  workExperiences: WorkExperience[];
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  setEditName: (value: string) => void;
  setEditBirthDate: (value: string) => void;
  setEditAddress: (value: string) => void;
  setEditSex: (value: string) => void;
  setEditBarangay: (value: string) => void;
  setEditDistrict: (value: string) => void;
  setEditEducationAttainment: (value: string) => void;
  setEditDegree: (value: string) => void;
  setEditSchool: (value: string) => void;
  setEditEducationLocation: (value: string) => void;
  setEditEducationStartDate: (value: string) => void;
  setEditEducationEndDate: (value: string) => void;
  setEditIntroduction: (value: string) => void;
  setSkills: (skills: string[]) => void;
  setNewSkill: (value: string) => void;
  setWorkExperiences: (experiences: WorkExperience[]) => void;
}

export const ResumeEditSection: React.FC<ResumeEditSectionProps> = ({
  user,
  editName,
  editBirthDate,
  editAddress,
  editSex,
  editBarangay,
  editDistrict,
  editEducationAttainment,
  editDegree,
  editSchool,
  editEducationLocation,
  editEducationStartDate,
  editEducationEndDate,
  editIntroduction,
  skills,
  newSkill,
  workExperiences,
  onCancel,
  onSave,
  setEditName,
  setEditBirthDate,
  setEditAddress,
  setEditSex,
  setEditBarangay,
  setEditDistrict,
  setEditEducationAttainment,
  setEditDegree,
  setEditSchool,
  setEditEducationLocation,
  setEditEducationStartDate,
  setEditEducationEndDate,
  setEditIntroduction,
  setSkills,
  setNewSkill,
  setWorkExperiences,
}) => {
  return (
    <form className={styles.editResume} onSubmit={onSave}>
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
          <label htmlFor="address">Address (House number, Street, etc.)</label>
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
                <option value="Marcelo Green">Marcelo Green</option>
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
          className={`${styles.rowInput} ${styles.educationInput}`}
          style={{
            marginBottom: "1rem",
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
              onChange={(e) => setEditEducationLocation(e.target.value)}
              required
            />
          </div>

          <div className={`${styles.row} `}>
            <div>
              <label htmlFor="educationAttainment">
                Highest Educational Attainment
                <span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="educationAttainment"
                name="educationAttainment"
                value={editEducationAttainment}
                onChange={(e) => setEditEducationAttainment(e.target.value)}
              >
                <option value="">Select Highest Educational Attainment</option>
                <option value="Elementary">Elementary</option>
                <option value="High School">High School</option>
                <option value="Senior High School">Senior High School</option>
                <option value="Vocational">Vocational</option>
                <option value="College">College</option>
                <option value="Post Graduate">Post Graduate</option>
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
                onChange={(e) => setEditEducationStartDate(e.target.value)}
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
                onChange={(e) => setEditEducationEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.workExperiencesRow}>
        <label>Work Experience (Optional)</label>
        {workExperiences.map((exp: WorkExperience, idx: number) => (
          <div
            className={`${styles.rowInput} ${styles.workInput}`}
            key={idx}
            style={{
              marginBottom: "1rem",
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
              <label htmlFor={`startDate-${idx}`}>Start Date</label>
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
              <Button
                type="button"
                onClick={() =>
                  setWorkExperiences(
                    workExperiences.filter((_, i) => i !== idx),
                  )
                }
                style={{ marginTop: "1rem" }}
                variant="danger"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
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
          variant="success"
        >
          Add Work Experience
        </Button>
      </div>

      <div>
        <label>Skills</label>
        <div className={`${styles.row} ${styles.skillsRow}`}>
          {skills.map((skill: string, idx: number) => (
            <span key={idx} style={{ marginRight: "-1rem" }}>
              {skill}
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
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
          <Button
            type="button"
            onClick={() => {
              if (newSkill.trim()) {
                setSkills([...skills, newSkill.trim()]);
                setNewSkill("");
              }
            }}
            variant="success"
          >
            +
          </Button>
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

      <div style={{ marginTop: "1rem", display: "flex", gap: 8 }}>
        <Button
          type="button"
          className={styles.resumeButton}
          onClick={onCancel}
          variant="warning"
        >
          Cancel
        </Button>
        <Button type="submit" className={styles.resumeButton} variant="primary">
          Save
        </Button>
      </div>
    </form>
  );
};
