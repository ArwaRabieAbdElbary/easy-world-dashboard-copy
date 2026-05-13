// pages/dashboard/stores/pages/StoreDetailsPage.jsx

import { useParams, useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Tag,
  Building2,
  Navigation,
  CheckCircle2,
  Ban,
} from "lucide-react";

import api from "../../../../services/api";
import PageHeader from "../../../../components/shared/PageHeader";
import { useState } from "react";

/* ══════════════════════════════════════
   Status
══════════════════════════════════════ */
const statusMeta = {
  1: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },

  2: {
    label: "Approved",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },

  3: {
    label: "Suspended",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

const StatusBadge = ({ status }) => {
  const m = statusMeta[status] ?? {
    label: "Unknown",
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${m.bg} ${m.text}`}
    >
      <span className={`w-2 h-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

/* ══════════════════════════════════════
   Info row
══════════════════════════════════════ */
const InfoRow = ({
  icon: Icon,
  label,
  value,
  sub,
  subGreen,
}) => (
  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors group">
    <span
      className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0
      group-hover:bg-primary-500 transition-colors"
    >
      <Icon
        size={15}
        className="text-gray-400 group-hover:text-white transition-colors"
      />
    </span>

    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 font-medium mb-0.5">
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-800 wrap-break-word">
        {value || "—"}
      </p>

      {sub && (
        <p
          className={`text-xs font-medium mt-0.5 ${
            subGreen ? "text-green-600" : "text-red-400"
          }`}
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
  <div className="animate-pulse space-y-5">
    <div className="h-52 rounded-3xl bg-gray-200" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="h-64 rounded-3xl bg-gray-100" />
      <div className="h-64 rounded-3xl bg-gray-100" />
    </div>

    <div className="h-40 rounded-3xl bg-gray-100" />
  </div>
);

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const StoreDetailsPage = () => {
  const { id: storeId } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  /* ══════════════════════════════════════
     Get Store
  ══════════════════════════════════════ */
  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storeDetails", storeId],

    queryFn: async () => {
      const response = await api.get(
        `/dashboard/stores/${storeId}`
      );

      return response?.data?.data || null;
    },

    enabled: !!storeId,
  });

  /* ══════════════════════════════════════
     Approve Store
  ══════════════════════════════════════ */
  const approveMutation = useMutation({
    mutationFn: async () => {
      await api.patch(
        `/dashboard/stores/${storeId}/approve`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["storeDetails", storeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    },
  });

  /* ══════════════════════════════════════
     Suspend Store
  ══════════════════════════════════════ */
  const suspendMutation = useMutation({
    mutationFn: async () => {
      await api.patch(
        `/dashboard/stores/${storeId}/suspend`
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["storeDetails", storeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    },
  });

  const joinDate = store?.createdOn
    ? new Date(store.createdOn).toLocaleDateString(
        "en-GB",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : "—";

  const COLORS = [
    "bg-primary-500",
    "bg-blue-500",
    "bg-teal-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-amber-500",
  ];

  const logoFallbackColor =
    COLORS[
      Math.abs(
        (store?.id?.charCodeAt(0) ?? 0) - 97
      ) % COLORS.length
    ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Store Details"
        subtitle="Detailed information for this store"
      />

      {/* Back */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/dashboard/stores")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} />
          Back to Stores
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load store: {error.message}
        </div>
      )}

      {/* Loading */}
      {isLoading && <Skeleton />}

      {/* Content */}
      {!isLoading && store && (
        <div className="space-y-5">

          {/* ───────────────────────── */}
          {/* Hero Card */}
          {/* ───────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Cover */}
            <div className="h-48 relative bg-gray-200">
              {store.coverPath && !coverError ? (
                <img
                  src={store.coverPath}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onError={() => setCoverError(true)}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-r from-primary-400 via-primary-500 to-primary-300" />
              )}

              <div className="absolute top-4 right-4">
                <StatusBadge status={store.status} />
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">

              {/* Logo */}
              <div className="flex items-end gap-4 -mt-10 mb-5">

                {store.logoPath && !logoError ? (
                  <img
                    src={store.logoPath}
                    alt={store.name}
                    className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-2xl border-4 border-white shadow-md ${logoFallbackColor}
                    flex items-center justify-center`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {store.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {store.name}
                  </h2>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      <Tag size={10} />
                      {store.storeTypeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-5">

                {/* Approve */}
                {store.status !== 2 && (
                  <button
                    onClick={() =>
                      approveMutation.mutate()
                    }
                    disabled={
                      approveMutation.isPending
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl
                    bg-green-500 hover:bg-green-600 text-white text-sm font-semibold
                    transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />

                    {approveMutation.isPending
                      ? "Approving..."
                      : "Approve Store"}
                  </button>
                )}

                {/* Suspend */}
                <button
                  onClick={() =>
                    suspendMutation.mutate()
                  }
                  disabled={
                    suspendMutation.isPending
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl
                  bg-red-500 hover:bg-red-600 text-white text-sm font-semibold
                  transition disabled:opacity-50"
                >
                  <Ban size={16} />

                  {suspendMutation.isPending
                    ? "Suspending..."
                    : "Suspend Store"}
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 size={12} />
                  {store.vendorName}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {store.addressLine}, {store.city}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Contact */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />

                <h3 className="text-sm font-bold text-gray-800">
                  Contact Information
                </h3>
              </div>

              <InfoRow
                icon={Phone}
                label="Primary Phone"
                value={store.phonePrimary}
              />

              <InfoRow
                icon={Mail}
                label="Email Address"
                value={store.email}
              />
            </div>

            {/* Location */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />

                <h3 className="text-sm font-bold text-gray-800">
                  Location
                </h3>
              </div>

              <InfoRow
                icon={MapPin}
                label="Address"
                value={store.addressLine}
              />

              <InfoRow
                icon={Building2}
                label="City"
                value={`${store.city}, ${store.country}`}
              />

              <InfoRow
                icon={Navigation}
                label="Coordinates"
                value={`${store.latitude}, ${store.longitude}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailsPage;