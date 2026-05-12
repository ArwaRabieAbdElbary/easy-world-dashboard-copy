// pages/dashboard/MyUsersPage.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Eye,
  UserCheck,
  UserX,
  KeyRound,
  EyeOff,
  EyeIcon,
} from "lucide-react";

import api from "../../../../services/api";
import PageHeader from "../../../../components/shared/PageHeader";
import toast from "react-hot-toast";

/* ══════════════════════════════════════
   Role badge
══════════════════════════════════════ */



const roleMeta = {
  Admin: { bg: "bg-purple-50", text: "text-purple-700" },
  Customer: { bg: "bg-blue-50", text: "text-blue-700" },
  VendorOwner: { bg: "bg-amber-50", text: "text-amber-700" },
  VendorStaff: { bg: "bg-teal-50", text: "text-teal-700" },
};
const RoleBadge = ({ role }) => {
  const m = roleMeta[role] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}
    >
      <Shield size={9} /> {role}
    </span>
  );
};

/* ══════════════════════════════════════
   Avatar
══════════════════════════════════════ */
const COLORS = [
  "bg-primary-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-amber-500",
];
const Avatar = ({ user }) => {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const color =
    COLORS[Math.abs((user.id?.charCodeAt(0) ?? 0) - 97) % COLORS.length];
  return user.imagePath ? (
    <img
      src={user.imagePath}
      alt={`${user.firstName} ${user.lastName}`}
      className="w-10 h-10 rounded-xl object-cover"
    />
  ) : (
    <div
      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
    >
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
};

/* ══════════════════════════════════════
   Skeleton row
══════════════════════════════════════ */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-32 bg-gray-200 rounded" />
      <div className="h-2.5 w-48 bg-gray-100 rounded" />
    </div>
    <div className="h-5 w-20 bg-gray-100 rounded-full" />
    <div className="h-5 w-14 bg-gray-100 rounded-full" />
    <div className="h-8 w-24 bg-gray-100 rounded-xl" />
  </div>
);

/* ══════════════════════════════════════
   Reset Password Dialog
══════════════════════════════════════ */
const ResetPasswordDialog = ({ user, onClose, onConfirm, isLoading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const valid = newPassword.length >= 8;
  const matched = newPassword === confirm;
  const canSubmit = valid && matched && confirm.length > 0;



  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <KeyRound size={22} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Force Reset Password
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Set a new password for{" "}
            <span className="font-semibold text-gray-700">
              {user.firstName} {user.lastName}
            </span>
          </p>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                autoComplete="new-password"  
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  bg-gray-50 hover:bg-white transition placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {newPassword.length > 0 && !valid && (
              <p className="text-xs text-red-500 mt-1">
                At least 8 characters required
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"  
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  bg-gray-50 hover:bg-white transition placeholder-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
            {confirm.length > 0 && !matched && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit || isLoading}
              onClick={() => onConfirm(user, newPassword)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500
    hover:bg-primary-600 shadow-sm shadow-primary-200 transition
    disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const MyUsersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [resetUser, setResetUser] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myUsers"],
    queryFn: async () => {
      const response = await api.get("/dashboard/admin/getallusers");
      return response?.data?.data?.users || [];
    },
  });

  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async (user) => {
      // لو Active → اعمله Unapprove
      if (user.isActive) {
        return await api.put(`/dashboard/admin/unapprove?userId=${user.id}`);
      }

      // لو Inactive → اعمله Approve
      return await api.put(`/dashboard/admin/approve?userId=${user.id}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myUsers"],
      });
    },

    onError: (error) => {
      console.log(error);
    },
  });
  const roles = [
    "All",
    ...Array.from(new Set((data ?? []).flatMap((u) => u.roles))),
  ];
  const filtered = (data ?? []).filter((u) => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  const handleToggleStatus = (user) => {
    console.log("Toggle status for:", user.id, "currently:", user.isActive);
    toggleStatusMutation.mutate(user);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }) => {
      return await api.patch("/dashboard/admin/reset-password", {
        userId,
        newPassword,
      });
    },

    onSuccess: () => {
      setResetUser(null);
      queryClient.invalidateQueries({ queryKey: ["myUsers"] });
      toast.success("Password reset successfully");
    },

    onError: (error) => {
      console.log("Reset password error:", error);
      toast.error("Failed to reset password");
    },
  });

  const handleResetPassword = (user, newPassword) => {
    resetPasswordMutation.mutate({
      userId: user.id,
      newPassword,
    });
  };

  console.log("SEARCH VALUE:", search);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="My Users" subtitle="View and manage your users" />

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load users: {error.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            autoComplete="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
              bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
              placeholder-gray-300 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${
                  roleFilter === r
                    ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {["User", "Email", "Role", "Status", "Actions"].map((h) => (
            <p
              key={h}
              className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
            >
              {h}
            </p>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No users found
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 sm:gap-4
                  items-center px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <Avatar user={user} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 sm:hidden">
                      <Mail size={10} /> {user.email}
                    </p>
                    {user.phoneNumber && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 sm:hidden">
                        <Phone size={10} /> {user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  {user.emailConfirmed ? (
                    <CheckCircle
                      size={13}
                      className="text-green-500 shrink-0"
                    />
                  ) : (
                    <XCircle size={13} className="text-gray-300 shrink-0" />
                  )}
                </div>

                {/* Role */}
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-400"}`}
                    />
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* View details → navigate to details page */}
                  <button
                    onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    title="View details"
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-primary-500 flex items-center justify-center
                      transition-colors group"
                  >
                    <Eye
                      size={14}
                      className="text-gray-500 group-hover:text-white transition-colors"
                    />
                  </button>

                  {/* Approve / Deactivate */}
                  <button
                    onClick={() => handleToggleStatus(user)}
                    title={user.isActive ? "Deactivate" : "Approve"}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors group
                      ${user.isActive ? "bg-red-50 hover:bg-red-500" : "bg-green-50 hover:bg-green-500"}`}
                  >
                    {user.isActive ? (
                      <UserX
                        size={14}
                        className="text-red-500 group-hover:text-white transition-colors"
                      />
                    ) : (
                      <UserCheck
                        size={14}
                        className="text-green-600 group-hover:text-white transition-colors"
                      />
                    )}
                  </button>

                  {/* Force reset password */}
                  <button
                    onClick={() => setResetUser(user)}
                    title="Force reset password"
                    className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-500 flex items-center justify-center
                      transition-colors group"
                  >
                    <KeyRound
                      size={14}
                      className="text-amber-500 group-hover:text-white transition-colors"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!isLoading && data && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">{data.length}</span>{" "}
              users
            </p>
          </div>
        )}
      </div>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={handleResetPassword}
        isLoading={resetPasswordMutation.isPending}
      />
    </div>
  );


};

export default MyUsersPage;
