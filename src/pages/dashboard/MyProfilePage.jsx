// pages/dashboard/MyProfilePage.jsx
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Shield, Calendar, CheckCircle, XCircle, Camera } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/shared/PageHeader";

/* ── Info Card ── */
const InfoCard = ({ icon: Icon, label, value, verified }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors group">
    <span className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:bg-primary-500 transition-colors">
      <Icon size={15} className="text-gray-400 group-hover:text-white transition-colors" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-800 truncate">{value || "—"}</p>
        {verified !== undefined && (
          verified
            ? <CheckCircle size={13} className="text-green-500 shrink-0" />
            : <XCircle size={13} className="text-gray-300 shrink-0" />
        )}
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="p-4 rounded-2xl bg-gray-50 flex gap-3 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-2.5 w-16 bg-gray-200 rounded" />
      <div className="h-3.5 w-32 bg-gray-200 rounded" />
    </div>
  </div>
);

/* ── Page ── */
const MyProfilePage = () => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const response = await api.get("/dashboard/admin/getcurrentuserinfo");
      return response?.data?.data || {};
    },
  });

  const initials = data
    ? `${data.firstName?.[0] ?? ""}${data.lastName?.[0] ?? ""}`.toUpperCase()
    : "A";
  const fullName = data ? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() : null;
  const role = data?.roles?.[0] ?? "Administrator";
  const formattedDate = data?.createdOn
    ? new Date(data.createdOn).toLocaleDateString("en-GB", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const avatarSrc = previewImage || data?.imagePath;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="View and manage your account information"
      />

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load profile: {error.message}
        </div>
      )}

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-300 relative shrink-0">
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + name */}
          <div className="flex items-end gap-4 -mt-12 mb-6">
            {/* Avatar with upload button */}
            <div className="relative">
              {isLoading ? (
                <div className="w-24 h-24 rounded-2xl bg-gray-200 animate-pulse border-4 border-white shadow-md" />
              ) : avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={fullName}
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-primary-500 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{initials}</span>
                </div>
              )}

              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-gray-100
                  shadow-md flex items-center justify-center hover:bg-primary-500 hover:border-primary-500
                  transition-colors group/cam"
                title="Change photo"
              >
                <Camera size={13} className="text-gray-500 group-hover/cam:text-white transition-colors" />
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {isLoading ? (
              <div className="pb-1 space-y-2 animate-pulse">
                <div className="h-5 w-36 bg-gray-200 rounded" />
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
              </div>
            ) : (
              <div className="pb-1">
                <h2 className="text-xl font-bold text-gray-900 mt-12">{fullName || "Admin"}</h2>
                <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                  <Shield size={10} />
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Info cards — always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                <InfoCard icon={Mail}     label="Email Address"  value={data?.email}                          verified={data?.emailConfirmed} />
                <InfoCard icon={Phone}    label="Phone Number"   value={data?.phoneNumber || "Not provided"}  verified={data?.phoneConfirmed} />
                <InfoCard icon={Shield}   label="Account Status" value={data?.isActive ? "Active" : "Inactive"} />
                <InfoCard icon={Calendar} label="Member Since"   value={formattedDate} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Form — always visible below ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
          Edit Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "First Name", key: "firstName",   type: "text"  },
            { label: "Last Name",  key: "lastName",    type: "text"  },
            { label: "Email",      key: "email",       type: "email" },
            { label: "Phone",      key: "phoneNumber", type: "tel"   },
          ].map(({ label, key, type }) => (
            <div key={key} className={key === "email" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              {isLoading ? (
                <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
              ) : (
                <input
                  type={type}
                  defaultValue={data?.[key] ?? ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    placeholder-gray-300 bg-gray-50 hover:bg-white transition"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500
              hover:bg-primary-600 shadow-sm shadow-primary-200 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;