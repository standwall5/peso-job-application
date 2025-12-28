// src/app/admin/manage-admin/hooks/useAdminActions.ts

import { useState } from "react";
import {
  updateAdminStatusAction,
  updateAdminInfoAction,
  unlockAdminAccountAction,
  resetAdminPasswordAction,
  deleteAdminAction,
} from "@/app/admin/actions/admin.actions";
import { AdminWithEmail, AdminStatus } from "../types/admin.types";

export const useAdminActions = (fetchAdmins: () => Promise<void>) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithEmail | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<AdminStatus>("active");
  const [editIsSuperAdmin, setEditIsSuperAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleEditClick = (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setEditName(admin.name);
    setEditStatus((admin.status as AdminStatus) || "active");
    setEditIsSuperAdmin(admin.is_superadmin);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await updateAdminInfoAction(selectedAdmin.id, {
        name: editName,
        is_superadmin: editIsSuperAdmin,
      });

      await updateAdminStatusAction(selectedAdmin.id, editStatus);

      await fetchAdmins();
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Failed to update admin. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlockAccount = async (adminId: number) => {
    if (!confirm("Are you sure you want to unlock this account?")) return;

    try {
      await unlockAdminAccountAction(adminId);
      await fetchAdmins();
    } catch (error) {
      console.error("Error unlocking account:", error);
      alert("Failed to unlock account. Please try again.");
    }
  };

  const handleResetPasswordClick = (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setNewPassword("");
    setConfirmPassword("");
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setActionLoading(true);
    try {
      await resetAdminPasswordAction(selectedAdmin.auth_id, newPassword);
      alert("Password reset successfully!");
      setShowResetPasswordModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await deleteAdminAction(selectedAdmin.id, selectedAdmin.auth_id);
      await fetchAdmins();
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    showEditModal,
    setShowEditModal,
    showResetPasswordModal,
    setShowResetPasswordModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedAdmin,
    editName,
    setEditName,
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
    handleResetPasswordClick,
    handleResetPassword,
    handleDeleteClick,
    handleDeleteAdmin,
  };
};
