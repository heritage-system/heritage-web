// pages/ContributionFormPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CoverUploader from "../../components/ContributionForm/CoverUploader";
import RichTextEditor from "../../components/ContributionForm/RichTextEditor";
import ContentPreview from "../../components/ContributionForm/ContentPreview";
import { useContributionForm } from "../../hooks/useContributionForm";
import HeritageMultiSelect from "../../components/ContributionForm/HeritageMultiSelect";
import { ContributionPremiumTypes } from "../../types/enum";
import { CheckCircle } from "lucide-react";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
import { ArrowLeft } from "lucide-react";
interface ContributionFormPageProps {
  contributionId?: number; 
}

const ContributionFormPage: React.FC<ContributionFormPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const contributionId = id ? Number(id) : undefined;
  const {
    // State
    title,
    cover,
    delta,
    saving,
    canSubmit,
    selectedHeritages,
    premiumType,
    submitted,
    isUpdateMode,
    updated,
    allHeritages, 
    isPremiumEligible,
    loading,
    // Handlers
    setSubmitted,
    setTitle,
    setSelectedHeritages,
    setPremiumType,
    handleTempImage,
    handleCoverChange,
    handleContentChange,
    resetForm,
    onSubmit,
  
    onUpdate,
  } = useContributionForm(contributionId);

  
  // Toggle giữa "edit" và "preview"
  const [view, setView] = useState<"edit" | "preview">("edit");

  // ===== Full-screen Upload Overlay with Progress =====
  const [progress, setProgress] = useState(0);

  const simulatedProgress = useMemo(() => progress, [progress]);

  
  useEffect(() => {
    let t: number | undefined;

    if (saving) {
      setProgress(0);
      t = window.setInterval(() => {
        setProgress((p) => {
          const next = p + Math.random() * 8;
          return next < 90 ? next : 90;
        });
      }, 300);
    } else {
      if (progress < 100) setProgress(100);
      const resetTimer = window.setTimeout(() => setProgress(0), 450);
      return () => window.clearTimeout(resetTimer);
    }

    return () => {
      if (t) window.clearInterval(t);
    };
  }, [saving]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center pb-60">
        <div className="text-center">
          <div className="mb-4">
            <Spinner size={40} thickness={5}/>
          </div>
          <div className="text-xl font-semibold text-gray-700">Đang tạo cấu trúc...</div>
          <div className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }
  if (submitted || updated) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 px-4 pt-24">
      <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {submitted ? "Gửi bài thành công!" : "Cập nhật bài viết thành công!"}
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {submitted
          ? "Bài viết của bạn đã được gửi và sẽ được đội ngũ xét duyệt trước khi hiển thị lên website."
          : "Bài viết đã được cập nhật và sẽ hiển thị sau khi xét duyệt."}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => (window.location.href = "/view-profile?tab=contributions")}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-700 to-red-700 text-white font-medium hover:brightness-110 shadow"
        >
          Quay về danh sách
        </button>

        {!isUpdateMode && (
          <button
            onClick={() => {
              resetForm();
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 shadow"
          >
            Đăng bài viết mới
          </button>
        )}
      </div>
    </div>
  );
}
  else  {
  return (
    <div className="max-w-6xl mx-auto pt-6 space-y-6 relative mb-5">
      {/* ===== Full-screen overlay khi đang upload ===== */}
      {saving && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[min(92vw,560px)] rounded-2xl shadow-2xl border border-white/10 bg-white/90">
            <div className="px-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Tiến hành lưu bài viết…
              </h3>          
              <div className="mt-5">
                <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-700 to-red-700 transition-[width] duration-300"
                    style={{ width: `${Math.round(simulatedProgress)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span>Tải lên nội dung & hình ảnh…</span>
                  </div>
                  <span className="tabular-nums">
                    {Math.round(simulatedProgress)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 mt-5 bg-gradient-to-r from-yellow-700 to-red-700 rounded-b-2xl text-white flex items-center justify-between">
              <span className="text-sm/none opacity-90">
                Nội dung của bạn sẽ được duyệt trước khi có thể hiện lên website
              </span>
              <div className="h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-center relative text-center space-y-2">
  {/* Nút quay lại */}
  <button
  onClick={() => window.history.back()}
  className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 
             rounded-lg bg-gradient-to-r from-yellow-700 to-red-700 text-white font-medium 
             shadow-lg hover:brightness-110 transition-all"
  title="Quay lại"
>
  <ArrowLeft className="w-5 h-5" />
  <span>Quay lại</span>
</button>

  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-red-700 bg-clip-text text-transparent">
      Đăng bài cộng tác
    </h1>
    <p className="text-gray-600">
      Chia sẻ kiến thức và trải nghiệm của bạn với cộng đồng
    </p>
  </div>
</div>

      {/* Main Form Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-1 space-y-6">
          {/* Title Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <label className="block text-sm font-semibold mb-3 text-gray-800">Tiêu đề bài viết <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết của bạn..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-700/40 focus:border-yellow-700 transition-colors"
            />
          </div>

          {/* Cover Uploader */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">    
            <label className="block text-sm font-medium mb-2">Ảnh bìa <span className="text-red-500">*</span></label>      
            <CoverUploader value={cover} onChange={handleCoverChange} />
          </div>

          {/* Heritage Multi Select */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">         
            <HeritageMultiSelect selected={selectedHeritages} onChange={setSelectedHeritages} allHeritages={allHeritages} />
          </div>

          {/* Premium Type Toggle */}
         <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold mb-3 text-gray-800">Loại bài viết</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {/* Free luôn cho chọn */}
            <button
              type="button"
              onClick={() => setPremiumType(ContributionPremiumTypes.FREE)}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                premiumType === "FREE"
                  ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-lg transform scale-[1.02]"
                  : "text-gray-700 hover:text-yellow-700 hover:bg-white/50"
              }`}
            >
              🌟 Miễn phí
            </button>

            {/* Premium: disable nếu không đủ quyền */}
            <button
              type="button"
              onClick={() =>
                isPremiumEligible && setPremiumType(ContributionPremiumTypes.SUBSCRIPTIONONLY)
              }
              disabled={!isPremiumEligible}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                premiumType === "SUBSCRIPTIONONLY"
                  ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-lg transform scale-[1.02]"
                  : !isPremiumEligible
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:text-yellow-700 hover:bg-white/50"
              }`}
            >
              ⭐ Premium
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {premiumType === "FREE"
              ? "Bài viết sẽ hiển thị cho tất cả người dùng"
              : isPremiumEligible
              ? "Chỉ người đăng ký mới có thể xem"
              : "Bạn chưa được cấp quyền đăng Premium"}
          </p>
        </div>


          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex flex-col gap-3">
             <button
              disabled={!canSubmit || saving}
              onClick={isUpdateMode ? onUpdate : onSubmit}
              type="button"
              className={`
                w-full py-3 rounded-lg font-medium transition-colors
                ${saving || !canSubmit
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-700 to-red-700 text-white hover:brightness-110"}
              `}
            >
              {saving ? "Đang xử lý..." : isUpdateMode ? "Cập nhật" : "Đăng bài"}
            </button>


              {!isUpdateMode && (<button
                onClick={resetForm}
                className="w-full py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                type="button"
              >
                Dọn dẹp
              </button>)}
            </div>
          </div>
        </div>

        {/* Right Column - Content Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Editor/Preview Toggle với khung xám */}
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-800">Nội dung bài viết</label>

              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-300">
                <button
                  type="button"
                  onClick={() => setView("edit")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === "edit"
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-md transform scale-[1.05]"
                      : "text-gray-700 hover:text-yellow-700 hover:bg-gray-50"
                  }`}
                >
                  Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === "preview"
                      ? "bg-gradient-to-r from-yellow-700 to-red-700 text-white shadow-md transform scale-[1.05]"
                      : "text-gray-700 hover:text-yellow-700 hover:bg-gray-50"
                  }`}
                >
                  Xem trước
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="rounded-lg  overflow-hidden ">
              {view === "edit" ? (
                <div>
                  <RichTextEditor
                    initialDelta={delta}
                    onChange={handleContentChange}
                    onTempImage={handleTempImage}
                  />
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <span>💡</span>
                      Bài viết phải có ít nhất 5000 chữ.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[120vh] overflow-y-auto relative scrollbar-hide">
                  <ContentPreview title={title} cover={cover} delta={delta} heritageTags={selectedHeritages}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }
};

export default ContributionFormPage;