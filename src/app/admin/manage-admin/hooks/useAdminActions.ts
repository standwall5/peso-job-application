// src/app/admin/manage-admin/hooks/useAdminActions.ts

import { useState } from "react";
import {
  updateAdminStatusAction,
  updateAdminInfoAction,
  unlockAdminAccountAction,
  resetAdminPasswordAction,
  deleteAdminAction,
  archiveAdminAction,
  createAdminAction,
} from "@/app/admin/actions/admin.actions";
import { AdminWithEmail, AdminStatus } from "../types/admin.types";

export const useAdminActions = (fetchAdmins: () => Promise<void>) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithEmail | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState<AdminStatus>("active");
  const [editIsSuperAdmin, setEditIsSuperAdmin] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Add Admin states (Invitation flow - no password needed)
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addIsSuperAdmin, setAddIsSuperAdmin] = useState(false);

  const handleEditClick = (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditStatus((admin.status as AdminStatus) || "active");
    setEditIsSuperAdmin(admin.is_superadmin);
    setNewPassword("");
    setConfirmPassword("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAdmin) return;

    // Validate password if provided
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
      }
    }

    setActionLoading(true);
    try {
      // Update admin info
      await updateAdminInfoAction(selectedAdmin.id, {
        name: editName,
        is_superadmin: editIsSuperAdmin,
      });

      // Update status
      await updateAdminStatusAction(selectedAdmin.id, editStatus);

      // Update password if provided
      if (newPassword) {
        await resetAdminPasswordAction(selectedAdmin.auth_id, newPassword);
      }

      // TODO: Update email if changed
      // Note: Email update might require additional backend support

      await fetchAdmins();
      setShowEditModal(false);
      setSelectedAdmin(null);
      setNewPassword("");
      setConfirmPassword("");
      alert("Admin updated successfully!");
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

  const handleArchiveClick = (admin: AdminWithEmail) => {
    setSelectedAdmin(admin);
    setShowArchiveModal(true);
  };

  const handleArchiveAdmin = async () => {
    if (!selectedAdmin) return;

    setActionLoading(true);
    try {
      await archiveAdminAction(selectedAdmin.id);
      await fetchAdmins();
      setShowArchiveModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error archiving admin:", error);
      alert("Failed to archive admin. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAdminClick = () => {
    setAddName("");
    setAddEmail("");
    setAddIsSuperAdmin(false);
    setShowAddModal(true);
  };

  const handleAddAdmin = async () => {
    // Validate inputs
    if (!addName.trim()) {
      alert("Name is required!");
      return;
    }

    if (!addEmail.trim()) {
      alert("Email is required!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addEmail)) {
      alert("Invalid email format!");
      return;
    }

    if (addName.trim().length < 3) {
      alert("Name must be at least 3 characters!");
      return;
    }

    setActionLoading(true);
    try {
      // Send invitation instead of creating account directly
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: addEmail,
          name: addName,
          is_superadmin: addIsSuperAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error with invitation link if available
        let errorMsg = data.error || "Failed to send invitation";

        if (data.inviteUrl || data.token) {
          errorMsg += `\n\n⚠️ Email sending failed, but invitation was created.`;
          if (data.inviteUrl) {
            errorMsg += `\n\nManually send this link to ${addEmail}:\n${data.inviteUrl}`;
          }
          if (data.hint) {
            errorMsg += `\n\n${data.hint}`;
          }
        }

        throw new Error(errorMsg);
      }

      await fetchAdmins();
      setShowAddModal(false);

      // Show success message
      let successMsg = "";

      if (data.emailSent) {
        successMsg = `✅ Invitation sent successfully!\n\n📧 Email sent to: ${data.email || addEmail}\n👤 Name: ${data.name || addName}\n🔑 Role: ${data.is_superadmin ? "Super Admin" : "Admin"}\n\nThe admin will receive an email with instructions to set their password.\n\nOn first login, they will be prompted to:\n• Upload a profile picture\n• Complete their profile setup`;
      } else {
        successMsg = `⚠️ Invitation created but email failed to send\n\n📧 Email: ${data.email || addEmail}\n👤 Name: ${data.name || addName}\n\nError: ${data.emailError || "Unknown error"}\n\nPlease contact the admin directly to set up their account.`;
      }

      alert(successMsg);
    } catch (error) {
      console.error("Error sending invitation:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send invitation. Please try again.";
      alert(errorMessage);
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
    addName,
    setAddName,
    addEmail,
    setAddEmail,
    addIsSuperAdmin,
    setAddIsSuperAdmin,
    actionLoading,
    handleEditClick,
    handleSaveEdit,
    handleUnlockAccount,
    handleResetPasswordClick,
    handleResetPassword,
    handleDeleteClick,
    handleDeleteAdmin,
    handleArchiveClick,
    handleArchiveAdmin,
    handleAddAdminClick,
    handleAddAdmin,
  };
};
