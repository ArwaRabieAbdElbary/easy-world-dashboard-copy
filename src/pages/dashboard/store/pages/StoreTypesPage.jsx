import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, BadgeCheck, BadgeX, Layers3, ArrowUpDown, Trash2, Upload } from "lucide-react";

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

  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [iconFile, setIconFile] = useState(null);
  const [nameDefault, setNameDefault] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createStoreTypeMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("nameDefault", data.nameDefault);
      formData.append("nameAr", data.nameAr);
      formData.append("nameEn", data.nameEn);
      formData.append("code", data.code);
      formData.append("sortOrder", String(data.sortOrder));
      formData.append("isActive", String(data.isActive));
      if (data.iconFile) {
        formData.append("icon", data.iconFile);
      }
      return await api.post("/dashboard/store-types", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-types"] });
      setNameDefault("");
      setNameAr("");
      setNameEn("");
      setCode("");
      setSortOrder(1);
      setIsActive(true);
      setIconFile(null);
      setErrors({});
      toast.success("Store type created");
      setOpenModal(false);
    },
    onError: (error) => {
      console.log(error.response?.data);
      toast.error("Something went wrong");
    },
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

      {/* ══════════════════════════════════════
          Create Modal — compact 2-col layout
      ══════════════════════════════════════ */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setOpenModal(false); setErrors({}); }}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Add Store Type</h2>
            <p className="text-sm text-gray-400 mb-5">Create a new store category</p>

            {/* Name Default — full width */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Name Default *
              </label>
              <input
                required
                type="text"
                value={nameDefault}
                onChange={(e) => {
                  setNameDefault(e.target.value);
                  setErrors((prev) => ({ ...prev, nameDefault: undefined }));
                }}
                placeholder="Restaurant"
                className={`w-full h-11 rounded-2xl border px-4 text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-400
                  ${errors.nameDefault ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.nameDefault && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.nameDefault}</p>
              )}
            </div>

            {/* Arabic + English — side by side */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name Arabic
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مطعم"
                  dir="rtl"
                  className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name English
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Restaurant"
                  className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {/* Code + Sort Order — side by side */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder="restaurant"
                  required
                  className={`w-full h-11 rounded-2xl border px-4 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-400
                    ${errors.code ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                />
                {errors.code && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.code}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  placeholder="1"
                  className="w-full h-11 rounded-2xl border border-gray-200 px-4 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            {/* Icon — styled upload area */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon</label>
              <label className={`flex items-center gap-3 w-full rounded-2xl border border-dashed
                px-4 py-3 cursor-pointer transition
                ${errors.iconFile ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}>
                <Upload size={16} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-400 truncate">
                  {iconFile ? iconFile.name : "Click to upload image"}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const allowed = ["image/jpeg", "image/png", "image/webp"];
                    const ext = file.name.split(".").pop().toLowerCase();
                    const allowedExts = ["jpg", "jpeg", "png", "webp"];
                    if (!allowed.includes(file.type) || !allowedExts.includes(ext)) {
                      setErrors((prev) => ({ ...prev, iconFile: "Only jpg, jpeg, png, and webp images are allowed" }));
                      e.target.value = "";
                      return;
                    }
                    setErrors((prev) => ({ ...prev, iconFile: undefined }));
                    setIconFile(file);
                  }}
                />
              </label>
              {errors.iconFile && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.iconFile}</p>
              )}
            </div>

            {/* Active toggle */}
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Active Status</p>
                <p className="text-xs text-gray-400">Enable this store type</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-14 h-8 rounded-full transition-all ${isActive ? "bg-primary-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${isActive ? "right-1" : "left-1"}`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setOpenModal(false); setErrors({}); }}
                className="flex-1 h-11 rounded-2xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                disabled={createStoreTypeMutation.isPending}
                onClick={() => {
                  const newErrors = {};
                  if (nameDefault.trim().length === 0) {
                    newErrors.nameDefault = "This field is required";
                  } else if (nameDefault.trim().length < 2) {
                    newErrors.nameDefault = "Minimum 2 characters";
                  }
                  if (code.trim().length === 0) {
                    newErrors.code = "This field is required";
                  } else if (code.trim().length < 2) {
                    newErrors.code = "Minimum 2 characters";
                  }
                  if (Object.keys(newErrors).length > 0 || errors.iconFile) {
                    setErrors((prev) => ({ ...prev, ...newErrors }));
                    return;
                  }
                  createStoreTypeMutation.mutate({ nameDefault, nameAr, nameEn, code, sortOrder, isActive, iconFile });
                }}
                className="flex-1 h-11 rounded-2xl bg-primary-500 hover:bg-primary-600
                  text-sm font-semibold text-white shadow-lg shadow-primary-200 transition
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createStoreTypeMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
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