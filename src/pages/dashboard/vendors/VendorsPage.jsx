import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Users, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import api from "../../../services/api";


/* ══════════════════════════════════════
   Helpers
══════════════════════════════════════ */
const STATUS_MAP = {
  1: { label: "Active",   cls: "bg-green-50 text-green-600" },
  0: { label: "Inactive", cls: "bg-gray-100 text-gray-500"  },
  2: { label: "Banned",   cls: "bg-red-50 text-red-500"     },
};

const getStatus = (s) =>
  STATUS_MAP[s] ?? { label: `Status ${s}`, cls: "bg-gray-100 text-gray-500" };

/* ══════════════════════════════════════
   Skeleton Card
══════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl overflow-hidden border border-gray-100 bg-white">
    <div className="h-36 bg-gray-200" />
    <div className="px-5 pb-5">
      <div className="-mt-7 mb-4 w-14 h-14 rounded-2xl bg-gray-300 border-4 border-white" />
      <div className="h-4 w-32 rounded bg-gray-200 mb-2" />
      <div className="h-3 w-24 rounded bg-gray-100 mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-gray-100" />
        <div className="h-8 w-20 rounded-xl bg-gray-200" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════
   Vendor Card
══════════════════════════════════════ */
const VendorCard = ({ vendor, onManage }) => {
  const status = getStatus(vendor.status);

  return (
    <div className="group rounded-3xl overflow-hidden border border-gray-100 bg-white
      shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* Cover */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {vendor.coverPath ? (
          <img
            src={vendor.coverPath}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.querySelector(".cover-fallback").style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="cover-fallback w-full h-full items-center justify-center bg-linear-to-br from-primary-50 to-primary-100"
          style={{ display: vendor.coverPath ? "none" : "flex" }}
        >
          <ImageOff size={28} className="text-primary-300" />
        </div>
        {/* subtle dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        {/* Logo — overlaps cover */}
        <div className="relative -mt-7 mb-3 w-14 h-14 rounded-2xl border-4 border-white
          bg-white shadow-md overflow-hidden shrink-0">
          {vendor.logoPath ? (
            <img
              src={vendor.logoPath}
              alt={`${vendor.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement.querySelector(".logo-fallback").style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="logo-fallback w-full h-full items-center justify-center bg-primary-50"
            style={{ display: vendor.logoPath ? "none" : "flex" }}
          >
            <Store size={20} className="text-primary-400" />
          </div>
        </div>

        {/* Name + slug */}
        <h2 className="text-base font-black text-gray-900 leading-tight mb-0.5">{vendor.name}</h2>
        <p className="text-xs text-gray-400 mb-4 font-medium">{vendor.slug}</p>

        {/* Status + Manage */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>
            {status.label}
          </span>
          <button
            onClick={() => onManage(vendor.id)}
            className="h-8 px-4 rounded-xl bg-gray-100 hover:bg-primary-500
              hover:text-white text-sm font-semibold text-gray-600 transition-all"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const VendorsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["vendors", page],
    queryFn: async () => {
      const res = await api.get("/dashboard/vendors", {
        params: { page, pageSize },
      });
      return res?.data || {};
    },
    keepPreviousData: true,
  });

  const vendors     = data?.data        || [];
  const totalCount  = data?.totalCount  ?? 0;
  const totalPages  = data?.totalPages  ?? 1;

  const activeCount   = vendors.filter((v) => v.status === 1).length;
  const inactiveCount = vendors.filter((v) => v.status !== 1).length;

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">Browse and manage all registered vendors</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          Failed to load vendors
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Vendors</p>
                <h3 className="text-3xl font-black text-gray-900">{totalCount}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Users size={26} className="text-primary-500" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active</p>
                <h3 className="text-3xl font-black text-green-600">{activeCount}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <Store size={26} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Inactive / Other</p>
                <h3 className="text-3xl font-black text-gray-500">{inactiveCount}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Store size={26} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onManage={(id) => navigate(`/dashboard/vendors/${id}`)}
              />
            ))}
      </div>

      {/* Empty state */}
      {!isLoading && !error && vendors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Store size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-semibold">No vendors found</p>
          <p className="text-sm text-gray-400 mt-1">There are no vendors registered yet</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
              hover:bg-primary-50 hover:border-primary-200 transition
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition
                ${p === page
                  ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-200"
                }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center
              hover:bg-primary-50 hover:border-primary-200 transition
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;