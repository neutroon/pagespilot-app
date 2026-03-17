"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { adminService, FacebookAccount, User } from "@/lib/admin-api";
import DataTable from "@/components/shared/DataTable";
import {
  Trash2,
  Eye,
  Facebook,
  User as UserIcon,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
} from "lucide-react";

export default function FacebookPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<
    (FacebookAccount & { user: User })[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<
    (FacebookAccount & { user: User })[]
  >([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);

      // Fetch Facebook accounts for all users
      const allAccounts: (FacebookAccount & { user: User })[] = [];
      for (const user of usersData) {
        try {
          const userAccounts = await adminService.getUserFacebookAccounts(
            user.id
          );
          // Add user info to each account
          const accountsWithUser = userAccounts.map((account) => ({
            ...account,
            user: user,
          }));
          allAccounts.push(...accountsWithUser);
        } catch (error) {
          console.error(`Failed to fetch accounts for user ${user.id}:`, error);
        }
      }

      setAccounts(allAccounts);
    } catch (error) {
      console.error("Failed to fetch Facebook accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAccount = (account: FacebookAccount & { user: User }) => {
    router.push(`/admin/facebook/${account.id}`);
  };

  const handleDeleteAccount = async (
    account: FacebookAccount & { user: User }
  ) => {
    if (
      confirm(
        `Are you sure you want to delete this Facebook account? This action cannot be undone.`
      )
    ) {
      try {
        await adminService.deleteFacebookAccount(account.id);
        await fetchData();
      } catch (error) {
        console.error("Failed to delete Facebook account:", error);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedAccounts.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedAccounts.length} selected Facebook accounts?`
      )
    ) {
      // Implement bulk deletion
      console.log("Bulk delete accounts:", selectedAccounts);
    }
  };

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter((account) => {
    if (filterUser && account.user.id.toString() !== filterUser) {
      return false;
    }
    if (filterStatus && account.isActive.toString() !== filterStatus) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 me-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 me-1" />
        Inactive
      </span>
    );
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "80px",
      sortable: true,
    },
    {
      key: "user",
      label: "User",
      sortable: true,
      render: (value: any, row: FacebookAccount & { user: User }) => (
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
      key: "facebookUserId",
      label: "Facebook User ID",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <Facebook className="h-4 w-4 text-blue-600 me-2" />
          <span className="text-sm font-mono text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "pages",
      label: "Connected Pages",
      render: (value: any[]) => (
        <div className="flex items-center">
          <span className="text-sm text-gray-900">{value?.length || 0}</span>
          {value && value.length > 0 && (
            <span className="ms-1 text-xs text-gray-500">
              ({value.filter((p) => p.isActive).length} active)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value: boolean) => getStatusBadge(value),
    },
    {
      key: "lastUsedAt",
      label: "Last Used",
      sortable: true,
      render: (value: string | null) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 me-1" />
          {value ? new Date(value).toLocaleDateString() : "Never"}
        </div>
      ),
    },
    {
      key: "_count",
      label: "Activities",
      render: (value: any) => (
        <div className="flex items-center">
          <Activity className="h-4 w-4 text-gray-400 me-1" />
          <span className="text-sm text-gray-900">
            {value?.activities || 0}
          </span>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      action: "view",
      icon: Eye,
      className: "text-blue-600 hover:text-blue-700",
    },
    {
      label: "Delete",
      action: "delete",
      icon: Trash2,
      className: "text-red-600 hover:text-red-700",
    },
  ];

  const handleRowAction = (
    action: string,
    row: FacebookAccount & { user: User }
  ) => {
    switch (action) {
      case "view":
        handleViewAccount(row);
        break;
      case "delete":
        handleDeleteAccount(row);
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
              {t("facebook.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("facebook.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Facebook className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("facebook.stats.totalAccounts")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("facebook.stats.activeAccounts")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.filter((a) => a.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("facebook.stats.totalPages")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.reduce(
                  (total, account) => total + (account.pages?.length || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ms-3">
              <p className="text-sm font-medium text-gray-600">
                {t("facebook.stats.totalActivities")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.reduce(
                  (total, account) => total + (account._count?.activities || 0),
                  0
                )}
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
            <label className="text-sm text-gray-600">User:</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {(filterUser || filterStatus) && (
            <button
              onClick={() => {
                setFilterUser("");
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
      {selectedAccounts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">
              {selectedAccounts.length} account(s) selected
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
        data={filteredAccounts}
        columns={columns}
        searchable={true}
        searchPlaceholder="Search Facebook accounts..."
        searchFields={["facebookUserId"]}
        pagination={true}
        pageSize={10}
        sortable={true}
        selectable={true}
        onRowSelect={setSelectedAccounts}
        onRowAction={handleRowAction}
        actions={actions}
        loading={isLoading}
        emptyMessage="No Facebook accounts found"
        exportable={true}
        onExport={() => console.log("Export Facebook accounts")}
      />

      {/* Account Detail Modal Placeholder */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Eye className="h-5 w-5 text-blue-600 me-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  View Account Details
                </p>
                <p className="text-sm text-gray-500">
                  See pages and activities
                </p>
              </div>
            </button>
            <button className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 me-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Refresh Tokens</p>
                <p className="text-sm text-gray-500">Update access tokens</p>
              </div>
            </button>
            <button className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors">
              <AlertCircle className="h-5 w-5 text-red-600 me-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Bulk Actions</p>
                <p className="text-sm text-gray-500">
                  Manage multiple accounts
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
