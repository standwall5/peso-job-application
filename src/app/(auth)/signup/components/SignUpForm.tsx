"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./SignUp.module.css";
import { signup } from "@/lib/auth-actions";
import Link from "next/link";

const SignUpForm: React.FC = () => {
  const [district, setDistrict] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(true);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [applicantType, setApplicantType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFormNotice, setShowFormNotice] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Controlled fields for validations that need immediate feedback
  const [gender, setGender] = useState<string>("");
  const [genderOther, setGenderOther] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  const [preferredPlace, setPreferredPlace] = useState<string>("");
  const [extNameValue, setExtNameValue] = useState<string>("None");

  // keep list of required fields (for submit validation)
  const requiredFields = [
    "firstName",
    "lastName",
    "address",
    "province",
    "district",
    "cityMunicipality",
    "barangay",
    "applicantType",
    "password",
    "confirmPassword",
    "validId",
    "selfieWithId",
    "acceptTerms",
    "email",
    "phoneNumber",
    "preferredPlaceOfAssignment",
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
      special: /[!@#$%&]/.test(passwordValue),
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
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed =
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.key === "Tab" ||
      e.ctrlKey ||
      e.metaKey;
    if (allowed) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
    const target = e.currentTarget;
    const selectionLength = target.selectionEnd! - target.selectionStart!;
    if (!allowed && /^\d$/.test(e.key)) {
      if (phoneNumber.length - selectionLength >= 11) {
        e.preventDefault();
      }
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text");
    const digits = pasted.replace(/\D/g, "");
    if (!digits) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newVal =
      phoneNumber.slice(0, start) +
      digits.slice(0, 11 - phoneNumber.length) +
      phoneNumber.slice(end);
    const final = newVal.slice(0, 11);
    setPhoneNumber(final);

    const newErrors = { ...errors };
    if (final.length !== 11)
      newErrors.phoneNumber = "Phone number must be exactly 11 digits";
    else delete newErrors.phoneNumber;
    setErrors(newErrors);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhoneNumber(digits);

    const newErrors = { ...errors };
    if (!digits || digits.length === 0) {
      newErrors.phoneNumber = "This field is required";
    } else if (!/^\d+$/.test(digits)) {
      newErrors.phoneNumber = "Phone number must contain digits only";
    } else if (digits.length !== 11) {
      newErrors.phoneNumber = "Phone number must be exactly 11 digits";
    } else {
      delete newErrors.phoneNumber;
    }
    setErrors(newErrors);
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

  // Preferred place handler
  const handlePreferredPlaceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
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
    if (!v) newErrors.district = "District is required";
    else delete newErrors.district;
    setErrors(newErrors);
  };

  // GENERIC input change handler to clear errors for simple required fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      newErrors.sex = "Please select gender";
    } else if (gender === "Others") {
      if (!genderOther || genderOther.trim() === "") {
        newErrors.genderOther = "Please specify gender";
      }
    }

    // Phone validations (phone is required)
    if (!phoneNumber || phoneNumber.trim() === "") {
      newErrors.phoneNumber = "Contact number is required";
    } else if (!/^\d+$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain digits only";
    } else if (phoneNumber.length !== 11) {
      newErrors.phoneNumber = "Phone number must be exactly 11 digits";
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
    if (applicantType === "Person with Disability (PWD)") {
      const disability = (
        formEl.elements.namedItem("disabilityType") as HTMLSelectElement | null
      )?.value;
      if (!disability || disability.trim() === "") {
        newErrors.disabilityType = "Please select disability type";
      }
    }

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
      gender === "Others" ? genderOther || "Others" : gender
    );
    formData.set("phoneNumber", phoneNumber);
    formData.set("birthDate", birthDate);
    formData.set("email", emailValue);
    formData.set("district", district);
    formData.set("preferredPlaceOfAssignment", preferredPlace);
    formData.set("extName", extNameValue);

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
              <option value="None">None</option>
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

          {/* applicantType row */}
          <div className={styles.fullRow}>
            <div style={{ flex: 1 }}>
              <label htmlFor="applicantType" className={styles.fieldLabel}>
                Applicant Type <span className={styles.redAsterisk}>*</span>
              </label>
              <select
                id="applicantType"
                name="applicantType"
                value={applicantType}
                onChange={(e) => {
                  setApplicantType(e.target.value);
                  const newErrors = { ...errors };
                  if (e.target.value) delete newErrors.applicantType;
                  setErrors(newErrors);
                }}
                className={errors["applicantType"] ? styles.errorInput : ""}
              >
                <option value="" disabled>
                  CHOOSE YOUR APPLICANT TYPE
                </option>
                <option value="Student">Student</option>
                <option value="Indigenous Person (IP)">
                  Indigenous Person (IP)
                </option>
                <option value="Out of School Youth">Out of School Youth</option>
                <option value="Person with Disability (PWD)">
                  Person with Disability (PWD)
                </option>
                <option value="Rehabilitation Program Graduate">
                  Rehabilitation Program Graduate
                </option>
                <option value="Reintegrated Individual (Former Detainee)">
                  Reintegrated Individual (Former Detainee)
                </option>
                <option value="Returning Oversees Filipino Worker (OFW)">
                  Returning Oversees Filipino Worker (OFW)
                </option>
                <option value="Senior Citizen">Senior Citizen</option>
                <option value="Solo Parent/Single Parent">
                  Solo Parent/Single Parent
                </option>
                <option value="Others">Others</option>
              </select>
              {errors["applicantType"] && (
                <div className={styles.fieldError}>
                  {errors["applicantType"]}
                </div>
              )}
            </div>

            {applicantType === "Person with Disability (PWD)" && (
              <>
                <div style={{ flex: 1 }}>
                  <label htmlFor="disabilityType" className={styles.fieldLabel}>
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

            {applicantType === "Senior Citizen" && (
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="seniorCitizenNumber"
                  className={styles.fieldLabel}
                >
                  Senior Citizen ID (Optional)
                </label>
                <input
                  id="seniorCitizenNumber"
                  name="seniorCitizenNumber"
                  type="text"
                  onChange={handleInputChange}
                  className={
                    errors["seniorCitizenNumber"] ? styles.errorInput : ""
                  }
                />
                {errors["seniorCitizenNumber"] && (
                  <div className={styles.fieldError}>
                    {errors["seniorCitizenNumber"]}
                  </div>
                )}
              </div>
            )}

            {applicantType === "Solo Parent/Single Parent" && (
              <div style={{ flex: 1 }}>
                <label htmlFor="soloParentNumber" className={styles.fieldLabel}>
                  Solo Parent ID (Optional)
                </label>
                <input
                  id="soloParentNumber"
                  name="soloParentNumber"
                  type="text"
                  onChange={handleInputChange}
                  className={
                    errors["soloParentNumber"] ? styles.errorInput : ""
                  }
                />
                {errors["soloParentNumber"] && (
                  <div className={styles.fieldError}>
                    {errors["soloParentNumber"]}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Address */}
          <div className={styles.addressSection}>
            <h3>Address Information</h3>
            <div className={styles.fullRow}>
              <div style={{ flex: 1 }}>
                <label htmlFor="address" className={styles.fieldLabel}>
                  (House No./Street/Subdivision){" "}
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

            <div className={styles.geographicalRow}>
              <div className={styles.leftColumn}>
                <div>
                  <label htmlFor="province" className={styles.fieldLabel}>
                    Province <span className={styles.redAsterisk}>*</span>
                  </label>
                  <select
                    id="province"
                    name="province"
                    defaultValue=""
                    onChange={handleInputChange}
                    className={errors["province"] ? styles.errorInput : ""}
                  >
                    <option value="" disabled>
                      Select Province
                    </option>
                    <option value="Metro Manila">Metro Manila</option>
                    <option value="Cavite">Cavite</option>
                    <option value="Laguna">Laguna</option>
                    <option value="Rizal">Rizal</option>
                    <option value="Bulacan">Bulacan</option>
                  </select>
                  {errors["province"] && (
                    <div className={styles.fieldError}>
                      {errors["province"]}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="district" className={styles.fieldLabel}>
                    District <span className={styles.redAsterisk}>*</span>
                  </label>
                  <select
                    id="district"
                    name="district"
                    defaultValue=""
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

              <div className={styles.rightColumn}>
                <div>
                  <label
                    htmlFor="cityMunicipality"
                    className={styles.fieldLabel}
                  >
                    City / Municipality{" "}
                    <span className={styles.redAsterisk}>*</span>
                  </label>
                  <select
                    id="cityMunicipality"
                    name="cityMunicipality"
                    defaultValue=""
                    onChange={handleInputChange}
                    className={
                      errors["cityMunicipality"] ? styles.errorInput : ""
                    }
                  >
                    <option value="" disabled>
                      Select City/Municipality
                    </option>
                    <option value="Parañaque">Parañaque</option>
                    <option value="Las Piñas">Las Piñas</option>
                    <option value="Muntinlupa">Muntinlupa</option>
                    <option value="Taguig">Taguig</option>
                  </select>
                  {errors["cityMunicipality"] && (
                    <div className={styles.fieldError}>
                      {errors["cityMunicipality"]}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="barangay" className={styles.fieldLabel}>
                    Barangay <span className={styles.redAsterisk}>*</span>
                  </label>
                  <select
                    id="barangay"
                    name="barangay"
                    defaultValue=""
                    onChange={handleInputChange}
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
              <input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="09916594861"
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                value={phoneNumber}
                onKeyDown={handlePhoneKeyDown}
                onPaste={handlePhonePaste}
                onChange={handlePhoneChange}
                maxLength={11}
                className={errors["phoneNumber"] ? styles.errorInput : ""}
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

          {/* File uploads (unchanged behavior) */}
          <div className={styles.fileUploadSection}>
            <div className={styles.uploadRow}>
              <div className={styles.uploadField}>
                <label>
                  Upload Valid ID <span className={styles.redAsterisk}>*</span>
                </label>
                <div className={styles.fileInputContainer}>
                  <label
                    htmlFor="validIdInput"
                    className={styles.chooseFileLabel}
                  >
                    Choose File
                  </label>
                  <input
                    id="validIdInput"
                    type="file"
                    name="validId"
                    accept=".jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const fileNameSpan = (
                        e.currentTarget as HTMLInputElement
                      ).parentElement?.querySelector(
                        `.${styles.fileName}`
                      ) as HTMLElement | null;
                      const newErrors = { ...errors };
                      if (file) {
                        const maxSize = 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert("File size must be less than 5MB");
                          (e.target as HTMLInputElement).value = "";
                          if (fileNameSpan)
                            fileNameSpan.textContent = "No file chosen";
                          newErrors.validId = "File too large";
                        } else {
                          if (fileNameSpan)
                            fileNameSpan.textContent = file.name;
                          delete newErrors.validId;
                        }
                      } else {
                        if (fileNameSpan)
                          fileNameSpan.textContent = "No file chosen";
                        newErrors.validId = "This file is required";
                      }
                      setErrors(newErrors);
                    }}
                    className={errors["validId"] ? styles.errorInput : ""}
                  />
                  <span className={styles.fileName}>No file chosen</span>
                </div>
                {errors["validId"] && (
                  <div className={styles.fieldError}>{errors["validId"]}</div>
                )}
                <p className={styles.fileInfo}>
                  Accepted formats: JPG, PNG (Max: 5MB)
                </p>
              </div>

              <div className={styles.uploadField}>
                <label>
                  Upload Selfie with ID{" "}
                  <span className={styles.redAsterisk}>*</span>
                </label>
                <div className={styles.fileInputContainer}>
                  <label
                    htmlFor="selfieWithIdInput"
                    className={styles.chooseFileLabel}
                  >
                    Choose File
                  </label>
                  <input
                    id="selfieWithIdInput"
                    type="file"
                    name="selfieWithId"
                    accept=".jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      const fileNameSpan = (
                        e.currentTarget as HTMLInputElement
                      ).parentElement?.querySelector(
                        `.${styles.fileName}`
                      ) as HTMLElement | null;
                      const newErrors = { ...errors };
                      if (file) {
                        const maxSize = 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          alert("File size must be less than 5MB");
                          (e.target as HTMLInputElement).value = "";
                          if (fileNameSpan)
                            fileNameSpan.textContent = "No file chosen";
                          newErrors.selfieWithId = "File too large";
                        } else {
                          if (fileNameSpan)
                            fileNameSpan.textContent = file.name;
                          delete newErrors.selfieWithId;
                        }
                      } else {
                        if (fileNameSpan)
                          fileNameSpan.textContent = "No file chosen";
                        newErrors.selfieWithId = "This file is required";
                      }
                      setErrors(newErrors);
                    }}
                    className={errors["selfieWithId"] ? styles.errorInput : ""}
                  />
                  <span className={styles.fileName}>No file chosen</span>
                </div>
                {errors["selfieWithId"] && (
                  <div className={styles.fieldError}>
                    {errors["selfieWithId"]}
                  </div>
                )}
                <p className={styles.fileInfo}>
                  Ensure your face and ID are clearly visible
                </p>
              </div>
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
                setApplicantType("");
                setErrors({});
                setGender("");
                setGenderOther("");
                setPhoneNumber("");
                setBirthDate("");
                setEmailValue("");
                setPreferredPlace("");
                setDistrict("");
                setExtNameValue("None");
                setShowFormNotice(false);
                const form = document.querySelector(
                  "form"
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
