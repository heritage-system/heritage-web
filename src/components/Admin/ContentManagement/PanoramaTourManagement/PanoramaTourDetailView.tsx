import React, { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Calendar,
  CheckCircle,
  ListChecks
} from "lucide-react";

import {
  PanoramaTourDetailForAdminResponse,
  PanoramaSceneResponse,
} from "../../../../types/panoramaTour";

interface Props {
  panoramaTour: PanoramaTourDetailForAdminResponse;
  onBack: () => void;
  onEdit: () => void;
}

const PanoramaTourDetailView: React.FC<Props> = ({
  panoramaTour,
  onBack,
  onEdit,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [openSceneIndex, setOpenSceneIndex] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 pb-8 px-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={22} />
        </button>

        {/* Banner */}
        {panoramaTour.thumbnailUrl && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={panoramaTour.thumbnailUrl}
              alt={panoramaTour.name}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Main content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8">
          {/* Title + Edit */}
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">
              {panoramaTour.name}
            </h1>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 
                        rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all 
                        font-medium text-gray-700"
            >
              <Edit size={18} className="text-indigo-600" />
              Chỉnh sửa
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-medium">ID Tour</p>
              <p className="text-lg font-semibold">#{panoramaTour.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Trạng thái</p>
              <span
                className={`inline-block px-4 py-1.5 text-sm font-medium border-2 rounded-full ${
                  panoramaTour.status === 0
                    ? "bg-green-50 text-green-700 border-green-300"
                    : "bg-yellow-50 text-red-700 border-red-300"
                }`}
              >
                {panoramaTour.status === 0 ? "Hoạt động" : "Ẩn"}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Loại truy cập</p>
              <span
                className={`inline-block px-4 py-1.5 text-sm font-medium border-2 rounded-full ${
                  panoramaTour.premiumType === 0
                    ? "bg-green-50 text-green-700 border-green-300"
                    : "bg-yellow-50 text-yellow-700 border-yellow-300"
                }`}
              >
                {panoramaTour.premiumType === 0 ? "Miễn phí" : "Thành viên"}
              </span>
            </div>
          </div>             

          {panoramaTour.description && (
            <p className="text-gray-700 text-base leading-relaxed">
              {panoramaTour.description}
            </p>
          )}
          
          {/* Scenes list */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">
              Danh sách cảnh 360° ({panoramaTour.scenes.length})
            </h2>

            {panoramaTour.scenes.length === 0 ? (
              <p className="text-gray-500">Chưa có cảnh nào.</p>
            ) : (
              <div className="space-y-3">
                {panoramaTour.scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-all"
                      onClick={() =>
                        setOpenSceneIndex(openSceneIndex === index ? null : index)
                      }
                    >
                      <span className="font-medium">
                        Cảnh {index + 1}: {scene.sceneName}
                      </span>
                      {openSceneIndex === index ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    {openSceneIndex === index && (
                      <div className="p-6 bg-gray-50 space-y-4">
                        {/* Thumbnail */}
                        {scene.sceneThumbnail && (
                          <img
                            src={scene.sceneThumbnail}
                            alt={scene.sceneName}
                            className="w-full h-64 object-cover rounded-xl border"
                          />
                        )}

                        <p className="font-semibold text-lg">{scene.sceneName}</p>
                        {/* Status + Premium */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">

                          {/* Status */}
                          <div className="flex flex-col items-center sm:items-start">
                            <span className="text-sm text-gray-600 font-medium">Trạng thái</span>

                            <div
                              className={`inline-flex items-center justify-center mt-2 px-6 py-2 text-sm font-semibold rounded-full border 
                                ${scene.status === 0
                                  ? "bg-green-50 text-green-600 border-green-300"
                                  : "bg-red-50 text-red-600 border-red-300"
                                }`}
                            >
                              {scene.status === 0 ? "Hoạt động" : "Ẩn"}
                            </div>
                          </div>

                          {/* Premium */}
                          <div className="flex flex-col items-center sm:items-start">
                            <span className="text-sm text-gray-600 font-medium">Loại truy cập</span>

                            <div
                              className={`inline-flex items-center justify-center mt-2 px-6 py-2 text-sm font-semibold rounded-full border 
                                ${scene.premiumType === 0
                                  ? "bg-green-50 text-green-600 border-green-300"
                                  : "bg-yellow-50 text-yellow-600 border-yellow-300"
                                }`}
                            >
                              {scene.premiumType === 0 ? "Miễn phí" : "Thành viên"}
                            </div>
                          </div>

                        </div>




                        <p className="text-gray-700">{scene.description}</p>

                        <div className="p-3 rounded-xl bg-white border text-sm">
                          <p className="font-semibold mb-1">Liên kết Panorama:</p>
                          <a
                            href={scene.panoramaUrl}
                            target="_blank"
                            className="text-blue-600 underline break-words"
                          >
                            {scene.panoramaUrl}
                          </a>
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

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar thống kê */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl p-6 z-40 overflow-y-auto transform transition-transform duration-500 ${
          showStats ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Thống kê Tour 360°
        </h3>

        <div className="grid gap-4">
          {/* Created At */}
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 shadow-sm">
    <Calendar className="w-5 h-5 text-blue-600" />
    <div>
      <p className="text-xs text-gray-500">Ngày tạo</p>
      <p className="font-semibold">
        {new Date(panoramaTour.createdAt).toLocaleDateString("vi-VN")}
      </p>

      {panoramaTour.createdBy && (
        <p className="text-xs text-gray-600 mt-1">
          Bởi: Nhân viên <span className="font-medium">{panoramaTour.createdBy}</span>
        </p>
      )}
    </div>
  </div>

  {/* Updated At */}
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 shadow-sm">
    <CheckCircle className="w-5 h-5 text-green-600" />
    <div>
      <p className="text-xs text-gray-500">Ngày cập nhật</p>
      <p className="font-semibold">
        {new Date(panoramaTour.updatedAt).toLocaleDateString("vi-VN")}
      </p>

      {panoramaTour.updatedBy && (
        <p className="text-xs text-gray-600 mt-1">
          Bởi: Nhân viên <span className="font-medium">{panoramaTour.updatedBy}</span>
        </p>
      )}
    </div>
  </div>

          

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 shadow-sm">
            <ListChecks className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Số cảnh 360°</p>
              <p className="font-semibold">{panoramaTour.scenes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle sidebar */}
      <div
        onClick={() => setShowStats(!showStats)}
        className={`fixed z-50 cursor-pointer px-4 py-2 rounded-l-lg shadow-lg 
          bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition
          ${showStats ? "right-96 top-6" : "right-0 top-40"}`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="text-sm font-semibold">Thống kê</span>
        {showStats ? <ChevronRight /> : <ChevronLeft />}
      </div>
    </div>
  );
};

export default PanoramaTourDetailView;