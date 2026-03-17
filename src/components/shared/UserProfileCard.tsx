"use client";

import { useState } from "react";
import { User } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

interface UserProfileCardProps {
  user: User;
  onEdit?: () => void;
  showActions?: boolean;
}

export default function UserProfileCard({
  user,
  onEdit,
  showActions = true,
}: UserProfileCardProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {getInitials(user.name)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Member Since
            </label>
            <p className="text-sm text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Last Updated
            </label>
            <p className="text-sm text-gray-900">
              {formatDate(user.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
