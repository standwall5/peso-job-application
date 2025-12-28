// src/app/admin/manage-admin/components/AdminSearchBar.tsx

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../ManageAdmin.module.css";

interface AdminSearchBarProps {
  search: string;
  setSearch: (search: string) => void;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  search,
  setSearch,
}) => {
  const router = useRouter();

  return (
    <div className={styles.topBar}>
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button
        className={styles.addButton}
        onClick={() => router.push("/admin/create-admin")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          style={{ width: "20px", height: "20px" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add Admin
      </button>
    </div>
  );
};

export default AdminSearchBar;
