"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    console.log("Login error:", error);

    // Check for not confirmed error
    if (
      error.message?.toLowerCase().includes("email not confirmed") ||
      error.message?.toLowerCase().includes("not confirmed")
    ) {
      return {
        error:
          "Not authenticated. Please check your email for a verification link.",
      };
    }

    return { error: "Wrong email or password." };
  }

  // Check if user is super-admin > admin > applicant
  const user = authData?.user;
  if (!user) {
    redirect("/error");
  }

  const { data: pesoUser, error: pesoError } = await supabase
    .from("peso")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (pesoUser) {
    // ✅ PESO admin
    redirect("/admin/");
  } else {
    // 👤 Regular applicant
    revalidatePath("/", "layout");

    redirect("/");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Extract fields from the form
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const middleName = formData.get("middleName") as string;
  const extNameRaw = formData.get("extName") as string;
  const extName = extNameRaw === "" ? null : extNameRaw; // <-- Fix here
  const birthDate = formData.get("birthDate") as string;
  const age = formData.get("age") as string;
  const gender = formData.get("gender") as string;
  const applicantType = formData.get("applicantType") as string;
  const disabilityType = formData.get("disabilityType") as string;
  const pwdNumber = formData.get("pwdNumber") as string;
  const preferredPOA = formData.get("preferredPlaceOfAssignment") as string;
  const district = formData.get("district") as string;
  const barangay = formData.get("barangay") as string;
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const residency = formData.get("residency") as string;

  // Combine names into single name field
  const fullName = [firstName, middleName, lastName, extName]
    .filter(Boolean) // Remove empty values
    .join(" ")
    .trim();

  // Prepare data for Supabase signUp (snake_case for auth metadata)
  const signUpData = {
    email,
    password,
    phone: phoneNumber,
    options: {
      data: {
        name: fullName,
        birth_date: birthDate,
        age,
        sex: gender, // Using 'sex' to match your schema
        applicant_type: applicantType,
        disability_type: disabilityType,
        pwd_number: pwdNumber,
        preferred_poa: preferredPOA,
        district,
        barangay,
        address,
        residency,
      },
    },
  };

  const { data: supaSignUpData, error } = await supabase.auth.signUp(
    signUpData
  );

  if (error) {
    console.log("Sign error:", error);
    if (
      error.message?.toLowerCase().includes("user already registered") ||
      error.message?.toLowerCase().includes("email already registered") ||
      error.message?.toLowerCase().includes("email already in use") ||
      error.status === 400
    ) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Signup failed. Please try again." };
  }

  if (supaSignUpData?.user) {
    // Insert into applicants table with snake_case fields
    const applicantData = {
      auth_id: supaSignUpData.user.id,
      name: fullName,
      birth_date: birthDate,
      phone: phoneNumber,
      age: parseInt(age) || null,
      sex: gender,
      applicant_type: applicantType,
      disability_type: disabilityType || null,
      pwd_number: pwdNumber || null,
      preferred_poa: preferredPOA,
      district,
      barangay,
      address,
      residency,
    };

    const { error: applicantError } = await supabase
      .from("applicants")
      .insert([applicantData]);

    if (applicantError) {
      console.log("Applicant insert error:", applicantError);
      return { error: "Signup failed, please try again." };
    }

    return {
      success:
        "Signup successful! Please check your email to verify your account before logging in.",
    };
  }

  revalidatePath("/login", "layout");
  redirect("/login");
}

// export async function signup(formData: FormData) {
//   const supabase = await createClient();

//   // Extract fields from the form as provided by SignUpForm.tsx
//   const firstName = formData.get("firstName") as string;
//   const lastName = formData.get("lastName") as string;
//   const middleName = formData.get("middleName") as string;
//   const extName = formData.get("extName") as string;
//   const birthDate = formData.get("birthDate") as string;
//   const age = formData.get("age") as string;
//   const gender = formData.get("gender") as string; // If backend expects 'sex', map here
//   const applicantType = formData.get("applicantType") as string;
//   const disabilityType = formData.get("disabilityType") as string;
//   const pwdNumber = formData.get("pwdNumber") as string;
//   const preferredPOA = formData.get("preferredPlaceOfAssignment") as string;
//   const district = formData.get("district") as string;
//   const barangay = formData.get("barangay") as string;
//   const address = formData.get("address") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const phoneNumber = formData.get("phoneNumber") as string;
//   const residency = formData.get("residency") as string;

//   // Prepare data for Supabase signUp
//   const signUpData = {
//     email,
//     password,
//     phone: phoneNumber,
//     options: {
//       data: {
//         firstName,
//         lastName,
//         middleName,
//         extName,
//         birthDate,
//         age,
//         gender, // or sex: gender
//         applicantType,
//         disabilityType,
//         pwdNumber,
//         preferredPlaceOfAssignment: preferredPOA,
//         district,
//         barangay,
//         address,
//         residency,
//       },
//     },
//   };

//   const { data: supaSignUpData, error } =
//     await supabase.auth.signUp(signUpData);

//   if (error) {
//     console.log("Sign error:", error);
//     if (
//       error.message?.toLowerCase().includes("user already registered") ||
//       error.message?.toLowerCase().includes("email already registered") ||
//       error.message?.toLowerCase().includes("email already in use") ||
//       error.status === 400
//     ) {
//       return { error: "An account with this email already exists." };
//     }
//     return { error: "Signup failed. Please try again." };
//   }

//   if (supaSignUpData?.user) {
//     // Optionally, insert into applicants table if needed
//     const applicantData = {
//       auth_id: supaSignUpData.user.id,
//       firstName,
//       lastName,
//       middleName,
//       extName,
//       birthDate,
//       age,
//       gender,
//       applicantType,
//       disabilityType,
//       pwdNumber,
//       preferredPlaceOfAssignment: preferredPOA,
//       district,
//       barangay,
//       address,
//       residency,
//     };

//     const { error: applicantError } = await supabase
//       .from("applicants")
//       .insert([applicantData]);

//     if (applicantError) {
//       console.log("Applicant insert error:", applicantError);
//       return { error: "Signup failed, please try again." };
//     }

//     return {
//       success:
//         "Signup successful! Please check your email to verify your account before logging in.",
//     };
//   }

//   revalidatePath("/login", "layout");
//   // redirect("/login");
// }

// export async function signup(formData: FormData) {
//   const supabase = await createClient();

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const firstName = formData.get("firstName") as string;
//   const lastName = formData.get("lastName") as string;
//   const middleName = formData.get("middleName") as string;
//   const extName = formData.get("extName") as string;
//   const birthDate = formData.get("birthDate") as string;
//   const age = formData.get("age") as string;
//   const sex = formData.get("sex") as string;
//   const applicantType = formData.get("applicantType") as string;
//   const disabilityType = formData.get("disabilityType") as string;
//   const pwdNumber = formData.get("pwdNumber") as string;
//   const preferredPOA = formData.get("preferredPlaceOfAssignment") as string;
//   const district = formData.get("district") as string;
//   const barangay = formData.get("barangay") as string;
//   const address = formData.get("address") as string;

//   const data = {
//     email: formData.get("email") as string,
//     password: formData.get("password") as string,
//     phone: formData.get("phoneNumber") as string,
//     options: {
//       data: {
//         name: `${
//           firstName + " " + middleName + " " + lastName + " " + extName
//         }`,
//         phone: formData.get("phoneNumber") as string,

//         birth_date: birthDate,
//         age: age,
//         sex: sex,
//         applicant_type: applicantType,
//         disability_type: disabilityType,
//         pwd_number: pwdNumber,
//         preferred_poa: preferredPOA,
//         district: district,
//         barangay: barangay,
//         address: address,
//       },
//     },
//   };

//   const { data: signUpData, error } = await supabase.auth.signUp(data);

//   if (error) {
//     console.log("Sign error:", error);
//     if (
//       error.message?.toLowerCase().includes("user already registered") ||
//       error.message?.toLowerCase().includes("email already registered") ||
//       error.message?.toLowerCase().includes("email already in use") ||
//       error.status === 400 // Supabase sometimes returns 400 for duplicate emails
//     ) {
//       return { error: "An account with this email already exists." };
//     }

//     return { error: "Signup failed. Please try again." };
//   }

//   if (signUpData?.user) {
//     const applicantData = {
//       auth_id: signUpData.user.id,
//       ...data.options.data, // spread all applicant fields
//     };

//     const { error: applicantError } = await supabase
//       .from("applicants")
//       .insert([applicantData]);

//     if (applicantError) {
//       console.log("Applicant insert error:", applicantError);
//       return { error: "Signup failed, please try again." };
//     }

//     return {
//       success:
//         "Signup successful! Please check your email to verify your account before logging in.",
//     };
//   }

//   revalidatePath("/", "layout");
//   redirect("/");
// }

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",

    options: {
      queryParams: {
        access_type: "offline",

        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);

    redirect("/error");
  }

  redirect(data.url);
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Email is required." };
  }

  // User will be redirected to this page after clicking the email link

  // Create this route/page in your app (e.g., src/app/auth/reset-password/page.tsx)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const redirectTo = `${siteUrl}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.log("Reset password request error:", error);

    // Avoid leaking whether the email exists

    return {
      error:
        "We couldn't send the reset email right now. Please try again in a moment.",
    };
  }

  return {
    success:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = (formData.get("password") as string)?.trim();

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.log("Update password error:", error);
    return { error: "Could not update password. Please try again." };
  }

  // Optionally revalidate the login page
  revalidatePath("/login", "layout");

  return { success: "Password updated successfully. You can now log in." };
}
