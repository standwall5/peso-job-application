import React, { forwardRef } from "react";

const Resume = forwardRef(
  (
    {
      profilePicUrl,
      name,
      birthDate,
      address,
      barangay,
      district,
      email,
      phone,
      education,
      skills,
      workExperiences,
      profileIntroduction,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={{
          width: "700px",
          maxWidth: "100%",
          fontFamily: "Poppins, Arial, sans-serif",
          background: "#fff",
          padding: "32px 40px",
          border: "1px solid black",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <img
            src={profilePicUrl || "/default-profile.png"}
            alt="Profile"
            style={{
              width: 160,
              height: 160,
              objectFit: "cover",
              borderRadius: 8,
              border: "2px solid #222",
            }}
          />
          <div style={{ flex: 1, marginTop: "3rem" }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: 24,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {name}
            </h2>
            <hr
              style={{
                margin: "0 0 24px 0",
                border: "none",
                borderTop: "2px solid #222",
              }}
            />
          </div>
        </div>

        <section
          style={{ marginTop: 24, display: "flex", flexDirection: "column" }}
        >
          <h6
            style={{ fontWeight: 600, textAlign: "center", marginBottom: 12 }}
          >
            Personal Information
          </h6>
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <div>BirthDate: {birthDate}</div>
            <div>
              {address}, {barangay}
            </div>
            <div>{district}, Paranaque City</div>
            <div>{email}</div>
            <div>{phone}</div>
          </div>
        </section>

        <section
          style={{ marginTop: 24, display: "flex", flexDirection: "column" }}
        >
          <h6
            style={{ fontWeight: 600, textAlign: "center", marginBottom: 12 }}
          >
            Highest Educational Attainment
          </h6>

          <div
            style={{
              display: "flex",

              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                <strong>{education.school}</strong>
              </div>
              <div>{education.degree}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{education.location}</div>
              <div>
                {education.start_date} - {education.end_date}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h6
            style={{ fontWeight: 600, textAlign: "center", marginBottom: 12 }}
          >
            Skills & Interests
          </h6>
          <ul style={{ textAlign: "left", listStyle: "none", padding: 0 }}>
            {(skills ?? []).map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <h6
            style={{ fontWeight: 600, textAlign: "center", marginBottom: 12 }}
          >
            Work Experiences
          </h6>
          {(Array.isArray(workExperiences) ? workExperiences : []).map(
            (work, idx) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 24,
                }}
                key={idx}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    <strong>{work.company}</strong>
                  </div>
                  <div>{work.position}</div>
                </div>
                <div>
                  <div>{work.location}</div>
                  <div>
                    {work.start_date} - {work.end_date}
                  </div>
                </div>
              </div>
            )
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h6
            style={{ fontWeight: 600, textAlign: "center", marginBottom: 12 }}
          >
            Profile
          </h6>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p>{profileIntroduction}</p>
          </div>
        </section>
      </div>
    );
  }
);

export default Resume;
