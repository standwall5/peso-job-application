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

    return { error: "Wrong email or password." };
  }

  // Check if user is admin
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

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const middleName = formData.get("middleName") as string;
  const extName = formData.get("extName") as string;
  const birthDate = formData.get("birthDate") as string;
  const age = formData.get("age") as string;
  const sex = formData.get("sex") as string;
  const applicantType = formData.get("applicantType") as string;
  const disabilityType = formData.get("disabilityType") as string;
  const pwdNumber = formData.get("pwdNumber") as string;
  const preferredPOA = formData.get("preferredPlaceOfAssignment") as string;
  const district = formData.get("district") as string;
  const barangay = formData.get("barangay") as string;
  const address = formData.get("address") as string;

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phoneNumber") as string,
    options: {
      data: {
        name: `${
          firstName + " " + middleName + " " + lastName + " " + extName
        }`,
        phone: formData.get("phoneNumber") as string,

        birth_date: birthDate,
        age: age,
        sex: sex,
        applicant_type: applicantType,
        disability_type: disabilityType,
        pwd_number: pwdNumber,
        preferred_poa: preferredPOA,
        district: district,
        barangay: barangay,
        address: address,
      },
    },
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("Signup error:", error);
    redirect("/error");
  }

  if (signUpData?.user) {
    const applicantData = {
      auth_id: signUpData.user.id,
      ...data.options.data, // spread all applicant fields
    };

    const { error: applicantError } = await supabase
      .from("applicants")
      .insert([applicantData]);

    if (applicantError) {
      console.log("Applicant insert error:", applicantError);
      redirect("/error");
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

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
