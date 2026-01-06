// src/app/(user)/profile/hooks/useProfileEdit.ts
import { useState, useEffect } from "react";
import { User, ResumeData, WorkExperience } from "../types/profile.types";

export const useProfileEdit = (
  user: User | null,
  resume: ResumeData | null,
) => {
  // Profile details
  const [editPreferredPoa, setEditPreferredPoa] = useState("");
  const [editApplicantType, setEditApplicantType] = useState("");

  // Resume fields
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSex, setEditSex] = useState("");
  const [editBarangay, setEditBarangay] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editEducationAttainment, setEditEducationAttainment] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editIntroduction, setEditIntroduction] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editEducationLocation, setEditEducationLocation] = useState("");
  const [editEducationStartDate, setEditEducationStartDate] = useState("");
  const [editEducationEndDate, setEditEducationEndDate] = useState("");

  // Skills and work experience
  const [skills, setSkills] = useState<string[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  // Sync profile details when user changes
  useEffect(() => {
    setEditPreferredPoa(user?.preferred_poa ?? "");
    setEditApplicantType(user?.applicant_type ?? "");
  }, [user]);

  // Sync resume fields when user/resume changes
  useEffect(() => {
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
  }, [user, resume]);

  // Sync work experiences
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

  // Sync skills
  useEffect(() => {
    if (Array.isArray(resume?.skills)) {
      setSkills(resume.skills);
    } else {
      setSkills([]);
    }
  }, [resume]);

  return {
    editPreferredPoa,
    setEditPreferredPoa,
    editApplicantType,
    setEditApplicantType,
    editName,
    setEditName,
    editBirthDate,
    setEditBirthDate,
    editAddress,
    setEditAddress,
    editSex,
    setEditSex,
    editBarangay,
    setEditBarangay,
    editDistrict,
    setEditDistrict,
    editEducationAttainment,
    setEditEducationAttainment,
    editDegree,
    setEditDegree,
    editIntroduction,
    setEditIntroduction,
    editSchool,
    setEditSchool,
    editEducationLocation,
    setEditEducationLocation,
    editEducationStartDate,
    setEditEducationStartDate,
    editEducationEndDate,
    setEditEducationEndDate,
    skills,
    setSkills,
    workExperiences,
    setWorkExperiences,
  };
};
