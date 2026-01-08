"use client";

import React, { useState } from "react";
import styles from "../ManageAdmin.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import { useAdminData } from "../hooks/useAdminData";
import { useAdminActions } from "../hooks/useAdminActions";
import AdminSearchBar from "./AdminSearchBar";
import AdminTable from "./AdminTable";
import EditAdminModal from "./modals/EditAdminModal";
import ArchiveAdminModal from "./modals/ArchiveAdminModal";
import AddAdminModal from "./modals/AddAdminModal";
import { archiveAdminAction } from "@/app/admin/actions/admin.actions";

const ManageAdminList = () => {
  const { filteredAdmins, loading, search, setSearch, fetchAdmins, setSortBy } =
    useAdminData();

  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);

  const {
    showEditModal,
    setShowEditModal,
    showArchiveModal,
    setShowArchiveModal,
    showAddModal,
    setShowAddModal,
    selectedAdmin,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editStatus,
    setEditStatus,
    editIsSuperAdmin,
    setEditIsSuperAdmin,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    actionLoading,
    handleEditClick,
    handleSaveEdit,
    handleUnlockAccount,
    handleArchiveClick,
    handleArchiveAdmin,
    addName,
    setAddName,
    addEmail,
    setAddEmail,
    addPassword,
    setAddPassword,
    addConfirmPassword,
    setAddConfirmPassword,
    addIsSuperAdmin,
    setAddIsSuperAdmin,
    handleAddAdminClick,
    handleAddAdmin,
  } = useAdminActions(fetchAdmins);

  const handleSelectAll = () => {
    if (selectedAdmins.length === filteredAdmins.length) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(filteredAdmins.map((admin) => admin.id));
    }
  };

  const handleToggleSelect = (adminId: number) => {
    setSelectedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId],
    );
  };

  const handleArchiveSelected = async () => {
    if (selectedAdmins.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to archive ${selectedAdmins.length} admin(s)?`,
      )
    )
      return;

    try {
      for (const adminId of selectedAdmins) {
        await archiveAdminAction(adminId);
      }
      await fetchAdmins();
      setSelectedAdmins([]);
      alert("Selected admins archived successfully!");
    } catch (error) {
      console.error("Error archiving admins:", error);
      alert("Failed to archive some admins. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div
          style={{ display: "flex", justifyContent: "center", padding: "4rem" }}
        >
          <OneEightyRing height={64} width={64} color="var(--accent)" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p>
          View and manage all PESO admin accounts. Edit details, reset
          passwords, or deactivate accounts.
        </p>
      </div>

      <AdminSearchBar
        search={search}
        setSearch={setSearch}
        selectedCount={selectedAdmins.length}
        onSelectAll={handleSelectAll}
        onArchiveSelected={handleArchiveSelected}
        onSortChange={setSortBy}
        onAddAdmin={handleAddAdminClick}
      />

      <AdminTable
        admins={filteredAdmins}
        onEdit={handleEditClick}
        onUnlock={handleUnlockAccount}
        onArchive={handleArchiveClick}
        selectedAdmins={selectedAdmins}
        onToggleSelect={handleToggleSelect}
      />

      <EditAdminModal
        show={showEditModal}
        admin={selectedAdmin}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editIsSuperAdmin={editIsSuperAdmin}
        setEditIsSuperAdmin={setEditIsSuperAdmin}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        actionLoading={actionLoading}
        onSave={handleSaveEdit}
        onClose={() => setShowEditModal(false)}
      />

      <ArchiveAdminModal
        show={showArchiveModal}
        admin={selectedAdmin}
        actionLoading={actionLoading}
        onArchive={handleArchiveAdmin}
        onClose={() => setShowArchiveModal(false)}
      />

      <AddAdminModal
        show={showAddModal}
        name={addName}
        setName={setAddName}
        email={addEmail}
        setEmail={setAddEmail}
        password={addPassword}
        setPassword={setAddPassword}
        confirmPassword={addConfirmPassword}
        setConfirmPassword={setAddConfirmPassword}
        isSuperAdmin={addIsSuperAdmin}
        setIsSuperAdmin={setAddIsSuperAdmin}
        actionLoading={actionLoading}
        onSave={handleAddAdmin}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default ManageAdminList;
