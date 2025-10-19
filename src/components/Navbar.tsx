"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";
import { User } from "@supabase/supabase-js";
import PesoLogo from "../../public/assets/pesoLogo.png";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";

const SimpleNavBar = (props: { pathname: string }) => {
  return (
    <nav>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/">
              <Image src={PesoLogo} alt="PESO Logo" />
            </Link>
          </li>
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
            <Link href="/how-it-works">
              <button
                className={
                  props.pathname === "/how-it-works"
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

const PrivateNavBar = (props: { pathname: string }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [userLoggedIn, setUserLoggedIn] = useState();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

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
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchResults = jobs.filter(
    (job: any) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <nav className={styles.privateNav}>
      <div className="nav-container-simple">
        <ul>
          <li>
            <Link href="/">
              <Image src={PesoLogo} alt="PESO Logo" />
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
                        (job: any) =>
                          job.title
                            .toLowerCase()
                            .includes(value.toLowerCase()) ||
                          job.description
                            .toLowerCase()
                            .includes(value.toLowerCase())
                      )
                  );
                }}
                onFocus={(e) => {
                  setShowDropdown(
                    e.target.value !== "" && searchResults.length > 0
                  );
                }}
                placeholder="location, company, job-title, category of job"
              />
              <Link href="/searchResults?" className={styles.searchIcon}>
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
                  {searchResults.map((job: any) => (
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
                setShowSettingsDropdown(false);
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
            <Link href="/profile">
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
            </Link>
          </li>
          <li>
            <div
              className={styles.dropdown}
              ref={settingsRef}
              onClick={() => {
                setShowSettingsDropdown(true);
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
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>

              {showSettingsDropdown && (
                <div
                  className={`${styles.dropdownContent} ${styles.settingsDropdown}`}
                >
                  <button onClick={signout}>Logout</button>
                </div>
              )}
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

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname]); // <-- Add pathname as a dependency

  if (!mounted) return null;

  if (!user) {
    return <SimpleNavBar pathname={pathname} />;
  } else {
    return <PrivateNavBar pathname={pathname} />;
  }
};

export default Navbar;
