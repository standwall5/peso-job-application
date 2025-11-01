import React from "react";
import styles from "@/app/admin/Admin.module.css";
import Link from "next/link";

const Sidebar = () => {
  return (
    <section className={styles.sideBar}>
      <div className={styles.sideBarPeso}>
        <img src="/assets/pesoLogo.png" alt="PESO" />
        <span>PESO</span>
      </div>
      <ul className={styles.sideBarList}>
        <li>
          <Link href="/">Dashboard</Link>
        </li>
        <li>
          <Link href="/manage-company">Manage Company</Link>
        </li>
        <li>
          <Link href="/reports">Reports & Analytics</Link>
        </li>

        {/* If super admin */}
        <li>
          <Link href="/manage-staff">Manage Staff</Link>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;
