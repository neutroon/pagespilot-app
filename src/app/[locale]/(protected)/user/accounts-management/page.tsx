import AppNavbar from "@/components/shared/AppNavbar";

export default function AccountsManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Accounts Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your accounts and pages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Accounts
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
