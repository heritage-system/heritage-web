import React, { useState, useEffect } from "react";
import PanoramaSceneList from "./PanoramaSceneList";
import { TempScene } from "../../../../types/panoramaTour";
import {
  PanoramaTourCreationRequest,
  PanoramaTourDetailForAdminResponse,
  PanoramaSceneCreationRequest
} from "../../../../types/panoramaTour";
import { PremiumType } from "../../../../types/enum";
import { ArrowLeft } from "lucide-react";
import { uploadImage } from "../../../../services/uploadService";
import { toast } from "react-hot-toast";
import {
  createPanoramaScene,
  updatePanoramaScene,
  deletePanoramaScene,
} from "../../../../services/panoramaTourService";
import { searchHeritageNames } from "../../../../services/heritageService";
import { heritageNameStorage } from "../../../../utils/tokenStorage";

interface HeritageName {
  id: number;
  name: string;
  nameUnsigned: string;
}

interface Props {
  mode: "create" | "edit";
  panoramaTour: PanoramaTourDetailForAdminResponse | null;
  onSave: (data: PanoramaTourCreationRequest) => void;
  onCancel: () => void;
}

const PanoramaTourFormCreate: React.FC<Props> = ({
  mode,
  panoramaTour,
  onSave,
  onCancel,
}) => {
  const [allHeritages, setAllHeritages] = useState<HeritageName[]>([]);
  const [uploading, setUploading] = useState(false);
  const [localThumbnailFile, setLocalThumbnailFile] = useState<File | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "file">("url");
  const [createScenes, setCreateScenes] = useState<TempScene[]>([]);
  const [sceneLoading, setSceneLoading] = useState(false);

  const [formData, setFormData] = useState<PanoramaTourCreationRequest>({
    heritageId: undefined,
    name: "",
    thumbnailUrl: "",
    premiumType: PremiumType.FREE.toString(),
    description: "",
    status: "ACTIVE",
    scenes: [],
  });

  // ---------------------------------------------------
  // LOAD HERITAGE NAMES (LOCAL STORAGE CACHE + API)
  // ---------------------------------------------------
  useEffect(() => {
    const fetchHeritage = async () => {
      const cached = heritageNameStorage.load();
      if (cached && cached.length > 0) {
        setAllHeritages(cached);
        return;
      }

      const res = await searchHeritageNames();
      const list = res?.result || [];

      setAllHeritages(list);
      heritageNameStorage.save(list);
    };

    fetchHeritage();
  }, []);

  // ---------------------------------------------------
  // LOAD FORM DATA WHEN EDITING
  // ---------------------------------------------------
  useEffect(() => {
    if (mode === "edit" && panoramaTour) {
      console.log(panoramaTour)
      const mappedScenes = panoramaTour.scenes.map((s) => ({
        panoramaTourId: panoramaTour.id,
        sceneName: s.sceneName,
        sceneThumbnail: s.sceneThumbnail,
        panoramaUrl: s.panoramaUrl || "",
        description: s.description,
        status: s.status,
        premiumType: s.premiumType,
        tempId: crypto.randomUUID(),
        id: s.id,
      }));

      setFormData({
        heritageId: panoramaTour.heritageId,
        name: panoramaTour.name,
        thumbnailUrl: panoramaTour.thumbnailUrl ?? "",
        premiumType: panoramaTour.premiumType,
        description: panoramaTour.description,
        status: panoramaTour.status,
        scenes: mappedScenes,
      });
    }
  }, [mode, panoramaTour]);

  const handleChangeThumbnailUrl = (value: string) => {
    setLocalThumbnailFile(null); // xoá file nếu user nhập URL
    setFormData({ ...formData, thumbnailUrl: value });
  };


  // ---------------------------------------------------
  // HANDLE SAVE
  // ---------------------------------------------------
  const isFormValid = () => {
    if (!formData.name.trim()) return false; 
    if (!formData.heritageId) return false;

    // thumbnail
    if (!localThumbnailFile && !formData.thumbnailUrl.trim()) return false;

    // scenes
    if (!formData.scenes || formData.scenes.length === 0) return true;   
    for (const s of formData.scenes as TempScene[]) {
      if (!s.sceneName?.trim()) return false;
      if (!s.panoramaUrl?.trim()) return false;
      // thumbnail của từng scene
      if (!s.sceneThumbnail && !s.localSceneThumbnail) return false;
    }  
    return true;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên tour không được để trống!");
      return;
    }

    try {
      setUploading(true);

      // ======= UPLOAD THUMBNAIL TOUR =======
      let thumbnailUrl = formData.thumbnailUrl;

      if (localThumbnailFile) {
        const uploadRes = await uploadImage(localThumbnailFile);
        if (uploadRes.code !== 200) throw new Error("Upload ảnh đại diện thất bại!");
        thumbnailUrl = uploadRes.result || "";
      }

      // ======= UPLOAD THUMBNAIL CHO TỪNG SCENE =======
      const finalScenes = [];

      for (const s of formData.scenes as TempScene[]) {
        let sceneThumbnail = s.sceneThumbnail;

        if (s.thumbnailMode === "file" && s.localSceneThumbnail) {
          const uploadRes = await uploadImage(s.localSceneThumbnail);
          if (uploadRes.code !== 200) {
            throw new Error(`Upload thumbnail cho cảnh "${s.sceneName}" thất bại!`);
          }
          sceneThumbnail = uploadRes.result || "";
        }

        finalScenes.push({
          ...s,
          sceneThumbnail,
          status: s.status,
          premiumType: s.premiumType,
        });
      }

      // ======= PAYLOAD =======
      const payload: PanoramaTourCreationRequest = {
        ...formData,
        thumbnailUrl,
        premiumType: formData.premiumType,
        status: formData.status,
        scenes: finalScenes,
      };
      onSave(payload);
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra!");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSceneAPI = async (scene: TempScene): Promise<number> => {
    setSceneLoading(true); // bắt đầu loading

    try {
      // STEP 1: Upload local file nếu có
      let uploadedThumbnail = scene.sceneThumbnail;

      if (scene.thumbnailMode === "file" && scene.localSceneThumbnail) {
        const uploadRes = await uploadImage(scene.localSceneThumbnail);

        if (uploadRes.code !== 200 || !uploadRes.result) {
          throw new Error("Upload thumbnail cảnh thất bại!");
        }

        uploadedThumbnail = uploadRes.result;
      }

      // STEP 2: Gửi API
      const payload: PanoramaSceneCreationRequest = {
        panoramaTourId: panoramaTour!.id,
        sceneName: scene.sceneName,
        sceneThumbnail: uploadedThumbnail,
        panoramaUrl: scene.panoramaUrl,
        description: scene.description,
        status: scene.status,
        premiumType: scene.premiumType,
      };

      const res = await createPanoramaScene(payload);

      if (res.code !== 201 || !res.result) {
        throw new Error("Tạo cảnh thất bại!");
      }

      return res.result; 
    } finally {
      setSceneLoading(false); // luôn reset
    }
  };


  const handleUpdateSceneAPI = async (id: number, scene: TempScene) => {
    setSceneLoading(true); // bắt đầu loading

    try {
      let uploadedThumbnail = scene.sceneThumbnail;

      if (scene.thumbnailMode === "file" && scene.localSceneThumbnail) {
        const uploadRes = await uploadImage(scene.localSceneThumbnail);

        if (uploadRes.code !== 200 || !uploadRes.result) {
          throw new Error("Upload thumbnail cảnh thất bại!");
        }

        uploadedThumbnail = uploadRes.result;
      }

      const payload: PanoramaSceneCreationRequest = {
        panoramaTourId: panoramaTour!.id,
        sceneName: scene.sceneName,
        sceneThumbnail: uploadedThumbnail,
        panoramaUrl: scene.panoramaUrl,
        description: scene.description,
        status: scene.status,
        premiumType: scene.premiumType,
      };

      const res = await updatePanoramaScene(id, payload);
      if (res.code !== 200) throw new Error("Cập nhật cảnh thất bại!");

    } finally {
      setSceneLoading(false); // luôn reset
    }
  };



  const handleDeleteSceneAPI = async (id: number) => {
    const res = await deletePanoramaScene(id);
    if (res.code !== 200) throw new Error("Xóa cảnh thất bại!");
  };




  // ---------------------------------------------------
  // UPLOAD IMAGE WHEN USER SELECTS LOCAL FILE
  // ---------------------------------------------------
  const handleUploadLocalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalThumbnailFile(file);

    // reset thumbnailUrl để tránh xung đột
    setFormData({ ...formData, thumbnailUrl: "" });

    toast.success("Ảnh đã được chọn! Sẽ upload khi lưu tour.");
  };

  const switchToUrl = () => {
    setLocalThumbnailFile(null);
    setThumbnailMode("url");
  };

  const switchToFile = () => {
    setFormData({ ...formData, thumbnailUrl: "" });
    setThumbnailMode("file");
  };


  const previewImage = localThumbnailFile
    ? URL.createObjectURL(localThumbnailFile)
    : formData.thumbnailUrl || "";


  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === "create" ? "Tạo Tour 360°" : "Chỉnh sửa Tour 360°"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Điền thông tin Tour 360° & Cảnh
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={uploading || !isFormValid()}
              className={`px-5 py-2.5 rounded-xl font-medium text-white transition 
                ${isFormValid() && !uploading 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-gray-300 cursor-not-allowed opacity-70"}
              `}
            >
              {uploading ? "Đang tải ảnh..." : "Lưu Tour"}
            </button>

          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-10">

          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Tên tour
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="Nhập tên tour..."
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mô tả Tour
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl min-h-[100px]"
              placeholder="Mô tả tổng quan về tour..."
            />
          </div>

          {/* THUMBNAIL */}
<div className="space-y-3">
  <div className="flex justify-between items-center">
    <label className="block text-sm font-medium text-gray-700">
      Ảnh đại diện
    </label>

    {thumbnailMode === "url" ? (
      <button
        type="button"
        onClick={switchToFile}
        className="text-blue-600 text-sm hover:underline"
      >
        Dùng ảnh từ máy
      </button>
    ) : (
      <button
        type="button"
        onClick={switchToUrl}
        className="text-blue-600 text-sm hover:underline"
      >
        Dùng URL ảnh
      </button>
    )}
  </div>

  {/* MODE = URL */}
  {thumbnailMode === "url" && (
    <input
      type="text"
      value={formData.thumbnailUrl}
      onChange={(e) => handleChangeThumbnailUrl(e.target.value)}
      className="w-full px-4 py-3 border rounded-xl"
      placeholder="Dán URL ảnh..."
    />
  )}

  {/* MODE = FILE */}
  {thumbnailMode === "file" && (
    <input
      type="file"
      accept="image/*"
      onChange={handleUploadLocalImage}
      className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full"
    />
  )}

  {/* PREVIEW */}
  {(localThumbnailFile || formData.thumbnailUrl) && (
    <div className="mt-2 border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
      <img
        src={
          localThumbnailFile
            ? URL.createObjectURL(localThumbnailFile)
            : formData.thumbnailUrl
        }
        alt="Preview"
        className="w-full h-60 object-cover"
      />
    </div>
  )}
</div>

          
           {/* HERITAGE SELECT */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Thuộc Di Sản
            </label>
            <select
              value={formData.heritageId || ""}
              onChange={(e) =>
                setFormData({ ...formData, heritageId: Number(e.target.value) })
              }
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="">-- Chọn di sản --</option>
              {allHeritages.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* PREMIUM + STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Loại truy cập
              </label>
              <select
                value={formData.premiumType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    premiumType: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value={"FREE"}>Miễn phí</option>
                <option value={"SUBSCRIPTIONONLY"}>Thành viên</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value={"ACTIVE"}>Hoạt động</option>
                <option value={"INACTIVE"}>Ẩn</option>
              </select>
            </div>
          </div>

          {/* SCENE LIST */}
          <div className="pt-8 border-t">
            <PanoramaSceneList
              mode={mode}
              formData={formData}
              setFormData={setFormData}
              onCreateScene={mode === "edit" ? handleCreateSceneAPI : undefined}
              onUpdateScene={mode === "edit" ? handleUpdateSceneAPI : undefined}
              onDeleteScene={mode === "edit" ? handleDeleteSceneAPI : undefined}
              sceneLoading={sceneLoading}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PanoramaTourFormCreate;
