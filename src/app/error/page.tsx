"use client";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const reason = params.get("reason");

  let message = "Sorry, something went wrong";
  if (reason === "missing-env-vars") {
    message =
      "Supabase environment variables are missing. Please contact the administrator.";
  } else if (reason === "invalid-otp") {
    message = "Invalid or expired OTP.";
  } else {
    message = "Something went wrong.";
  }

  return <p>{message}</p>;
}
