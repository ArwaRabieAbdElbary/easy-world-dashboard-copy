// pages/dashboard/MyUsersPage.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, CheckCircle, XCircle, Phone, Mail } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/shared/PageHeader";

/* ── Role badge colors ── */
const roleMeta = {
  Admin:        { bg: "bg-purple-50",  text: "text-purple-700" },
  Customer:     { bg: "bg-blue-50",    text: "text-blue-700"   },
  VendorOwner:  { bg: "bg-amber-50",   text: "text-amber-700"  },
  VendorStaff:  { bg: "bg-teal-50",    text: "text-teal-700"   },
};

const RoleBadge = ({ role }) => {
  const meta = roleMeta[role] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
      <Shield size={9} />
      {role}
    </span>
  );
};

/* ── Avatar ── */
const Avatar = ({ user }) => {
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const colors = [
    "bg-primary-500", "bg-blue-500", "bg-teal-500",
    "bg-purple-500",  "bg-rose-500", "bg-amber-500",
  ];
  const color = colors[Math.abs(user.id.charCodeAt(0) - 97) % colors.length];

  return user.imagePath ? (
    <img
      src={user.imagePath}
      alt={`${user.firstName} ${user.lastName}`}
      className="w-10 h-10 rounded-xl object-cover"
    />
  ) : (
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
};

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-32 bg-gray-200 rounded" />
      <div className="h-2.5 w-48 bg-gray-100 rounded" />
    </div>
    <div className="h-5 w-20 bg-gray-100 rounded-full" />
    <div className="h-5 w-14 bg-gray-100 rounded-full" />
  </div>
);

/* ── Page ── */
const MyUsersPage = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["myUsers"],
    queryFn: async () => {
      const response = await api.get("/dashboard/admin/getallusers");
      return response?.data?.data?.users || [];
    },
  });

  /* Unique roles for filter tabs */
  const roles = ["All", ...Array.from(new Set((data ?? []).flatMap((u) => u.roles)))];

  /* Filter */
  const filtered = (data ?? []).filter((u) => {
    const matchSearch =
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === "All" || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="My Users" subtitle="View and manage your users" />

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load users: {error.message}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
              bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
              placeholder-gray-300 transition"
          />
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${roleFilter === r
                  ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {["User", "Email", "Role", "Status"].map((h) => (
            <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : filtered.length === 0
            ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                No users found
              </div>
            )
            : filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr] gap-3 sm:gap-4
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
                  {user.emailConfirmed
                    ? <CheckCircle size={13} className="text-green-500 shrink-0" />
                    : <XCircle size={13} className="text-gray-300 shrink-0" />
                  }
                </div>

                {/* Role */}
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((r) => <RoleBadge key={r} role={r} />)}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-400"}`} />
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          }
        </div>

        {/* Footer count */}
        {!isLoading && data && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{data.length}</span> users
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUsersPage;