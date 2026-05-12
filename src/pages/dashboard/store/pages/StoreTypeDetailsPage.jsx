import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Store,
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  Code2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "../../../../services/api";
import toast from "react-hot-toast";

/* ══════════════════════════════════════
   Skeleton
══════════════════════════════════════ */
const SkeletonDetail = () => (
  <div className="animate-pulse max-w-2xl mx-auto space-y-5">
    <div className="h-8 w-48 bg-gray-200 rounded-xl" />
    <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-gray-100" />
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════
   Info Row
══════════════════════════════════════ */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-100">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
        <Icon size={15} className="text-gray-500" />
      </div>
      <span className="text-sm font-semibold text-gray-500">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-800">{value}</span>
  </div>
);

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const StoreTypeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["store-type", id],
    queryFn: async () => {
      const res = await api.get(`/dashboard/store-types/${id}`);
      return res.data.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/dashboard/store-types/${id}/active`, 
        { isActive: !data?.isActive },
        { headers: { "Content-Type": "application/json" } }
      );
      return res.data.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["store-type", id], newData);
      toast.success(newData?.isActive ? "Store type activated" : "Store type deactivated");
      // نحدث الـ list في الـ background بس من غير ما نعمل refetch للـ details
      queryClient.setQueryData(["store-types"], (oldList) =>
        oldList?.map((item) =>
          item.id === id ? { ...item, isActive: newData.isActive } : item
        )
      );
    },
    onError: () => toast.error("Failed to update status"),
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) return <SkeletonDetail />;

  if (error)
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
          Failed to load store type details
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500
          hover:text-primary-500 transition-colors mb-6 group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Store Types
      </button>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              {data.iconPath ? (
                <img
                  src={data.iconPath}
                  alt={data.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Store size={36} className="text-primary-500" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-gray-900">{data.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{data.code}</p>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold
                  ${data.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${data.isActive ? "bg-green-500" : "bg-red-400"}`}
                />
                {data.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Info Rows */}
        <InfoRow icon={Code2} label="Code" value={data.code} />
        <InfoRow icon={ArrowUpDown} label="Sort Order" value={data.sortOrder} />
        <InfoRow
          icon={Calendar}
          label="Created On"
          value={formatDate(data.createdOn)}
        />

        {/* Toggle Status */}
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl
            border border-gray-100 bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
              {data.isActive ? (
                <ToggleRight size={15} className="text-green-500" />
              ) : (
                <ToggleLeft size={15} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Status</p>
              <p className="text-xs text-gray-400">
                {data.isActive
                  ? "Click to deactivate"
                  : "Click to activate"}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            disabled={toggleStatusMutation.isPending}
            onClick={() => toggleStatusMutation.mutate()}
            className={`relative w-14 h-8 rounded-full transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${data.isActive ? "bg-primary-500" : "bg-gray-300"}`}
          >
            {toggleStatusMutation.isPending ? (
              <span
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all
                  ${data.isActive ? "right-1" : "left-1"}`}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreTypeDetailsPage;