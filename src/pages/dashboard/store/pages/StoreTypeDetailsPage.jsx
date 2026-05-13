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
  Type,
  Pencil,
  Upload,
  X,
  Check,
} from "lucide-react";
import api from "../../../../services/api";
import toast from "react-hot-toast";
import { useState } from "react";

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
   Info Row (view mode)
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
   Edit Row (edit mode)
══════════════════════════════════════ */
const EditRow = ({ icon: Icon, label, error, children }) => (
  <div className={`px-4 py-3 rounded-2xl border transition-all
    ${error ? "border-red-300 bg-red-50" : "border-primary-200 bg-primary-50/40"}`}>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-gray-500" />
      </div>
      <span className="text-sm font-semibold text-gray-500">{label}</span>
    </div>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

/* ══════════════════════════════════════
   Page
══════════════════════════════════════ */
const StoreTypeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editNameDefault, setEditNameDefault] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIconFile, setEditIconFile] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["store-type", id],
    queryFn: async () => {
      const res = await api.get(`/dashboard/store-types/${id}`);
      return res.data.data;
    },
  });

  const handleStartEdit = () => {
    setEditNameDefault(data?.name || "");
    setEditNameAr(data?.nameAr || "");
    setEditNameEn(data?.nameEn || "");
    setEditCode(data?.code || "");
    setEditSortOrder(data?.sortOrder ?? 1);
    setEditIsActive(data?.isActive ?? true);
    setEditIconFile(null);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(
        `/dashboard/store-types/${id}/active`,
        { isActive: !data?.isActive },
        { headers: { "Content-Type": "application/json" } },
      );
      return res.data.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["store-type", id], newData);
      toast.success(newData?.isActive ? "Store type activated" : "Store type deactivated");
      queryClient.setQueryData(["store-types"], (oldList) =>
        oldList?.map((item) =>
          item.id === id ? { ...item, isActive: newData.isActive } : item,
        ),
      );
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("nameDefault", payload.nameDefault);
      formData.append("nameAr", payload.nameAr);
      formData.append("nameEn", payload.nameEn);
      formData.append("code", payload.code);
      formData.append("sortOrder", String(payload.sortOrder));
      formData.append("isActive", String(payload.isActive));
      if (payload.iconFile) {
        formData.append("icon", payload.iconFile);
      }
      const res = await api.put(`/dashboard/store-types/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["store-type", id], newData);
      queryClient.invalidateQueries({ queryKey: ["store-types"] });
      toast.success("Store type updated");
      setIsEditing(false);
      setErrors({});
    },
    onError: (err) => {
      console.log(err.response?.data);
      toast.error("Something went wrong");
    },
  });

  const handleSave = () => {
    const newErrors = {};
    if (editNameDefault.trim().length === 0) {
      newErrors.nameDefault = "This field is required";
    } else if (editNameDefault.trim().length < 2) {
      newErrors.nameDefault = "Minimum 2 characters";
    }
    if (editCode.trim().length === 0) {
      newErrors.code = "This field is required";
    } else if (editCode.trim().length < 2) {
      newErrors.code = "Minimum 2 characters";
    }
    if (Object.keys(newErrors).length > 0 || errors.iconFile) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }
    updateMutation.mutate({
      nameDefault: editNameDefault,
      nameAr: editNameAr,
      nameEn: editNameEn,
      code: editCode,
      sortOrder: editSortOrder,
      isActive: editIsActive,
      iconFile: editIconFile,
    });
  };

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
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500
          hover:text-primary-500 transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Store Types
      </button>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              {isEditing && editIconFile ? (
                <img
                  src={URL.createObjectURL(editIconFile)}
                  alt="preview"
                  className="w-12 h-12 object-contain rounded-xl"
                />
              ) : data.iconPath ? (
                <img src={data.iconPath} alt={data.name} className="w-12 h-12 object-contain" />
              ) : (
                <Store size={36} className="text-primary-500" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {isEditing ? (editNameDefault || data.name) : data.name}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {isEditing ? (editCode || data.code) : data.code}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold
                  ${(isEditing ? editIsActive : data.isActive)
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full
                  ${(isEditing ? editIsActive : data.isActive) ? "bg-green-500" : "bg-red-400"}`}
                />
                {(isEditing ? editIsActive : data.isActive) ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary-50
                hover:bg-primary-500 hover:text-white text-primary-500
                text-sm font-semibold transition-all"
            >
              <Pencil size={14} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-gray-100
                hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-all"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* ── VIEW MODE ── */}
        {!isEditing && (
          <>
            <InfoRow icon={Code2} label="Code" value={data.code} />
            <InfoRow icon={Type} label="Default Name" value={data.name || "—"} />
            <InfoRow icon={ArrowUpDown} label="Sort Order" value={data.sortOrder} />
            <InfoRow icon={Calendar} label="Created On" value={formatDate(data.createdOn)} />

            <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                  {data.isActive
                    ? <ToggleRight size={15} className="text-green-500" />
                    : <ToggleLeft size={15} className="text-gray-400" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <p className="text-xs text-gray-400">
                    {data.isActive ? "Click to deactivate" : "Click to activate"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={toggleStatusMutation.isPending}
                onClick={() => toggleStatusMutation.mutate()}
                className={`relative w-14 h-8 rounded-full transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${data.isActive ? "bg-primary-500" : "bg-gray-300"}`}
              >
                {toggleStatusMutation.isPending ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </span>
                ) : (
                  <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all
                    ${data.isActive ? "right-1" : "left-1"}`}
                  />
                )}
              </button>
            </div>
          </>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <>
            <EditRow icon={Type} label="Name Default *" error={errors.nameDefault}>
              <input
                type="text"
                value={editNameDefault}
                onChange={(e) => {
                  setEditNameDefault(e.target.value);
                  setErrors((prev) => ({ ...prev, nameDefault: undefined }));
                }}
                placeholder="Restaurant"
                className={`w-full h-10 rounded-xl border px-3 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-primary-400
                  ${errors.nameDefault ? "border-red-300" : "border-gray-200"}`}
              />
            </EditRow>

            <div className="grid grid-cols-2 gap-3">
              <EditRow icon={Type} label="Name Arabic">
                <input
                  type="text"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  placeholder="مطعم"
                  dir="rtl"
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </EditRow>
              <EditRow icon={Type} label="Name English">
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder="Restaurant"
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </EditRow>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <EditRow icon={Code2} label="Code *" error={errors.code}>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => {
                    setEditCode(e.target.value);
                    setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder="restaurant"
                  className={`w-full h-10 rounded-xl border px-3 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary-400
                    ${errors.code ? "border-red-300" : "border-gray-200"}`}
                />
              </EditRow>
              <EditRow icon={ArrowUpDown} label="Sort Order">
                <input
                  type="number"
                  value={editSortOrder}
                  onChange={(e) => setEditSortOrder(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </EditRow>
            </div>

            <EditRow icon={Upload} label="Icon" error={errors.iconFile}>
              <label className={`flex items-center gap-3 w-full rounded-xl border border-dashed
                px-3 py-2.5 cursor-pointer transition bg-white
                ${errors.iconFile ? "border-red-300" : "border-gray-300 hover:border-primary-300"}`}>
                <Upload size={14} className="text-gray-400 shrink-0" />
                <span className="text-sm text-gray-400 truncate">
                  {editIconFile
                    ? editIconFile.name
                    : data.iconPath
                      ? "Replace current icon"
                      : "Upload icon"}
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
                    setEditIconFile(file);
                  }}
                />
              </label>
            </EditRow>

            <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-primary-200 bg-primary-50/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                  {editIsActive
                    ? <ToggleRight size={15} className="text-green-500" />
                    : <ToggleLeft size={15} className="text-gray-400" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-400">Enable this store type</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditIsActive(!editIsActive)}
                className={`relative w-14 h-8 rounded-full transition-all
                  ${editIsActive ? "bg-primary-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all
                  ${editIsActive ? "right-1" : "left-1"}`}
                />
              </button>
            </div>

            {/* Save / Cancel */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleCancelEdit}
                className="flex-1 h-11 rounded-2xl bg-gray-100 text-sm font-semibold
                  text-gray-600 hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <X size={15} />
                Cancel
              </button>
              <button
                disabled={updateMutation.isPending}
                onClick={handleSave}
                className="flex-1 h-11 rounded-2xl bg-primary-500 hover:bg-primary-600
                  text-sm font-semibold text-white shadow-lg shadow-primary-200 transition
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StoreTypeDetailsPage;