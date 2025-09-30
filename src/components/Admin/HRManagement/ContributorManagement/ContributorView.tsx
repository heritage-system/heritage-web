import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { getContributorDetail } from "../../../../services/contributorService";
import { ContributorResponse } from "../../../../types/contributor";
import { ContributorStatus } from "../../../../types/enum";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";

interface ContributorViewProps {
  open: boolean;
  onClose: () => void;
  contributor: ContributorResponse | null;
}

const ContributorView: React.FC<ContributorViewProps> = ({
  open,
  onClose,
  contributor,
}) => {
  const [contributorDetail, setContributorDetail] =
    useState<ContributorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContributorDetail = async () => {
      if (open && contributor) {
        setLoading(true);
        try {
          const res = await getContributorDetail(contributor.id);
          if (res.code === 200 && res.result) {
            setContributorDetail(res.result);
          } else {
            toast.error("Không thể tải chi tiết cộng tác viên");
            onClose();
          }
        } catch (error) {
          console.error("Load contributor detail error:", error);
          toast.error("Không thể tải chi tiết cộng tác viên");
          onClose();
        } finally {
          setLoading(false);
        }
      }
    };

    loadContributorDetail();
  }, [open, contributor]);

  // Hiển thị trạng thái
  const getStatusBadge = (status: ContributorStatus | string) => {
    const normalized =
      typeof status === "string" ? status.toUpperCase() : status;

    switch (normalized) {
      case ContributorStatus.APPLIED:
      case "APPLIED":
        return { color: "bg-yellow-100 text-yellow-800", text: "Chờ duyệt" };

      case ContributorStatus.REJECTED:
      case "REJECTED":
        return { color: "bg-red-100 text-red-800", text: "Bị từ chối" };

      case ContributorStatus.ACTIVE:
      case "ACTIVE":
        return { color: "bg-blue-100 text-blue-800", text: "Đang hoạt động" };

      case ContributorStatus.SUSPENDED:
      case "SUSPENDED":
        return { color: "bg-gray-100 text-gray-800", text: "Bị đình chỉ" };

      default:
        return { color: "bg-gray-200 text-gray-600", text: String(status) };
    }
  };

  return (
    <PortalModal
     open={open}
  onClose={onClose}
  size="lg"
  ariaLabel="Chi tiết cộng tác viên"
  centered
  contentClassName="bg-white rounded-2xl p-6 shadow-xl w-[700px] max-w-full"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Chi tiết Cộng Tác Viên
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : contributorDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID
                </label>
                <p className="text-gray-900">{contributorDetail.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{contributorDetail.userEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <p className="text-gray-900">{contributorDetail.userFullName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <div className="mt-1">
                  {(() => {
                    const { color, text } = getStatusBadge(
                      contributorDetail.status
                    );
                    return (
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium ${color}`}
                      >
                        {text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số đóng góp
                </label>
                <p className="text-gray-900">{contributorDetail.count ?? 0}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo
                </label>
                <p className="text-gray-900">
                  {contributorDetail.createdAt
                    ? new Date(contributorDetail.createdAt).toLocaleString(
                        "vi-VN"
                      )
                    : "-"}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiểu sử
              </label>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {contributorDetail.bio || "Chưa có thông tin"}
                </p>
              </div>
            </div>

            {/* Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyên môn
              </label>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-900">
                  {contributorDetail.expertise || "Chưa có thông tin"}
                </p>
              </div>
            </div>

            {/* Documents URL */}
            {contributorDetail.documentsUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài liệu đính kèm
                </label>
                <div className="bg-gray-50 rounded-md p-3">
                  <a
                    href={contributorDetail.documentsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {contributorDetail.documentsUrl}
                  </a>
                </div>
              </div>
            )}
            {/* Premium Eligible */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Quyền đăng bài Premium
  </label>
  <div
    className={`rounded-lg p-3 font-semibold text-sm text-center ${
      contributorDetail.isPremiumEligible
        ? "bg-gradient-to-r from-yellow-100 to-red-100 text-red-700 border border-red-300"
        : "bg-gray-100 text-gray-600 border border-gray-300"
    }`}
  >
    {contributorDetail.isPremiumEligible
      ? "✔ Được phép đăng bài Premium"
      : "✖ Chưa được cấp quyền Premium"}
  </div>
</div>

            {/* Creator and Updater */}
            {(contributorDetail.createdByName ||
              contributorDetail.updatedByName) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Thông tin tạo/cập nhật
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {contributorDetail.createdByName && (
                    <div>
                      <span className="text-gray-500">Tạo bởi: </span>
                      <span className="text-gray-900">
                        {contributorDetail.createdByName}
                      </span>
                      {contributorDetail.createdByEmail && (
                        <span className="text-gray-500">
                          {" "}
                          ({contributorDetail.createdByEmail})
                        </span>
                      )}
                    </div>
                  )}

                  {contributorDetail.updatedByName && (
                    <div>
                      <span className="text-gray-500">Cập nhật bởi: </span>
                      <span className="text-gray-900">
                        {contributorDetail.updatedByName}
                      </span>
                      {contributorDetail.updatedByEmail && (
                        <span className="text-gray-500">
                          {" "}
                          ({contributorDetail.updatedByEmail})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Không thể tải thông tin cộng tác viên
            </p>
          </div>
        )}
      </div>
    </PortalModal>
  );
};

export default ContributorView;
