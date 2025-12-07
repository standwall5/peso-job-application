"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./SignUp.module.css";
import { signup } from "@/lib/auth-actions";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// import { Fascinate_Inline } from "next/font/google";

const SignUpForm: React.FC = () => {
  const [district, setDistrict] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [applicantType, setApplicantType] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    residency: "",
    address: "",
    district: "",
    preferredPlaceOfAssignment: "",
    barangay: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFormNotice, setShowFormNotice] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Controlled fields for validations that need immediate feedback
  const [gender, setGender] = useState<string>("");
  const [genderOther, setGenderOther] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  const [residency, setResidency] = useState<string>("");
  const [preferredPlace, setPreferredPlace] = useState<string>("");
  const [barangay, setbarangay] = useState<string>("");
  const [extNameValue, setExtNameValue] = useState<string>("None");

  // keep list of required fields (for submit validation)
  const requiredFields = [
    "firstName",
    "lastName",
    "address",
    "applicantType",
    "password",
    "confirmPassword",
    "validId",
    "selfieWithId",
    "acceptTerms",
  ];

  // Automatically toggle form notice based on current errors
  useEffect(() => {
    setShowFormNotice(Object.keys(errors).length > 0);
  }, [errors]);

  const calculateAge = useCallback((birthDateValue: string): number | null => {
    if (!birthDateValue) return null;
    const today = new Date();
    const birth = new Date(birthDateValue);
    if (isNaN(birth.getTime())) return null;
    if (birth > today) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : null;
  }, []);

  // birth date change: set state, compute age, validate not future
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBirthDate = e.target.value;
    setBirthDate(newBirthDate);
    const today = new Date();
    const birth = new Date(newBirthDate);
    const newErrors = { ...errors };

    if (!newBirthDate) {
      setCalculatedAge(null);
      delete newErrors.birthDate;
    } else if (isNaN(birth.getTime())) {
      newErrors.birthDate = "Invalid date";
      setCalculatedAge(null);
    } else if (birth > today) {
      newErrors.birthDate = "Birth date cannot be in the future";
      setCalculatedAge(null);
    } else {
      delete newErrors.birthDate;
      const age = calculateAge(newBirthDate);
      setCalculatedAge(age);
    }

    setErrors(newErrors);
  };

  const validatePassword = (passwordValue: string) => {
    if (passwordValue.length === 0) {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      return false;
    }
    const requirements = {
      length: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      lowercase: /[a-z]/.test(passwordValue),
      number: /\d/.test(passwordValue),
      special: /[~!@#$%^&*()_+-={}|:;"'<>,.?/]/.test(passwordValue),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);

    // clear simple password error if user types
    const newErrors = { ...errors };
    if (newPassword && newPassword.trim() !== "") delete newErrors.password;
    setErrors(newErrors);
  };

  // Phone number handlers
  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    // Value comes without the '+'
    const fullNumber = value.startsWith("63") ? "+" + value : value;
    setPhoneNumber(fullNumber);

    // Clear error if it exists (only validate on submit)
    if (errors.phoneNumber) {
      const newErrors = { ...errors };
      delete newErrors.phoneNumber;
      setErrors(newErrors);
    }
  };

  // Gender handlers
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGender(val);
    const newErrors = { ...errors };
    if (!val) newErrors.gender = "Please select gender";
    else delete newErrors.gender;
    setErrors(newErrors);
  };

  const handleSexOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setGenderOther(v);
    const newErrors = { ...errors };
    if (!v) newErrors.genderOther = "Please specify";
    else delete newErrors.genderOther;
    setErrors(newErrors);
  };

  // Email handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmailValue(v);
    const newErrors = { ...errors };
    if (!v || v.trim() === "") {
      newErrors.email = "This field is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v))
        newErrors.email = "Please enter a valid email address";
      else delete newErrors.email;
    }
    setErrors(newErrors);
  };

  // Residence handler
  const handleResidencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setResidency(v);
    const newErrors = { ...errors };
    if (!v) newErrors.recidency = "Please select Residence";
    else delete newErrors.residency;
    setErrors(newErrors);
  };
  // Barangay handler
  const handlebarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setbarangay(v);
    const newErrors = { ...errors };
    if (!v) newErrors.barangay = "Please select Barangay";
    else delete newErrors.barangay;
    setErrors(newErrors);
  };

  // Preferred place handler
  const handlePreferredPlaceChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const v = e.target.value;
    setPreferredPlace(v);
    const newErrors = { ...errors };
    if (!v)
      newErrors.preferredPlaceOfAssignment = "Please select preferred place";
    else delete newErrors.preferredPlaceOfAssignment;
    setErrors(newErrors);
  };

  // District change handler
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setDistrict(v);
    const newErrors = { ...errors };
    if (!v) newErrors.district = "Please select District";
    else delete newErrors.district;
    setErrors(newErrors);
  };

  // GENERIC input change handler to clear errors for simple required fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name;
    const value = (e.target as HTMLInputElement).value;
    const newErrors = { ...errors };

    if (newErrors[name]) {
      if (value && value.toString().trim() !== "") delete newErrors[name];
      else newErrors[name] = "This field is required";
    }
    setErrors(newErrors);
  };

  function scrollToFirstError(localErrors: Record<string, string>) {
    const form = formRef.current;
    if (!form) return;
    const firstKey = Object.keys(localErrors).find((k) => localErrors[k]);
    if (!firstKey) return;
    const el = form.elements.namedItem(firstKey) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLElement).focus?.();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formEl = e.currentTarget;
    const newErrors: Record<string, string> = {};

    // Validate required text/select/file/checkbox fields (except sex/phone/birth which we handle below)
    for (const name of requiredFields) {
      const element = formEl.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLSelectElement
        | null;
      if (!element) continue;

      if (element instanceof HTMLInputElement && element.type === "file") {
        if (!element.files || element.files.length === 0) {
          newErrors[name] = "This file is required";
        }
        continue;
      }

      if (element instanceof HTMLInputElement && element.type === "checkbox") {
        if (!element.checked) {
          newErrors[name] = "You must accept terms";
        }
        continue;
      }

      const value = (element as HTMLInputElement | HTMLSelectElement).value;
      if (!value || value.trim() === "") {
        newErrors[name] = "This field is required";
      }
    }

    // Gender validations
    if (!gender) {
      newErrors.gender = "Gender is required";
    } else if (gender === "Others") {
      if (!genderOther || genderOther.trim() === "") {
        newErrors.genderOther = "Please specify gender";
      }
    }

    // Phone validations (phone is required)
    if (!phoneNumber || phoneNumber.trim() === "") {
      newErrors.phoneNumber = "Contact number is required";
    } else if (
      !phoneNumber.startsWith("+63") &&
      !phoneNumber.startsWith("63")
    ) {
      newErrors.phoneNumber = "Only Philippines phone numbers are allowed";
    } else if (phoneNumber.replace(/\D/g, "").length !== 12) {
      newErrors.phoneNumber =
        "Please enter a valid Philippines phone number (10 digits)";
    }

    // Email validation (required)
    if (!emailValue || emailValue.trim() === "") {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Residence validation (required)
    if (!residency || residency.trim() === "") {
      newErrors.residency = "Residence is required";
    }

    // Barangay validation (required)
    if (!barangay || barangay.trim() === "") {
      newErrors.barangay = "Barangay is required";
    }

    // Preferred place validation (required)
    if (!preferredPlace || preferredPlace.trim() === "") {
      newErrors.preferredPlaceOfAssignment =
        "Preferred place of assignment is required";
    }

    // District validation
    if (!district || district.trim() === "") {
      newErrors.district = "District is required";
    }

    // Birthdate validations (can't be future)
    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    } else {
      const today = new Date();
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) newErrors.birthDate = "Invalid birth date";
      else if (birth > today)
        newErrors.birthDate = "Birth date cannot be in the future";
    }

    // Password match
    const pw = (
      formEl.elements.namedItem("password") as HTMLInputElement | null
    )?.value;
    const cpw = (
      formEl.elements.namedItem("confirmPassword") as HTMLInputElement | null
    )?.value;
    if (!pw) newErrors.password = "Password is required";
    if (!cpw) newErrors.confirmPassword = "Confirm password is required";
    if (pw && cpw && pw !== cpw) {
      newErrors.password = "Passwords do not match";
      newErrors.confirmPassword = "Passwords do not match";
      setError("Passwords do not match");
      setModal(true);
    }

    // require disability type when applicant is PWD
    if (applicantType.includes("Person with Disability (PWD)")) {
      const disability = (
        formEl.elements.namedItem("disabilityType") as HTMLSelectElement | null
      )?.value;
      if (!disability || disability.trim() === "") {
        newErrors.disabilityType = "Please select disability type";
      }
    }

    if (!applicantType || applicantType.length === 0) {
      newErrors.applicantType = "Please select at least one applicant type";
    }

    // Retrieve disability type and PWD number from form
    const disabilityType =
      (formEl.elements.namedItem("disabilityType") as HTMLSelectElement | null)
        ?.value || "";
    const pwdNumber =
      (formEl.elements.namedItem("pwdNumber") as HTMLInputElement | null)
        ?.value || "";

    // Applicant-specific ID fields OPTIONAL
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => scrollToFirstError(newErrors), 50);
      return;
    }

    // Submit
    setErrors({});
    const formData = new FormData(formEl);
    formData.set(
      "gender",
      gender === "Others" ? genderOther || "Others" : gender,
    );
    formData.set("phoneNumber", phoneNumber);
    formData.set("birthDate", birthDate);
    formData.set("email", emailValue);
    formData.set("residency", residency);
    formData.set("Barangay", barangay);
    formData.set("district", district);
    formData.set("preferredPlaceOfAssignment", preferredPlace);
    formData.set("extName", extNameValue);
    formData.set("applicantType", applicantType.join(", "));
    formData.set("disabilityType", disabilityType);
    if (pwdNumber) {
      formData.set("pwdNumber", pwdNumber);
    }

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setModal(true);
    } else if (result?.success) {
      setSuccess(result.success);
      setModal(true);
    }
  }

  const warningModal = () => (
    <div
      className={styles.modalOverlay}
      onClick={() => {
        setModal(false);
      }}
    >
      <div className={styles.warningModal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            setModal(false);
          }}
          style={{
            fontWeight: "bold",
            right: 20,
            top: 20,
            position: "absolute",
          }}
        >
          X
        </button>
        <div className={styles.warningContainer}>
          <h2>{success ? success : error}</h2>
          <div className={styles.warningContent}>
            {success ? (
              <Link href="/login" className={styles.blueButton}>
                Back to login
              </Link>
            ) : (
              <button
                onClick={() => setModal(false)}
                className={styles.redButton}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.signUpContainer}>
      {modal && warningModal()}
      <div className={styles.signUpContent}>
        <h2>REGISTER</h2>
        <form
          className={styles.signUpForm}
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
        >
          {showFormNotice && (
            <div className={styles.formNotice}>
              Please fill in the highlighted required fields.
            </div>
          )}

          {/* First row */}
          <div className={styles.field}>
            <label htmlFor="firstName" className={styles.fieldLabel}>
              First Name <span className={styles.redAsterisk}>*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              onChange={handleInputChange}
              className={errors["firstName"] ? styles.errorInput : ""}
            />
            {errors["firstName"] && (
              <div className={styles.fieldError}>{errors["firstName"]}</div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName" className={styles.fieldLabel}>
              Last Name <span className={styles.redAsterisk}>*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              onChange={handleInputChange}
              className={errors["lastName"] ? styles.errorInput : ""}
            />
            {errors["lastName"] && (
              <div className={styles.fieldError}>{errors["lastName"]}</div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="middleName" className={styles.fieldLabel}>
              Middle Name (Optional)
            </label>
            <input id="middleName" name="middleName" type="text" />
          </div>

          {/* EXT NAME as select */}
          <div className={styles.field}>
            <label htmlFor="extName" className={styles.fieldLabel}>
              Ext. Name (Optional)
            </label>
            <select
              id="extName"
              name="extName"
              value={extNameValue}
              onChange={(e) => {
                setExtNameValue(e.target.value);
                // clear error if any
                const newErrors = { ...errors };
                if (newErrors.extName) delete newErrors.extName;
                setErrors(newErrors);
              }}
              className={errors["extName"] ? styles.errorInput : ""}
            >
              <option value="">None</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
            {errors["extName"] && (
              <div className={styles.fieldError}>{errors["extName"]}</div>
            )}
          </div>

          {/* birth / age / sex row */}
          <div className={styles.fullRow}>
            <div style={{ flex: 1 }}>
              <label htmlFor="birthDate" className={styles.fieldLabel}>
                Birth Date <span className={styles.redAsterisk}>*</span>
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={handleBirthDateChange}
                className={errors["birthDate"] ? styles.errorInput : ""}
              />
              {errors["birthDate"] && (
                <div className={styles.fieldError}>{errors["birthDate"]}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="age" className={styles.fieldLabel}>
                Age <span className={styles.redAsterisk}>*</span>
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={calculatedAge !== null ? calculatedAge : ""}
                readOnly
                className={errors["age"] ? styles.errorInput : ""}
              />
              {errors["age"] && (
                <div className={styles.fieldError}>{errors["age"]}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="gender" className={styles.fieldLabel}>
                Gender <span className={styles.redAsterisk}>*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={handleGenderChange}
                className={errors["gender"] ? styles.errorInput : ""}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Others">Others</option>
              </select>
              {gender === "Others" && (
                <>
                  <input
                    id="genderOther"
                    name="genderOther"
                    type="text"
                    placeholder="Please specify"
                    value={genderOther}
                    onChange={handleSexOtherChange}
                    className={errors["genderOther"] ? styles.errorInput : ""}
                    style={{ marginTop: 8 }}
                  />
                  {errors["genderOther"] && (
                    <div className={styles.fieldError}>
                      {errors["genderOther"]}
                    </div>
                  )}
                </>
              )}
              {errors["gender"] && (
                <div className={styles.fieldError}>{errors["gender"]}</div>
              )}
            </div>
          </div>

          {/* Applicant Type (Checkbox Version) */}
          <div className={styles.fullRow}>
            <div className={styles.applicantTypeContainer}>
              <label className={styles.fieldLabel}>
                Applicant Type <span className={styles.redAsterisk}>*</span>
              </label>

              {/* CHECKBOX LIST */}
              <div className={styles.checkboxList}>
                {[
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
                ].map((type) => (
                  <label key={type} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={applicantType.includes(type)}
                      onChange={(e) => {
                        let updated = [...applicantType];

                        if (e.target.checked) {
                          updated.push(type);
                        } else {
                          updated = updated.filter((t) => t !== type);
                        }

                        setApplicantType(updated);
                        const newErrors = { ...errors };
                        if (updated.length > 0) delete newErrors.applicantType;
                        setErrors(newErrors);
                      }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>

              {errors["applicantType"] && (
                <div className={styles.fieldError}>
                  {errors["applicantType"]}
                </div>
              )}
            </div>

            {/* CONDITIONAL TEXT FIELDS */}
            <div className={styles.fullWidthBox}>
              {applicantType.includes("Student") && (
                <div className={styles.conditionalField}>
                  <label className={styles.fieldLabel}>
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {applicantType.includes("Person with Disability (PWD)") && (
                <>
                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="disabilityType"
                      className={styles.fieldLabel}
                    >
                      Disability Type{" "}
                      <span className={styles.redAsterisk}>*</span>
                    </label>
                    <select
                      id="disabilityType"
                      name="disabilityType"
                      defaultValue=""
                      className={
                        errors["disabilityType"] ? styles.errorInput : ""
                      }
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        Disability Type
                      </option>
                      <option value="Hearing">Hearing</option>
                      <option value="Visual">Visual</option>
                      <option value="Mobility">Mobility</option>
                      <option value="Intellectual">Intellectual</option>
                      <option value="Psychosocial">Psychosocial</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors["disabilityType"] && (
                      <div className={styles.fieldError}>
                        {errors["disabilityType"]}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label htmlFor="pwdNumber" className={styles.fieldLabel}>
                      PWD ID Number (Optional)
                    </label>
                    <input
                      id="pwdNumber"
                      name="pwdNumber"
                      type="text"
                      onChange={handleInputChange}
                      className={errors["pwdNumber"] ? styles.errorInput : ""}
                    />
                    {errors["pwdNumber"] && (
                      <div className={styles.fieldError}>
                        {errors["pwdNumber"]}
                      </div>
                    )}
                  </div>
                </>
              )}
              {applicantType.includes(
                "Returning Overseas Filipino Worker (OFW)",
              ) && (
                <div className={styles.conditionalField}>
                  <label className={styles.fieldLabel}>
                    OFW ID Number (Optional)
                  </label>
                  <input id="ofwNumber" name="ofwNumber" type="text" />
                </div>
              )}

              {applicantType.includes("Senior Citizen") && (
                <div className={styles.conditionalField}>
                  <label className={styles.fieldLabel}>
                    Senior Citizen ID (Optional)
                  </label>
                  <input
                    id="seniorCitizenNumber"
                    name="seniorCitizenNumber"
                    type="text"
                  />
                </div>
              )}

              {applicantType.includes("Solo Parent/Single Parent") && (
                <div className={styles.conditionalField}>
                  <label className={styles.fieldLabel}>
                    Solo Parent ID (Optional)
                  </label>
                  <input
                    id="soloParentNumber"
                    name="soloParentNumber"
                    type="text"
                  />
                </div>
              )}

              {applicantType.includes("Others") && (
                <div className={styles.conditionalField}>
                  <label className={styles.fieldLabel}>Please Specify</label>
                  <input id="othersSpecify" name="othersSpecify" type="text" />
                </div>
              )}
            </div>
          </div>

          {/* ------------------ ADDRESS SECTION ------------------ */}
          <div className={styles.addressSection}>
            <h3 className={styles.fieldLabelTitle}>
              Address Information
              <span className={styles.redAsterisk}>*</span>
            </h3>

            {/* Residency Radio Buttons */}
            <div
              className={
                errors["residency"]
                  ? `${styles.residencyOptions} ${styles.radioError}`
                  : styles.residencyOptions
              }
            >
              <label>
                <input
                  type="radio"
                  name="residency"
                  value="resident"
                  checked={formData.residency === "resident"}
                  onChange={() => {
                    setFormData({ ...formData, residency: "resident" });
                    setResidency("resident");
                    setErrors((prev: Record<string, string>) => ({
                      ...prev,
                      residency: "",
                    }));
                  }}
                />
                Resident of Parañaque
              </label>

              <label>
                <input
                  type="radio"
                  name="residency"
                  value="nonresident"
                  checked={formData.residency === "nonresident"}
                  onChange={() => {
                    setFormData({ ...formData, residency: "nonresident" });
                    setResidency("nonresident");
                    setErrors((prev: Record<string, string>) => ({
                      ...prev,
                      residency: "",
                    }));
                  }}
                />
                Non-Resident of Parañaque
              </label>
            </div>

            {/* Residency error message */}
            {errors["residency"] && (
              <div className={styles.fieldError}>{errors["residency"]}</div>
            )}

            {/* Only Address */}
            <div className={styles.fullRow}>
              <div style={{ flex: 1 }}>
                <label htmlFor="address" className={styles.fieldLabel}>
                  (House No./Street/Subdivision/City/Province){" "}
                  <span className={styles.redAsterisk}>*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  onChange={handleInputChange}
                  className={errors["address"] ? styles.errorInput : ""}
                />
                {errors["address"] && (
                  <div className={styles.fieldError}>{errors["address"]}</div>
                )}
              </div>
            </div>

            {formData.residency === "resident" && (
              <div className={styles.geographicalRow}>
                <div className={styles.leftColumn}>
                  {/* District */}
                  <div>
                    <label htmlFor="district" className={styles.fieldLabel}>
                      District <span className={styles.redAsterisk}>*</span>
                    </label>
                    <select
                      id="district"
                      name="district"
                      value={district}
                      onChange={handleDistrictChange}
                      className={errors["district"] ? styles.errorInput : ""}
                    >
                      <option value="" disabled>
                        Select District
                      </option>
                      <option value="District 1">District 1</option>
                      <option value="District 2">District 2</option>
                    </select>
                    {errors["district"] && (
                      <div className={styles.fieldError}>
                        {errors["district"]}
                      </div>
                    )}
                  </div>

                  {/* Preferred Place of Assignment */}
                  <div>
                    <label
                      htmlFor="preferredPlaceOfAssignment"
                      className={styles.fieldLabel}
                    >
                      Preferred Place of Assignment{" "}
                      <span className={styles.redAsterisk}>*</span>
                    </label>
                    <select
                      id="preferredPlaceOfAssignment"
                      name="preferredPlaceOfAssignment"
                      value={preferredPlace}
                      onChange={handlePreferredPlaceChange}
                      className={
                        errors["preferredPlaceOfAssignment"]
                          ? styles.errorInput
                          : ""
                      }
                    >
                      <option value="" disabled>
                        Select Preferred Place of Assignment
                      </option>
                      <option value="Paranaque">Paranaque</option>
                      <option value="Bacoor">Bacoor</option>
                      <option value="Las Piñas">Las Piñas</option>
                      <option value="Muntinlupa">Muntinlupa</option>
                    </select>
                    {errors["preferredPlaceOfAssignment"] && (
                      <div className={styles.fieldError}>
                        {errors["preferredPlaceOfAssignment"]}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.rightColumn}>
                  {/* Barangay */}
                  <div>
                    <label htmlFor="barangay" className={styles.fieldLabel}>
                      Barangay <span className={styles.redAsterisk}>*</span>
                    </label>
                    <select
                      id="barangay"
                      name="barangay"
                      value={barangay}
                      onChange={handlebarangayChange}
                      className={errors["barangay"] ? styles.errorInput : ""}
                    >
                      <option value="" disabled>
                        Select Barangay
                      </option>

                      {district === "District 1" && (
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

                      {district === "District 2" && (
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
                    {errors["barangay"] && (
                      <div className={styles.fieldError}>
                        {errors["barangay"]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* contact */}
          <div className={styles.fullRow}>
            <div>
              <label htmlFor="email" className={styles.fieldLabel}>
                Email <span className={styles.redAsterisk}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="@gmail.com"
                value={emailValue}
                onChange={handleEmailChange}
                className={errors["email"] ? styles.errorInput : ""}
              />
              {errors["email"] && (
                <div className={styles.fieldError}>{errors["email"]}</div>
              )}
            </div>
            <div>
              <label htmlFor="phoneNumber" className={styles.fieldLabel}>
                Contact Number <span className={styles.redAsterisk}>*</span>
              </label>
              <PhoneInput
                country={"ph"}
                onlyCountries={["ph"]}
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="917 123 4567"
                inputProps={{
                  id: "phoneNumber",
                  name: "phoneNumber",
                  required: true,
                }}
                containerClass={errors["phoneNumber"] ? styles.errorInput : ""}
                inputStyle={{ width: "100%", height: "2.6rem" }}
              />
              {errors["phoneNumber"] && (
                <div className={styles.fieldError}>{errors["phoneNumber"]}</div>
              )}
            </div>
          </div>

          {/* password */}
          <div className={styles.fullRow}>
            <div style={{ flex: 1 }}>
              <label htmlFor="password" className={styles.fieldLabel}>
                Password <span className={styles.redAsterisk}>*</span>
              </label>
              <div className={styles.passwordContainer}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={errors["password"] ? styles.errorInput : ""}
                  onChange={handlePasswordChange}
                  value={password}
                />
                {/* Show/Hide icon (eye) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((v) => !v);
                  }}
                  className={styles.iconButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye open (visible) icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.size6}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    // Eye closed (hidden) icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.size6}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors["password"] && (
                <div className={styles.fieldError}>{errors["password"]}</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="confirmPassword" className={styles.fieldLabel}>
                Confirm Password <span className={styles.redAsterisk}>*</span>
              </label>
              <div className={styles.passwordContainer}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className={errors["confirmPassword"] ? styles.errorInput : ""}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    const newErrors = { ...errors };
                    if (e.target.value && e.target.value.trim() !== "")
                      delete newErrors.confirmPassword;
                    setErrors(newErrors);
                  }}
                  value={confirmPassword}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirm((v) => !v);
                  }}
                  className={styles.iconButton}
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirm ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.size6}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.size6}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors["confirmPassword"] && (
                <div className={styles.fieldError}>
                  {errors["confirmPassword"]}
                </div>
              )}
            </div>
          </div>

          <div className={styles.passwordRequirements}>
            <h4>Your password should contain:</h4>
            <div
              className={`${styles.requirementItem} ${
                password.length === 0
                  ? styles["neutral"]
                  : passwordRequirements.length
                    ? styles["valid"]
                    : styles["invalid"]
              }`}
            >
              {password.length === 0
                ? "○"
                : passwordRequirements.length
                  ? "✓"
                  : "✗"}{" "}
              At least 8 characters
            </div>
            <div
              className={`${styles.requirementItem} ${
                password.length === 0
                  ? styles["neutral"]
                  : passwordRequirements.uppercase
                    ? styles["valid"]
                    : styles["invalid"]
              }`}
            >
              {password.length === 0
                ? "○"
                : passwordRequirements.uppercase
                  ? "✓"
                  : "✗"}{" "}
              At least 1 uppercase letter
            </div>
            <div
              className={`${styles.requirementItem} ${
                password.length === 0
                  ? styles["neutral"]
                  : passwordRequirements.lowercase
                    ? styles["valid"]
                    : styles["invalid"]
              }`}
            >
              {password.length === 0
                ? "○"
                : passwordRequirements.lowercase
                  ? "✓"
                  : "✗"}{" "}
              At least 1 lowercase letter
            </div>
            <div
              className={`${styles.requirementItem} ${
                password.length === 0
                  ? styles["neutral"]
                  : passwordRequirements.number
                    ? styles["valid"]
                    : styles["invalid"]
              }`}
            >
              {password.length === 0
                ? "○"
                : passwordRequirements.number
                  ? "✓"
                  : "✗"}{" "}
              At least 1 number
            </div>
            <div
              className={`${styles.requirementItem} ${
                password.length === 0
                  ? styles["neutral"]
                  : passwordRequirements.special
                    ? styles["valid"]
                    : styles["invalid"]
              }`}
            >
              {password.length === 0
                ? "○"
                : passwordRequirements.special
                  ? "✓"
                  : "✗"}{" "}
              At least 1 special character (!@#$%&)
            </div>
          </div>

          {/* Terms */}
          <div className={styles.termsSection}>
            <h3>Terms and Conditions</h3>
            <div className={styles.termsText}>
              <p>
                <strong>
                  By registering for this system, I agree to the following terms
                  and conditions:
                </strong>
              </p>
              <p>
                <strong>1.</strong> I understand that the information I provide
                will be used solely for employment-related purposes, including
                job matching, referrals, and verification by authorized
                personnel.
              </p>
              <p>
                <strong>2.</strong> I consent to the processing of my personal
                data in accordance with the Data Privacy Act of 2012 and the
                organization&apos;s data protection policies.
              </p>
              <p>
                <strong>3.</strong> I acknowledge that all information provided
                is accurate and complete to the best of my knowledge.
              </p>
              <p>
                <strong>4.</strong> I understand that false or misleading
                information may result in the rejection of my application or
                termination of my account.
              </p>
              <p>
                <strong>5.</strong> I agree to receive notifications and updates
                related to job opportunities and my application status.
              </p>
              <p>
                <strong>6.</strong> I understand that my personal data will be
                stored securely and will only be shared with potential employers
                with my consent.
              </p>
              <p>
                <strong>7.</strong> I have the right to access, correct, or
                delete my personal data at any time by contacting the system
                administrator.
              </p>
            </div>
            <label className={styles.termsCheckbox}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  const newErrors = { ...errors };
                  if (e.target.checked) delete newErrors.acceptTerms;
                  else newErrors.acceptTerms = "You must accept terms";
                  setErrors(newErrors);
                }}
                required
                className={errors["acceptTerms"] ? styles.errorInput : ""}
              />
              <span>Accept Terms and Conditions</span>
            </label>
            {errors["acceptTerms"] && (
              <div className={styles.fieldError}>{errors["acceptTerms"]}</div>
            )}
          </div>

          <div className={styles.signUpButtonContainer}>
            <button
              type="button"
              className={styles.redButton}
              onClick={() => {
                setAcceptTerms(false);
                setPassword("");
                setConfirmPassword("");
                setPasswordRequirements({
                  length: false,
                  uppercase: false,
                  lowercase: false,
                  number: false,
                  special: false,
                });
                setCalculatedAge(null);
                setApplicantType([]);
                setErrors({});
                setGender("");
                setGenderOther("");
                setPhoneNumber("");
                setBirthDate("");
                setEmailValue("");
                setResidency("");
                setbarangay("");
                setPreferredPlace("");
                setDistrict("");
                setExtNameValue("None");
                setShowFormNotice(false);
                const form = document.querySelector(
                  "form",
                ) as HTMLFormElement | null;
                if (form) form.reset();
              }}
            >
              Reset
            </button>
            <button className={styles.greenButton}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
