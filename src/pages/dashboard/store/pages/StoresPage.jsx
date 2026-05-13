import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Clock, Eye,
   Store
} from "lucide-react";


import api from "../../../../services/api";
import PageHeader from "../../../../components/shared/PageHeader";

/* ══════════════════════════════════════
   Status badge
   1 = Pending, 2 = Approved, 3 = Rejected  (adjust if needed)
══════════════════════════════════════ */
const statusMeta = {
  1: { label: "Pending",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  2: { label: "Approved", bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  3: { label: "Rejected", bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400"    },
};
const StatusBadge = ({ status }) => {
  const m = statusMeta[status] ?? { label: "Unknown", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

/* ══════════════════════════════════════
   Open / Closed pill
══════════════════════════════════════ */
const OpenBadge = ({ isOpen }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
    ${isOpen ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-gray-400"}`} />
    {isOpen ? "Open" : "Closed"}
  </span>
);

/* ══════════════════════════════════════
   Store Logo / Fallback
══════════════════════════════════════ */
const COLORS = ["bg-primary-500","bg-blue-500","bg-teal-500","bg-purple-500","bg-rose-500","bg-amber-500"];
const StoreLogo = ({ store }) => {
  const color = COLORS[Math.abs((store.id?.charCodeAt(0) ?? 0) - 97) % COLORS.length];
  return store.logoPath ? (
    <img
      src={store.logoPath}
      alt={store.name}
      className="w-10 h-10 rounded-xl object-cover"
      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
    />
  ) : null;
};

const StoreAvatar = ({ store }) => {
  const color = COLORS[Math.abs((store.id?.charCodeAt(0) ?? 0) - 97) % COLORS.length];
  const initial = store.name?.[0]?.toUpperCase() ?? "S";
  return (
    <div className="relative w-10 h-10 shrink-0">
      {store.logoPath && (
        <img
          src={store.logoPath}
          alt={store.name}
          className="w-10 h-10 rounded-xl object-cover absolute inset-0"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <span className="text-sm font-bold text-white">{initial}</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Skeleton
══════════════════════════════════════ */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-36 bg-gray-200 rounded" />
      <div className="h-2.5 w-24 bg-gray-100 rounded" />
    </div>
    <div className="h-5 w-20 bg-gray-100 rounded-full" />
    <div className="h-5 w-16 bg-gray-100 rounded-full" />
    <div className="h-5 w-16 bg-gray-100 rounded-full" />
    <div className="h-8 w-10 bg-gray-100 rounded-xl" />
  </div>
);

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const StoresPage = () => {
  const navigate = useNavigate();
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openFilter, setOpenFilter]   = useState("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stores");
      return response?.data?.data || [];
    },
  });

  /* Filter options */
  const filtered = (data ?? []).filter((s) => {
    const matchSearch =
      `${s.name} ${s.vendorName} ${s.city} ${s.storeTypeName} ${s.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || String(s.status) === statusFilter;
    const matchOpen =
      openFilter === "All" ||
      (openFilter === "Open" && s.isOpen) ||
      (openFilter === "Closed" && !s.isOpen);
    return matchSearch && matchStatus && matchOpen;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Stores" subtitle="View and manage all registered stores" />

      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium">
          Failed to load stores: {error.message}
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
            placeholder="Search by name, vendor, city…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
              bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
              placeholder-gray-300 transition"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "All",  label: "All" },
            { key: "1",    label: "Pending"  },
            { key: "2",    label: "Approved" },
            { key: "3",    label: "Rejected" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${statusFilter === key
                  ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Open/Closed filter */}
        <div className="flex gap-1.5">
          {["All", "Open", "Closed"].map((f) => (
            <button
              key={f}
              onClick={() => setOpenFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all
                ${openFilter === f
                  ? "bg-primary-500 text-white shadow-sm shadow-primary-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          {["Store", "Location", "Type", "Status", "Hours", ""].map((h, i) => (
            <p key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : filtered.length === 0
            ? (
              <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
                <Store size={32} className="opacity-30" />
                <p className="text-sm">No stores found</p>
              </div>
            )
            : filtered.map((store) => (
              <div
                key={store.id}
                className="grid grid-cols-1 lg:grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_auto] gap-3 lg:gap-4
                  items-center px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Store info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 shrink-0">
                    {store.logoPath ? (
                      <img
                        src={store.logoPath}
                        alt={store.name}
                        className="w-10 h-10 rounded-xl object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.querySelector(".fallback").style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`fallback w-10 h-10 rounded-xl ${COLORS[Math.abs((store.id?.charCodeAt(0) ?? 0) - 97) % COLORS.length]}
                        flex items-center justify-center ${store.logoPath ? "absolute inset-0 hidden" : ""}`}
                    >
                      <span className="text-sm font-bold text-white">{store.name?.[0]?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{store.name}</p>
                    <p className="text-xs text-gray-400 truncate">{store.vendorName}</p>
                    {/* Mobile extras */}
                    <div className="flex flex-wrap gap-1.5 mt-1 lg:hidden">
                      <StatusBadge status={store.status} />
                      <OpenBadge isOpen={store.isOpen} />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="hidden lg:flex items-center gap-1.5 min-w-0">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-600 truncate">{store.city}, {store.country}</p>
                </div>

                {/* Type */}
                <div className="hidden lg:block">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    {store.storeTypeName}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden lg:block">
                  <StatusBadge status={store.status} />
                </div>

                {/* Hours */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400 shrink-0" />
                  <div>
                    <OpenBadge isOpen={store.isOpen} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {store.opensAt?.slice(0,5)} – {store.closesAt?.slice(0,5)}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(`/dashboard/stores/${store.id}`)}
                    title="View details"
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-primary-500 flex items-center justify-center
                      transition-colors group"
                  >
                    <Eye size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            ))
          }
        </div>

        {/* Footer */}
        {!isLoading && data && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{data.length}</span> stores
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;