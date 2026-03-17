"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, UserAssignment, User } from "@/lib/admin-api";
// import AdminLayout from "@/components/admin/AdminLayout";
import DataTable from "@/components/shared/DataTable";
import {
  Plus,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  Calendar,
  User as UserIcon,
  Shield,
  Search,
  Filter,
} from "lucide-react";

export default function AssignmentsPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignments, setSelectedAssignments] = useState<
    UserAssignment[]
  >([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterManager, setFilterManager] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, usersData] = await Promise.all([
        adminService.getAssignments(),
        adminService.getAllUsers(),
      ]);

      setAssignments(assignmentsData.data || []);

      // Separate managers and users
      const managersData = usersData.filter((user) => user.role === "manager");
      const regularUsers = usersData.filter((user) => user.role === "user");

      setManagers(managersData);
      setUsers(regularUsers);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const [formData, setFormData] = useState({ managerId: NaN, userId: NaN });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAssignUser = async (e: any) => {
    e.preventDefault(); // Prevents page reload
    console.log(formData);
    // const rsg(res);
    const { managerId, userId } = formData;
    console.log(managerId);
    console.log(Number(managerId));

    const res = await adminService.assignUserToManager(
      Number(managerId),
      Number(userId)
    );
    console.log(res);
  };

  const handleViewManager = (assignment: UserAssignment) => {
    router.push(`/admin/managers/${assignment.managerId}`);
  };

  const handleViewUser = (assignment: UserAssignment) => {
    router.push(`/admin/users/${assignment.userId}`);
  };

  const handleDeleteAssignment = async (assignment: UserAssignment) => {
    if (
      confirm(
        `Are you sure you want to remove the assignment between ${assignment.manager.name} and ${assignment.user.name}?`
      )
    ) {
      try {
        await adminService.deleteAssignment(assignment.id);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete assignment:", error);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedAssignments.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedAssignments.length} selected assignments?`
      )
    ) {
      // Implement bulk deletion
      console.log("Bulk delete assignments:", selectedAssignments);
    }
  };

  // Filter assignments based on selected filters
  const filteredAssignments = assignments.filter((assignment) => {
    if (filterManager && assignment.managerId.toString() !== filterManager) {
      return false;
    }
    if (filterStatus && assignment.isActive.toString() !== filterStatus) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "80px",
      sortable: true,
    },
    {
      key: "manager",
      label: "Manager",
      sortable: true,
      render: (value: any, row: UserAssignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {row.manager.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ms-3">
            <div className="text-sm font-medium text-gray-900">
              {row.manager.name}
            </div>
            <div className="text-sm text-gray-500">{row.manager.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      sortable: true,
      render: (value: any, row: UserAssignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {row.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ms-3">
            <div className="text-sm font-medium text-gray-900">
              {row.user.name}
            </div>
            <div className="text-sm text-gray-500">{row.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "assignedAt",
      label: "Assigned Date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 me-1" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "assigner",
      label: "Assigned By",
      sortable: true,
      render: (value: any, row: UserAssignment) => (
        <div className="flex items-center">
          <div className="h-6 w-6 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {row.assigner.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ms-2">
            <div className="text-sm font-medium text-gray-900">
              {row.assigner.name}
            </div>
            <div className="text-xs text-gray-500">{row.assigner.role}</div>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? (
            <>
              <UserCheck className="h-3 w-3 me-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 me-1" />
              Inactive
            </>
          )}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View Manager",
      action: "viewManager",
      icon: Eye,
      className: "text-green-600 hover:text-green-700",
    },
    {
      label: "View User",
      action: "viewUser",
      icon: UserIcon,
      className: "text-blue-600 hover:text-blue-700",
    },
    {
      label: "Delete",
      action: "delete",
      icon: Trash2,
      className: "text-red-600 hover:text-red-700",
    },
  ];

  const handleRowAction = (action: string, row: UserAssignment) => {
    switch (action) {
      case "viewManager":
        handleViewManager(row);
        break;
      case "viewUser":
        handleViewUser(row);
        break;
      case "delete":
        handleDeleteAssignment(row);
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
              {t("assignments.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("assignments.subtitle")}</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 me-2" />
            {t("assignments.assignUser")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                Total Assignments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                Active Assignments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter((a) => a.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-gray-900">
                {managers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                Unassigned Users
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {users.length - assignments.filter((a) => a.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Manager:</label>
            <select
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Managers</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id.toString()}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {(filterManager || filterStatus) && (
            <button
              onClick={() => {
                setFilterManager("");
                setFilterStatus("");
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssignments.length > 0 && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">
              {selectedAssignments.length} assignment(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredAssignments}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search assignments..."
        searchFields={["id"]}
        pagination={true}
        pageSize={10}
        sortable={true}
        selectable={true}
        onRowSelect={setSelectedAssignments}
        onRowAction={handleRowAction}
        actions={actions}
        loading={isLoading}
        emptyMessage="No assignments found"
        exportable={true}
        onExport={() => console.log("Export assignments")}
      />

      {/* Assign User Modal Placeholder */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Assign User to Manager
            </h3>
            <form onSubmit={handleAssignUser}>
              <input
                type="number"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                placeholder="manager id"
              />
              <input
                type="number"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="user id"
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
