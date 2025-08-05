"use client";

import { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, UserCircleIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer";
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserSearchProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  className?: string;
  excludeUserId?: string;
}

export default function UserSearch({ 
  onUserSelect, 
  placeholder = "Search users...", 
  className = "",
  excludeUserId 
}: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"farmer" | "buyer" | "">("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchUsers();
      } else {
        setUsers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedRole]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      // Build the URL with dynamic parameters
      let url = `/api/search/users/${encodeURIComponent(query.trim())}`;
      
      // Add role and limit as query parameters
      const params = new URLSearchParams({
        limit: "10"
      });
      
      if (selectedRole) {
        params.append("role", selectedRole);
      }

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.success) {
        // Filter out current user if excludeUserId is provided
        const filteredUsers = excludeUserId 
          ? data.users.filter((user: User) => user.id !== excludeUserId)
          : data.users;
        
        setUsers(filteredUsers);
        setShowDropdown(filteredUsers.length > 0);
      } else {
        setUsers([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setQuery("");
    setUsers([]);
    setShowDropdown(false);
    setSelectedRole("");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          onFocus={() => setShowDropdown(users.length > 0)}
        />
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setSelectedRole(selectedRole === "farmer" ? "" : "farmer")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedRole === "farmer" 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Farmers
        </button>
        <button
          onClick={() => setSelectedRole(selectedRole === "buyer" ? "" : "buyer")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedRole === "buyer" 
              ? "bg-blue-100 text-blue-800" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Buyers
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : users.length > 0 ? (
            <div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {user.name}
                      </span>
                      {user.isVerified && (
                        <CheckBadgeIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        user.role === "farmer" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role}
                      </span>
                      {user.phone && (
                        <span className="text-xs text-gray-400">
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() && !loading ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 