// pages/dashboard/UserDetailsPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  KeyRound,
} from "lucide-react";
import { useState } from "react";
import api from "../../../../services/api";
import PageHeader from "../../../../components/shared/PageHeader";

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
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}
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
      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md"
    />
  ) : (
    <div
      className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center border-4 border-white shadow-md`}
    >
      <span className="text-2xl font-extrabold text-white">{initials}</span>
    </div>
  );
};

/* ══════════════════════════════════════
   Reset Password Dialog
══════════════════════════════════════ */
const ResetPasswordDialog = ({ user, onClose, onConfirm }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                bg-gray-50 hover:bg-white transition placeholder-gray-300"
            />
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
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                bg-gray-50 hover:bg-white transition placeholder-gray-300"
            />
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
              disabled={!canSubmit}
              onClick={() => onConfirm(newPassword)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500
                hover:bg-primary-600 shadow-sm shadow-primary-200 transition
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════
   Info row inside card
══════════════════════════════════════ */
const InfoRow = ({ icon: Icon, label, value, sub, subGreen }) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors group">
    <span
      className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0
      group-hover:bg-primary-500 transition-colors"
    >
      <Icon
        size={15}
        className="text-gray-400 group-hover:text-white transition-colors"
      />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">
        {value || "—"}
      </p>
      {sub && (
        <p
          className={`text-xs font-medium mt-0.5 ${subGreen ? "text-green-600" : "text-red-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════
   Skeleton
══════════════════════════════════════ */
const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-40 rounded-3xl bg-gray-200" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-48 rounded-3xl bg-gray-100" />
      <div className="h-48 rounded-3xl bg-gray-100" />
    </div>
  </div>
);

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: async () => {
      const response = await api.get(`/dashboard/admin/getallusers`);
      const users = response?.data?.data?.users || [];
      return users.find((u) => u.id === userId) ?? null;
    },
    enabled: !!userId,
  });

  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (user.isActive) {
        // ACTIVE → UNAPPROVE
        return await api.put(`/dashboard/admin/unapprove?userId=${user.id}`);
      }

      // INACTIVE → APPROVE
      return await api.put(`/dashboard/admin/approve?userId=${user.id}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userDetails", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["myUsers"],
      });
    },
  });

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate();
  };
  const handleResetPassword = (newPassword) => {
    console.log("Reset password for:", userId, newPassword);
    // await api.post(`/dashboard/admin/forceResetPassword`, { userId, newPassword })
    setResetOpen(false);
  };

  const joinDate = user?.createdOn
    ? new Date(user.createdOn).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="User Details"
        subtitle="Detailed information and actions for this user"
      />

      {/* Back + Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <button
          onClick={() => navigate("/dashboard/users")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} /> Back to Users List
        </button>

        {!isLoading && user && (
          <div className="flex gap-2">
            {/* Approve / Deactivate */}
            <button
              disabled={toggleStatusMutation.isPending}
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm
                ${
                  user.isActive
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-500 text-white hover:bg-green-600 shadow-green-200"
                }`}
            >
              {user.isActive ? (
                <>
                  <UserX size={15} /> Deactivate User
                </>
              ) : (
                <>
                  <UserCheck size={15} /> Approve User
                </>
              )}
            </button>

            {/* Force reset password */}
            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-white border border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              <KeyRound size={15} /> Force Reset Password
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load user: {error.message}
        </div>
      )}

      {isLoading && <Skeleton />}

      {!isLoading && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ── Profile Information ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card banner */}
            <div className="h-20 bg-linear-to-r from-primary-400 via-primary-500 to-primary-300 relative">
              <svg
                className="absolute inset-0 w-full h-full opacity-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="dp"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dp)" />
              </svg>
            </div>

            <div className="px-5 pb-5">
              {/* Avatar overlap */}
              <div className="flex items-end gap-3 -mt-10 mb-4">
                <Avatar user={user} />
                <div className="pb-1">
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-2">
                {/* User ID */}
                <div className="p-3 rounded-2xl bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    User ID
                  </p>
                  <p className="text-xs font-mono font-semibold text-gray-600 break-all">
                    {user.id}
                  </p>
                </div>

                {/* Full name */}
                <div className="p-3 rounded-2xl bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Account Status & Contact ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={15} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-800">
                Account Status & Contact
              </h3>
            </div>

            {/* Status + Joined row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                  ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-400"}`}
                  />
                  {user.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium mb-1">Joined</p>
                <p className="text-sm font-semibold text-gray-800">
                  {joinDate}
                </p>
              </div>
            </div>

            {/* Email */}
            <InfoRow
              icon={Mail}
              label="Email Address"
              value={user.email}
              sub={user.emailConfirmed ? "Verified Email" : "Unverified Email"}
              subGreen={user.emailConfirmed}
            />

            {/* Phone */}
            <InfoRow
              icon={Phone}
              label="Phone Number"
              value={user.phoneNumber || "Not provided"}
              sub={
                user.phoneNumber
                  ? user.phoneConfirmed
                    ? "Verified Phone"
                    : "Unverified Phone"
                  : undefined
              }
              subGreen={user.phoneConfirmed}
            />
          </div>
        </div>
      )}

      {/* Not found */}
      {!isLoading && !user && !error && (
        <div className="py-20 text-center text-gray-400 text-sm">
          User not found.
        </div>
      )}

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resetOpen ? user : null}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetPassword}
      />
    </div>
  );
};

export default UserDetailsPage;
