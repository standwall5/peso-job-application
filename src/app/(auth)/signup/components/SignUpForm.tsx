"use client";

import React, { useState } from "react";
import styles from "./SignUp.module.css";
import { signup } from "@/lib/auth-actions";

const SignUpForm = () => {
  const [district, setDistrict] = useState("District 1");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className={styles.signUpContainer}>
      <div className={styles.signUpContent}>
        <h2>REGISTER</h2>
        <form action="" className={styles.signUpForm}>
          <input
            type="text"
            name="firstName"
            placeholder="FIRST NAME"
            required
          />
          <input type="text" name="lastName" placeholder="LAST NAME" required />
          <input
            type="text"
            name="middleName"
            placeholder="MIDDLE NAME (Optional)"
          />
          <input
            type="text"
            name="extName"
            placeholder="EXT. NAME (Optional)"
          />

          {/* Second row */}

          <div className={styles.fullRow}>
            <input
              type="date"
              name="birthDate"
              placeholder="BIRTH DATE"
              required
            />
            <input type="number" name="age" placeholder="AGE" required />
            <select name="sex" defaultValue="" required>
              <option value="" disabled>
                Select Sex
              </option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Third row */}

          <div className={styles.fullRow}>
            <select name="applicantType" defaultValue="" required>
              <option value="" disabled>
                CHOOSE YOUR APPLICANT TYPE
              </option>
              <option value="Student">Student</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Experienced">Experienced</option>
              <option value="Person with Disability">
                Person with Disability
              </option>
              <option value="Senior Citizen">Senior Citizen</option>
              <option value="Others">Others</option>
            </select>
            <select name="disabilityType" defaultValue="">
              <option value="" disabled>
                IF APPLICABLE, CHOOSE DISABILITY TYPE
              </option>
              <option value="None">None</option>
              <option value="Visual">Visual</option>
              <option value="Hearing">Hearing</option>
              <option value="Mobility">Mobility</option>
              <option value="Intellectual">Intellectual</option>
              <option value="Psychosocial">Psychosocial</option>
              <option value="Others">Others</option>
            </select>

            <input
              type="text"
              name="pwdNumber"
              placeholder="Enter Person with Disability ID Number"
            />
          </div>
          {/* Fourth Row */}

          <div className={styles.fullRow}>
            <select name="preferredPlaceOfAssignment" defaultValue="" required>
              <option value="" disabled>
                Select Preferred Place of Assignment
              </option>
              <option value="Paranaque">Paranaque</option>
              <option value="Bacoor">Bacoor</option>
            </select>
            <input
              type="text"
              placeholder="Address (House number, street, etc.)"
              name="address"
              required
            />
          </div>
          {/* Fifth Row */}

          <div className={styles.fullRow}>
            <select
              name="district"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value); // reset barangay when district changes
              }}
              required
            >
              <option value="" disabled>
                Select District
              </option>
              <option value="District 1">District 1</option>
              <option value="District 2">District 2</option>
            </select>

            <select name="barangay" defaultValue="" required>
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
          </div>
          <div className={styles.fullRow}>
            <input type="email" name="email" placeholder="Email" />
            <input type="tel" name="phoneNumber" placeholder="09123456789" />
          </div>
          <div className={styles.fullRow}>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword((v) => !v);
                  }}
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
                  className="size-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword((v) => !v);
                  }}
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
            </div>

            {/* <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ marginLeft: "0.5rem" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button> */}
            <div className={styles.passwordContainer}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {showConfirm ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm((v) => !v);
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  // tabIndex={-1}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm((v) => !v);
                  }}
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
            </div>
            {/* <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              style={{ marginLeft: "0.5rem" }}
            >
              {showConfirm ? "Hide" : "Show"}
            </button> */}
          </div>
          {confirmPassword && password !== confirmPassword && (
            <span style={{ color: "red" }}>Passwords do not match</span>
          )}
          <div className={styles.signUpButtonContainer}>
            <button type="reset" className="red-button">
              Reset
            </button>
            <button formAction={signup} className="green-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
