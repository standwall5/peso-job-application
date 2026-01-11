"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";
import { User } from "@supabase/supabase-js";
import PesoLogo from "../../public/assets/pesoLogo.png";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

const LoadingNavBar = () => {
  return (
    <nav>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Image src={PesoLogo} alt="PESO Logo" className="peso-logo" />
          </li>
        </ul>
      </div>
    </nav>
  );
};

const SimpleNavBar = (props: { pathname: string }) => {
  const { t } = useLanguage();
  return (
    <nav>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/job-opportunities">
              <Image src={PesoLogo} alt="PESO Logo" className="peso-logo" />
            </Link>
          </li>
          <li>
            <Link href="/login">
              <button
                className={
                  props.pathname === "/login"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                {t("nav.home")}
              </button>
            </Link>
          </li>
          <li>
            <Link href="/job-opportunities">
              <button
                className={
                  props.pathname === "/job-opportunities"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                {t("nav.jobOpportunities")}
              </button>
            </Link>
          </li>
          <li>
            <Link href="/how-it-works">
              <button
                className={
                  props.pathname === "/how-it-works"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                {t("nav.howItWorks")}
              </button>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <button
                className={
                  props.pathname === "/about"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                {t("nav.about")}
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

interface Job {
  id: number;
  company_id: number;
  title: string;
  description: string;
  companies?: {
    name: string;
    logo?: string | null;
  };
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
}

interface ApplicantUser {
  id: string;
  email: string;
  profile_pic_url?: string;
}

const PrivateNavBar = (props: { pathname: string; user: ApplicantUser }) => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userLoggedIn, setUserLoggedIn] = useState();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check if we're on job-opportunities page
  const isJobOpportunitiesPage =
    props.pathname === "/job-opportunities" ||
    props.pathname.startsWith("/job-opportunities/");

  useEffect(() => {
    async function fetchAll() {
      try {
        const companiesRes = await fetch("/api/getCompanies");
        const jobsRes = await fetch("/api/getJobs");
        const companiesData = await companiesRes.json();
        const jobsData = await jobsRes.json();

        setCompanies(companiesData || []);
        setJobs(jobsData || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchResults = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(
        `/job-opportunities?search=${encodeURIComponent(search.trim())}`,
      );
      setShowDropdown(false);
    }
  };

  return (
    <nav className={styles.privateNav}>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/">
              <Image src={PesoLogo} alt="PESO Logo" className="peso-logo" />
            </Link>
          </li>
          {!isJobOpportunitiesPage && (
            <li>
              <form
                onSubmit={handleSearch}
                className={styles.searchContainer}
                ref={formRef}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setShowDropdown(
                      value !== "" &&
                        jobs.some(
                          (job) =>
                            job.title
                              .toLowerCase()
                              .includes(value.toLowerCase()) ||
                            job.description
                              .toLowerCase()
                              .includes(value.toLowerCase()),
                        ),
                    );
                  }}
                  onFocus={(e) => {
                    setShowDropdown(
                      e.target.value !== "" && searchResults.length > 0,
                    );
                  }}
                  placeholder="Search jobs and companies..."
                />
                <button
                  type="submit"
                  className={styles.searchIcon}
                  onClick={handleSearch}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="white"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>

                <div className={styles.searchDropdown}>
                  <Dropdown isOpen={showDropdown} position="left">
                    {searchResults.slice(0, 5).map((job) => (
                      <DropdownItem
                        key={job.id}
                        href={`/job-opportunities?search=${encodeURIComponent(job.title)}`}
                        icon={
                          job.companies?.logo ? (
                            <img
                              src={job.companies.logo}
                              alt={job.companies.name + " logo"}
                              style={{
                                width: 24,
                                height: 24,
                                objectFit: "contain",
                              }}
                            />
                          ) : undefined
                        }
                      >
                        <strong>{job.title}</strong>
                        {job.companies?.name && (
                          <span style={{ marginLeft: 8, color: "#888" }}>
                            &mdash; {job.companies.name}
                          </span>
                        )}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>
              </form>
            </li>
          )}

          {/* Icons -- add selected states -- Done*/}
          <li>
            <Link href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </Link>
          </li>
          <li>
            {/* Dropdown for notifications */}
            <div
              className={styles.notificationIcon}
              onClick={() => {
                setShowNotificationsDropdown(true);
                setShowProfileDropdown(false);
              }}
              ref={notifRef}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
              )}
              <NotificationDropdown
                isOpen={showNotificationsDropdown}
                onClose={() => setShowNotificationsDropdown(false)}
                onUnreadCountChange={setUnreadCount}
              />
            </div>
          </li>
          <li className={styles.profileIconContainer}>
            <div
              className={styles.dropdown}
              ref={profileRef}
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
            >
              <div className={styles.profileIcon}>
                <img
                  src={
                    props.user?.profile_pic_url ||
                    "/assets/images/default_profile.png"
                  }
                  alt="Profile Icon"
                />
              </div>

              <Dropdown isOpen={showProfileDropdown} position="right">
                <DropdownItem href="/profile">Profile</DropdownItem>
                <DropdownItem onClick={signout}>Logout</DropdownItem>
              </Dropdown>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const PesoNavbar = (props: { pathname: string }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userLoggedIn, setUserLoggedIn] = useState();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const companiesRes = await fetch("/api/getCompanies");
        const jobsRes = await fetch("/api/getJobs");
        const companiesData = await companiesRes.json();
        const jobsData = await jobsRes.json();

        setCompanies(companiesData || []);
        setJobs(jobsData || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchResults = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <nav className={styles.privateNav}>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/">
              <Image src={PesoLogo} alt="PESO Logo" className="peso-logo" />
            </Link>
          </li>
          <li>
            <div className={styles.searchContainer} ref={searchRef}>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  setShowDropdown(
                    value !== "" &&
                      jobs.some(
                        (job) =>
                          job.title
                            .toLowerCase()
                            .includes(value.toLowerCase()) ||
                          job.description
                            .toLowerCase()
                            .includes(value.toLowerCase()),
                      ),
                  );
                }}
                onFocus={(e) => {
                  setShowDropdown(
                    e.target.value !== "" && searchResults.length > 0,
                  );
                }}
                placeholder="location, company, job-title, category of job"
              />
              <Link href={`/search/${search}`} className={styles.searchIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </Link>

              {showDropdown && (
                <div
                  className={`${styles.searchResultContainer} ${styles.searchDropdown} ${styles.dropdownContent}`}
                >
                  {searchResults.map((job) => (
                    <div key={job.id} className={styles.searchResultContent}>
                      {job.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>

          {/* Icons -- add selected states -- Done*/}
          <li>
            <Link href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </Link>
          </li>
          <li>
            {/* Dropdown for notifications */}
            <div
              className={styles.notificationIcon}
              onClick={() => {
                setShowNotificationsDropdown(true);
                setShowProfileDropdown(false);
              }}
              ref={notifRef}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              {showNotificationsDropdown && (
                <div
                  className={`${styles.notificationDropdown} ${styles.dropdownContent}`}
                >
                  <p>Place notifications here</p>
                </div>
              )}
            </div>
          </li>
          <li>
            <div
              className={styles.dropdown}
              ref={profileRef}
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>

              <Dropdown isOpen={showProfileDropdown} position="right">
                <DropdownItem href="/profile">Profile</DropdownItem>
                <DropdownItem onClick={signout}>Logout</DropdownItem>
              </Dropdown>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const FlexBoxNav = (props: { pathname: string }) => {
  return (
    <nav>
      <div className="nav-container">
        <Link className="nav-img-container" href="/">
          <Image src={PesoLogo} alt="Peso Logo" />
        </Link>
        <ul>
          <li>
            <Link href="/">
              <button
                className={
                  props.pathname === "/"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Home
              </button>
            </Link>
          </li>
          <li>
            <Link href="/job-opportunities">
              <button
                className={
                  props.pathname === "/job-opportunities"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                Job Opportunities
              </button>
            </Link>
          </li>
          <li>
            <Link href="/how">
              <button
                className={
                  props.pathname === "/how"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                How it Works
              </button>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <button
                className={
                  props.pathname === "/about"
                    ? "nav-button-active"
                    : "nav-button-default"
                }
              >
                About
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   setMounted(true);
  //   const supabase = createClient();

  //   supabase.auth.getUser().then(({ data }) => {
  //     setUser(data.user);
  //   });

  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     (_event, session) => {
  //       setUser(session?.user ?? null);
  //     }
  //   );

  //   return () => {
  //     authListener?.subscription.unsubscribe();
  //   };
  // }, [pathname]); // <-- Add pathname as a dependency

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    // Initial fetch
    async function fetchUser() {
      const res = await fetch("/api/getUser");
      const data = await res.json();
      setUser(data && !data.error ? data : null);
      setLoading(false);
    }

    fetchUser();

    // Listen for auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // User logged in - fetch updated user data
          await fetchUser();
        } else {
          // User logged out - clear user state
          setUser(null);
          setLoading(false);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname]);

  if (!mounted) return null;

  if (loading) {
    return <LoadingNavBar />;
  }

  if (!user) {
    return <SimpleNavBar pathname={pathname} />;
  } else {
    // Map Supabase User to ApplicantUser, ensuring email is a string
    const applicantUser: ApplicantUser = {
      id: user.id,
      email: user.email ?? "",
      profile_pic_url: (user as ApplicantUser).profile_pic_url, // adjust if your user object has this property elsewhere
    };
    return <PrivateNavBar pathname={pathname} user={applicantUser} />;
  }
};

export default Navbar;
