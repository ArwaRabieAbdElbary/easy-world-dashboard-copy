import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, BadgeCheck, BadgeX, Layers3, ArrowUpDown, Trash2 } from "lucide-react";

import api from "../../../../services/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════
   Skeleton Card
══════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5">
    <div className="flex items-center justify-between mb-5">
      <div className="w-12 h-12 rounded-2xl bg-gray-200" />
      <div className="w-16 h-6 rounded-full bg-gray-100" />
    </div>
    <div className="space-y-2">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-3 w-24 rounded bg-gray-100" />
    </div>
    <div className="mt-5 flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-gray-100" />
      <div className="h-8 w-20 rounded-xl bg-gray-200" />
    </div>
  </div>
);

/* ══════════════════════════════════════
   Delete Confirm Dialog
══════════════════════════════════════ */
const DeleteDialog = ({ storeType, onClose, onConfirm, isLoading }) => {
  if (!storeType) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Store Type</h3>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">{storeType.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={() => onConfirm(storeType.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500
                hover:bg-red-600 shadow-sm shadow-red-200 transition
                disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
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
const StoreTypesPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["store-types"],
    queryFn: async () => {
      const response = await api.get("/dashboard/store-types");
      return response?.data?.data || [];
    },
  });

  const [openModal, setOpenModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createStoreTypeMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("nameDefault", data.name);
      formData.append("code", data.code);
      formData.append("sortOrder", data.sortOrder);
      formData.append("isActive", data.isActive);
      if (data.iconFile) formData.append("iconPath", data.iconFile);
      return await api.post("/dashboard/store-types", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-types"] });
      setName(""); setCode(""); setSortOrder(1); setIsActive(true); setIconFile(null);
      toast.success("Store type created");
      setOpenModal(false);
    },
    onError: () => toast.error("Something went wrong"),
  });

  const deleteStoreTypeMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/dashboard/store-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-types"] });
      toast.success("Store type deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete store type"),
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Store Types</h1>
          <p className="text-sm text-gray-400 mt-1">Manage all available store categories</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600
            text-white text-sm font-semibold shadow-lg shadow-primary-200 transition-all"
        >
          + Add Store Type
        </button>
      </div>

      {/* Create Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenModal(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Add Store Type</h2>
            <p className="text-sm text-gray-400 mb-6">Create a new store category</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Restaurant"
                className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
              <input
                type="text" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="restaurant"
                className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
              <input
                type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="1"
                className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
              <input
                type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files[0])}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Active Status</p>
                <p className="text-xs text-gray-400">Enable this store type</p>
              </div>
              <button
                type="button" onClick={() => setIsActive(!isActive)}
                className={`relative w-14 h-8 rounded-full transition-all ${isActive ? "bg-primary-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isActive ? "right-1" : "left-1"}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="flex-1 h-11 rounded-2xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                disabled={createStoreTypeMutation.isPending}
                onClick={() => {
                  if (name.trim().length < 2) { toast.error("Name must be at least 2 characters"); return; }
                  createStoreTypeMutation.mutate({ name, code, sortOrder, isActive, iconFile });
                }}
                className="flex-1 h-11 rounded-2xl bg-primary-500 hover:bg-primary-600
                  text-sm font-semibold text-white shadow-lg shadow-primary-200 transition
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createStoreTypeMutation.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                ) : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          Failed to load store types
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Types</p>
                <h3 className="text-3xl font-black text-gray-900">{data.length}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Layers3 size={26} className="text-primary-500" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active</p>
                <h3 className="text-3xl font-black text-green-600">{data.filter((item) => item.isActive).length}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                <BadgeCheck size={26} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Inactive</p>
                <h3 className="text-3xl font-black text-red-500">{data.filter((item) => !item.isActive).length}</h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <BadgeX size={26} className="text-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : data.map((type) => (
              <div
                key={type.id}
                className="group rounded-3xl border border-gray-100 bg-white p-5
                  shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                    {type.iconPath ? (
                      <img src={type.iconPath} alt={type.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Store size={28} className="text-primary-500" />
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold
                      ${type.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                  >
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Info */}
                <div className="mb-5">
                  <h2 className="text-xl font-black text-gray-900 mb-1">{type.name}</h2>
                  <p className="text-sm text-gray-400">{type.code}</p>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Sort Order</p>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                      <ArrowUpDown size={14} />
                      {type.sortOrder}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(type);
                      }}
                      title="Delete"
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-500 flex items-center justify-center
                        transition-colors group/del"
                    >
                      <Trash2 size={15} className="text-red-500 group-hover/del:text-white transition-colors" />
                    </button>

                    {/* Manage button */}
                    <button
                      onClick={() => navigate(`/dashboard/store-types/${type.id}`)}
                      className="h-9 px-4 rounded-xl bg-gray-100 hover:bg-primary-500
                        hover:text-white text-sm font-semibold text-gray-600 transition-all"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        storeType={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => deleteStoreTypeMutation.mutate(id)}
        isLoading={deleteStoreTypeMutation.isPending}
      />
    </div>
  );
};

export default StoreTypesPage;