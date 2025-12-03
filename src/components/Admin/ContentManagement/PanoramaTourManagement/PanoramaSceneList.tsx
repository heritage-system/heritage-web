import React, { useState } from "react";
import {
  PanoramaTourCreationRequest,
  PanoramaSceneCreationRequest,
} from "../../../../types/panoramaTour";
import { toast } from "react-hot-toast";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  mode: "create" | "edit";
  formData: PanoramaTourCreationRequest;
  onCreateScene?: (scene: TempScene) => Promise<number>;
  onUpdateScene?: (id: number, scene: TempScene) => Promise<void>;
  onDeleteScene?: (id: number) => Promise<void>;
  sceneLoading?: boolean;
  setFormData: React.Dispatch<
    React.SetStateAction<PanoramaTourCreationRequest>
    
  >;
  // vẫn giữ tên cũ cho compatible, nhưng giờ là delete scene
  onDeleteQuestion?: (tempId: string, panoramaSceneId?: number) => void;
}

// Scene tạm để edit/add
export interface TempScene extends PanoramaSceneCreationRequest {
  id?: number;   
  thumbnailMode?: "url" | "file";
  localSceneThumbnail?: File | null;
  tempId?: string;
}

const PanoramaSceneList: React.FC<Props> = ({
  mode,
  formData,
  setFormData,
  onUpdateScene,
  onCreateScene,
  onDeleteScene,
  sceneLoading = false,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editingBackup, setEditingBackup] = useState<TempScene | null>(null);
  const scenes = (formData.scenes as TempScene[]) || [];

  const addScene = () => {
    const newScene: TempScene = {
      tempId: crypto.randomUUID(),
      panoramaTourId: undefined,
      sceneName: "",
      sceneThumbnail: "",
      panoramaUrl: "",
      description: "",
      status: 0, // ACTIVE
      premiumType: 0, // FREE
    };

    const updated = [...scenes, newScene];
    setFormData({ ...formData, scenes: updated });
    setOpenIndex(updated.length - 1);
  };

  const updateSceneAt = (index: number, scene: TempScene) => {
    const updated = [...scenes];
    updated[index] = scene;
    setFormData({ ...formData, scenes: updated });
  };

  const handleCancel = (index: number) => {
    if (mode === "create") {
      // Tạo mới → hủy là xóa luôn
      const updated = [...scenes];
      updated.splice(index, 1);
      setFormData({ ...formData, scenes: updated });
    } else {
      // EDIT MODE → restore từ backup
      if (editingBackup) {
        const updated = [...scenes];
        updated[index] = editingBackup;   // restore bản gốc
        setFormData({ ...formData, scenes: updated });
      }
    }
    setEditingBackup(null);
    setOpenIndex(null);
  };


  const handleSaveEditScene = async (index: number, scene: TempScene) => {
    if (!scene.id || !onUpdateScene) return;

    await onUpdateScene(scene.id, scene);

    const updated = [...scenes];
    updated[index] = scene;
    setFormData({ ...formData, scenes: updated });
    toast.success("Cập nhật cảnh thành công!");
    setOpenIndex(null);
  };

  const handleCreateScene = async (scene: TempScene) => {
    if (!onCreateScene) return;
    const result = await onCreateScene(scene);

    scene.id = result
    toast.success("Tạo cảnh mới thành công!");
    setOpenIndex(null);
  };

  const confirmDelete = async () => {
    if (deleteIndex == null) return;

    const s = scenes[deleteIndex];

    if (mode === "edit" && s.id && onDeleteScene) {
      await onDeleteScene(s.id);
    }

    const updated = scenes.filter((_, i) => i !== deleteIndex);
    setFormData({ ...formData, scenes: updated });

    toast.success("Đã xóa cảnh.");
    setDeleteIndex(null);
  };


  const handleDelete = (index: number) => setDeleteIndex(index);

  // const confirmDelete = () => {
  //   if (deleteIndex === null) return;

  //   const s = scenes[deleteIndex];

  //   if (mode === "edit" && onDeleteQuestion && s.tempId) {
  //     // nếu em muốn gửi thông tin lên API phía ngoài
  //     onDeleteQuestion(s.tempId, (s as any).id ?? (s as any).panoramaSceneId);
  //   }

  //   const updated = [...scenes];
  //   updated.splice(deleteIndex, 1);
  //   setFormData({ ...formData, scenes: updated });

  //   setDeleteIndex(null);
  // };

  const toggleOpen = (i: number) => {
    if (openIndex !== i) {
      // Open new scene → backup original state
      setEditingBackup(JSON.parse(JSON.stringify(scenes[i])));
    }
    setOpenIndex(openIndex === i ? null : i);
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Danh sách cảnh 360° ({scenes.length})
        </h2>

        <button
          onClick={addScene}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          + Thêm cảnh 360°
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {scenes.map((s, i) => (
          <div
            key={s.tempId ?? `${s.sceneName}-${i}`}
            className="border rounded-xl overflow-hidden"
          >
            {/* Row header */}
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-all"
              onClick={() => toggleOpen(i)}
            >
              <span className="font-medium">
                Cảnh {i + 1}: {s.sceneName}
              </span>
              <div className="flex gap-2 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(i);
                  }}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  {mode === "edit" &&(<Trash2 size={16} />)}
                </button>
                {openIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Form edit / create */}
            {openIndex === i && (
              <SceneFormUI
                mode={mode}
                scene={s}
                setScene={(newScene) => updateSceneAt(i, newScene)}
                onCancel={() => handleCancel(i)}
                loading={sceneLoading}
                onSave={async () => {
                  if (mode === "edit") {
                    if (s.id) {
                      await handleSaveEditScene(i, s);   // UPDATE API
                    } else {
                      await handleCreateScene(s);        // CREATE API
                    }
                  }
                  setOpenIndex(null);
                }}
                editing={mode === "edit"}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal xóa */}
      <PortalModal
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        centered
        size="sm"
      >
        <div className="p-6 bg-white rounded-lg w-[380px]">
          <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>
          <p className="text-gray-600 mb-6 text-center">
            Bạn có chắc muốn xóa cảnh 360° này? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-300"
              onClick={() => setDeleteIndex(null)}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={confirmDelete}
            >
              Xóa
            </button>
          </div>
        </div>
      </PortalModal>
    </div>
  );
};

export default PanoramaSceneList;

// ================== FORM UI CHO 1 SCENE ==================

const SceneFormUI = ({
  mode,
  scene,
  setScene,
  onCancel,
  onSave,
  editing,
  loading = true,
}: {
  mode: "create" | "edit";
  scene: TempScene;
  setScene: (s: TempScene) => void;
  onCancel: () => void;
  onSave: () => void;
  editing: boolean;
  loading?: boolean;
}) => {
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "file">(
    scene.thumbnailMode || "url"
  );

  const handleThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScene({
      ...scene,
      localSceneThumbnail: file,
      sceneThumbnail: "",
      thumbnailMode: "file",
    });
  };

  const switchToUrl = () => {
    setThumbnailMode("url");
    setScene({
      ...scene,
      localSceneThumbnail: null,
      thumbnailMode: "url",
    });
  };

  const switchToFile = () => {
    setThumbnailMode("file");
    setScene({
      ...scene,
      sceneThumbnail: "",
      thumbnailMode: "file",
    });
  };

  const preview =
    scene.localSceneThumbnail
      ? URL.createObjectURL(scene.localSceneThumbnail)
      : scene.sceneThumbnail;

  return (
    <div className="bg-white border rounded-xl p-6 space-y-5 shadow mt-3">
      <h3 className="text-lg font-bold">
        {editing ? "Sửa cảnh 360°" : "Thêm cảnh 360° mới"}
      </h3>

      {/* Tên cảnh */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Tên cảnh 360°</label>
        <input
          type="text"
          value={scene.sceneName}
          onChange={(e) => setScene({ ...scene, sceneName: e.target.value })}
          className="w-full border p-3 rounded-xl"
          placeholder="VD: Cổng chính đền Hùng, không gian lễ chính..."
        />
      </div>

      {/* THUMBNAIL */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Ảnh bìa</label>

          {thumbnailMode === "url" ? (
            <button
              onClick={switchToFile}
              className="text-blue-600 text-sm hover:underline"
            >
              Chọn ảnh từ máy
            </button>
          ) : (
            <button
              onClick={switchToUrl}
              className="text-blue-600 text-sm hover:underline"
            >
              Dùng URL
            </button>
          )}
        </div>

        {thumbnailMode === "url" && (
          <input
            type="text"
            value={scene.sceneThumbnail}
            onChange={(e) =>
              setScene({ ...scene, sceneThumbnail: e.target.value })
            }
            className="w-full border p-3 rounded-xl"
            placeholder="URL ảnh đại diện của cảnh..."
          />
        )}

        {thumbnailMode === "file" && (
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailFile}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full"
          />
        )}

        {preview && (
          <div className="mt-2 border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
          </div>
        )}
      </div>

      {/* Panorama URL */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Panorama URL</label>
        <input
          type="text"
          value={scene.panoramaUrl}
          onChange={(e) =>
            setScene({ ...scene, panoramaUrl: e.target.value })
          }
          className="w-full border p-3 rounded-xl"
          placeholder="URL viewer (Theasys, Kuula, tự host, ...)"
        />
      </div>
      {/* Panorama View */}
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border shadow">
        <iframe
          src={scene.panoramaUrl}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Mô tả cảnh</label>
        <textarea
          value={scene.description || ""}
          onChange={(e) =>
            setScene({ ...scene, description: e.target.value })
          }
          className="w-full border p-3 rounded-xl min-h-[80px]"
          placeholder="Mô tả ngắn về không gian, ý nghĩa, bối cảnh..."
        />
      </div>

      {/* Status + Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            value={scene.status}
            onChange={(e) =>
              setScene({ ...scene, status: Number(e.target.value) })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value={0}>Hoạt động</option>
            <option value={1}>Ẩn</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Loại truy cập
          </label>
          <select
            value={scene.premiumType}
            onChange={(e) =>
              setScene({ ...scene, premiumType: Number(e.target.value) })
            }
            className="w-full border p-3 rounded-xl"
          >
            <option value={0}>Miễn phí</option>
            <option value={1}>Thành viên</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border rounded-xl hover:bg-gray-50"
        >
          Hủy
        </button>

        {mode === "edit" && (
          <button
            onClick={onSave}
            disabled={loading}
            className={`px-6 py-2 rounded-xl text-white 
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Đang xử lý..." : (editing ? "Cập nhật cảnh" : "Thêm cảnh")}
          </button>
        )}
      </div>
    </div>
  );
};
