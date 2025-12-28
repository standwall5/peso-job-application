import { useState, useEffect } from "react";
import { User, ResumeData } from "../types/profile.types";
import { getUserAction, getResumeAction } from "../actions/profile.actions";

export const useProfileData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [userData, resumeData] = await Promise.all([
          getUserAction(),
          getResumeAction(),
        ]);

        setUser(userData);
        setResume(resumeData);
      } catch (err) {
        console.error("Fetch failed:", err);
        setUser(null);
        setResume(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const refreshUser = async () => {
    const userData = await getUserAction();
    setUser(userData);
  };

  const refreshResume = async () => {
    const resumeData = await getResumeAction();
    setResume(resumeData);
  };

  return {
    user,
    setUser,
    resume,
    loading,
    refreshUser,
    refreshResume,
  };
};
