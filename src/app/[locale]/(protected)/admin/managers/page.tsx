"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, User } from "@/lib/admin-api";
// import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/shared/DataTable";
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Users,
  Calendar,
  Mail,
  Shield,
  UserPlus,
} from "lucide-react";

export default function ManagersPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const router = useRouter();
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManagers, setSelectedManagers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminService.getAllUsers();
      // Filter for managers only
      const managersData = usersData.filter((user) => user.role === "manager");
      setManagers(managersData);
    } catch (error) {
      console.error("Failed to fetch managers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManager = () => {
    setShowCreateModal(true);
  };

  const handleEditManager = (manager: User) => {
    setSelectedManager(manager);
    setShowEditModal(true);
  };

  const handleViewManager = (manager: User) => {
    router.push(`/admin/managers/${manager.id}`);
  };

  const handleViewAssignments = (manager: User) => {
    router.push(`/admin/assignments?manager=${manager.id}`);
  };

  const handleDeactivateManager = async (manager: User) => {
    if (confirm(`Are you sure you want to deactivate ${manager.name}?`)) {
      try {
        await adminService.deactivateUser(manager.id);
        await fetchManagers();
      } catch (error) {
        console.error("Failed to deactivate manager:", error);
      }
    }
  };

  const handleReactivateManager = async (manager: User) => {
    try {
      await adminService.reactivateUser(manager.id);
      await fetchManagers();
    } catch (error) {
      console.error("Failed to reactivate manager:", error);
    }
  };

  const handleDeleteManager = async (manager: User) => {
    if (
      confirm(
        `Are you sure you want to permanently delete ${manager.name}? This action cannot be undone.`
      )
    ) {
      try {
        await adminService.deleteUser(manager.id);
        await fetchManagers();
      } catch (error) {
        console.error("Failed to delete manager:", error);
      }
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedManagers.length === 0) return;

    switch (action) {
      case "deactivate":
        if (
          confirm(`Deactivate ${selectedManagers.length} selected managers?`)
        ) {
          // Implement bulk deactivation
          console.log("Bulk deactivate:", selectedManagers);
        }
        break;
      case "delete":
        if (
          confirm(
            `Permanently delete ${selectedManagers.length} selected managers?`
          )
        ) {
          // Implement bulk deletion
          console.log("Bulk delete:", selectedManagers);
        }
        break;
    }
  };

  const getStatusBadge = (isActive: boolean, deletedAt?: string) => {
    if (deletedAt) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <UserX className="h-3 w-3 me-1" />
          {t("users.status.deleted")}
        </span>
      );
    }

    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 me-1" />
        {t("users.status.active")}
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <UserX className="h-3 w-3 me-1" />
        {t("users.status.inactive")}
      </span>
    );
  };

  const columns = [
    {
      key: "id",
      label: t("users.table.id"),
      width: "80px",
      sortable: true,
    },
    {
      key: "name",
      label: t("managers.table.manager"),
      sortable: true,
      render: (value: string, row: User) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ms-3">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("users.table.status"),
      sortable: true,
      render: (value: boolean, row: User) =>
        getStatusBadge(value, row.deletedAt),
    },
    {
      key: "createdAt",
      label: t("users.table.created"),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 me-1" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "assignedUsers",
      label: t("managers.table.assignedUsers"),
      render: (value: any, row: User) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 me-1" />
          <span className="text-sm text-gray-900">
            {/* This would need to be fetched from assignments API */}0
          </span>
        </div>
      ),
    },
    {
      key: "facebookAccounts",
      label: t("users.table.fbAccounts"),
      render: (value: any[]) => (
        <span className="text-sm text-gray-900">{value?.length || 0}</span>
      ),
    },
  ];

  const actions = [
    {
      label: t("users.table.view"),
      action: "view",
      icon: Eye,
      className: "text-blue-600 hover:text-blue-700",
    },
    {
      label: t("managers.table.assignments"),
      action: "assignments",
      icon: UserPlus,
      className: "text-purple-600 hover:text-purple-700",
    },
    {
      label: t("users.table.edit"),
      action: "edit",
      icon: Edit,
      className: "text-green-600 hover:text-green-700",
    },
    {
      label: selectedManager?.isActive
        ? t("users.table.deactivate")
        : t("users.table.reactivate"),
      action: selectedManager?.isActive ? "deactivate" : "reactivate",
      icon: selectedManager?.isActive ? UserX : UserCheck,
      className: selectedManager?.isActive
        ? "text-yellow-600 hover:text-yellow-700"
        : "text-green-600 hover:text-green-700",
    },
    {
      label: t("users.table.delete"),
      action: "delete",
      icon: Trash2,
      className: "text-red-600 hover:text-red-700",
    },
  ];

  const handleRowAction = (action: string, row: User) => {
    setSelectedManager(row);

    switch (action) {
      case "view":
        handleViewManager(row);
        break;
      case "assignments":
        handleViewAssignments(row);
        break;
      case "edit":
        handleEditManager(row);
        break;
      case "deactivate":
        handleDeactivateManager(row);
        break;
      case "reactivate":
        handleReactivateManager(row);
        break;
      case "delete":
        handleDeleteManager(row);
        break;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("managers.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("managers.subtitle")}</p>
          </div>
          <button
            onClick={handleCreateManager}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 me-2" />
            {t("managers.createManager")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("managers.stats.totalManagers")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("managers.stats.activeManagers")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.filter((m) => m.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("managers.stats.totalAssignments")}
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("managers.stats.avgTeamSize")}
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedManagers.length > 0 && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">
              {t("managers.bulkActions.selected", {
                count: selectedManagers.length,
              })}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("deactivate")}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={managers}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search managers..."
        searchFields={["name", "email"]}
        pagination={true}
        pageSize={10}
        sortable={true}
        selectable={true}
        onRowSelect={setSelectedManagers}
        onRowAction={handleRowAction}
        actions={actions}
        loading={isLoading}
        emptyMessage="No managers found"
        exportable={true}
        onExport={() => console.log("Export managers")}
      />

      {/* Create Manager Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Manager</h3>
            <p className="text-gray-600 mb-4">
              Manager creation form will be implemented here.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Manager Modal Placeholder */}
      {showEditModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Manager</h3>
            <p className="text-gray-600 mb-4">
              Editing {selectedManager.name} - form will be implemented here.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
