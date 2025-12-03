import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Package, DollarSign, Calendar, MessageSquare, CheckCircle, XCircle, Award, Tag, X } from "lucide-react";
import { PremiumPackageResponse, PremiumPackageUpdateRequest, PremiumPackageCreateRequest, PremiumPackageBenefitResponse } from "../../../../types/premiumPackage";
import { getPremiumPackageById } from "../../../../services/premiumPackageService";
import { message, Spin, Tag as AntTag } from "antd";
import { BenefitType, BenefitName } from "../../../../types/enum";
import PremiumPackageForm from "./PremiumPackageForm";

interface PremiumPackageDetailManagementProps {
  packageId: number;
  onBack: () => void;
  onUpdate?: (data: PremiumPackageUpdateRequest) => Promise<void>;
  refreshTrigger?: number;
}

const PremiumPackageDetailManagement: React.FC<PremiumPackageDetailManagementProps> = ({
  packageId,
  onBack,
  onUpdate,
  refreshTrigger,
}) => {
  const [packageData, setPackageData] = useState<PremiumPackageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  const loadPackageDetail = async () => {
    try {
      setLoading(true);
      const response = await getPremiumPackageById(packageId);

      if (response.code === 200 && response.result) {
        const normalizedData: PremiumPackageResponse = {
          id: response.result.id,
          name: response.result.name,
          price: response.result.price,
          currency: response.result.currency,
          durationDays: response.result.durationDays,
          marketingMessage: response.result.marketingMessage,
          isActive: response.result.isActive ?? false,
          benefits: (response.result.benefits || []).map((benefit: any) => ({
            benefitId: benefit.benefitId ?? benefit.BenefitId,
            BenefitName: benefit.benefitName ?? benefit.BenefitName,
            benefitType: benefit.benefitType ?? benefit.BenefitType,
            value: benefit.value ?? benefit.Value,
          })),
        };

        setPackageData(normalizedData);
      } else {
        message.error(response.message || "Không thể tải thông tin gói premium");
        onBack();
      }
    } catch (error) {
      console.error("Error loading package detail:", error);
      message.error("Có lỗi xảy ra khi tải thông tin gói premium");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  loadPackageDetail();
}, [packageId, onBack, refreshTrigger]);


  const getBenefitTypeLabel = (type: BenefitType | number) => {
    const benefitType = typeof type === 'number' ? type : type;
    switch (benefitType) {
      case BenefitType.FEATUREUNLOCK:
      case 0:
        return "Mở khóa tính năng";
      case BenefitType.LIMITINCREASE:
      case 1:
        return "Tăng giới hạn";
      default:
        return "Không xác định";
    }
  };

  const getBenefitTypeColor = (type: BenefitType | number) => {
    const benefitType = typeof type === 'number' ? type : type;
    switch (benefitType) {
      case BenefitType.FEATUREUNLOCK:
      case 0:
        return "blue";
      case BenefitType.LIMITINCREASE:
      case 1:
        return "green";
      default:
        return "default";
    }
  };

  // Helper function to get BenefitName display text
  const getBenefitNameDisplay = (benefitNameValue: any): string => {
    if (benefitNameValue === undefined || benefitNameValue === null) return "N/A";
    
    // If it's already a string, return it
    if (typeof benefitNameValue === 'string') {
      return benefitNameValue;
    }
    
    // If it's a number, try to get from enum
    if (typeof benefitNameValue === 'number') {
      const enumKey = Object.keys(BenefitName).find(key => BenefitName[key as keyof typeof BenefitName] === benefitNameValue);
      if (enumKey) {
        // Map enum keys to friendly names
        const friendlyNames: Record<string, string> = {
          'QUIZ': 'Quiz',
          'TOUR': 'Tour',
          'CONTRIBUTION': 'Contribution'
        };
        return friendlyNames[enumKey] || enumKey;
      }
    }
    
    return String(benefitNameValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" tip="Đang tải thông tin gói premium..." />
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (data: PremiumPackageUpdateRequest | PremiumPackageCreateRequest): Promise<void> => {
  if (!onUpdate) return;

  if (!("id" in data) || !("IsActive" in data)) {
    message.error("Dữ liệu không hợp lệ cho thao tác cập nhật");
    return;
  }

  const updateData = data as PremiumPackageUpdateRequest;

  setSubmitting(true);
  try {
    await onUpdate(updateData);
    setIsEditing(false);

    // Refresh data after successful update
    const response = await getPremiumPackageById(packageId);
    if (response.code === 200 && response.result) {
      const normalizedData: PremiumPackageResponse = {
        id: response.result.id,
        name: response.result.name,
        price: response.result.price,
        currency: response.result.currency,
        durationDays: response.result.durationDays,
        marketingMessage: response.result.marketingMessage,
        isActive: response.result.isActive ?? false, // camelCase
        benefits: (response.result.benefits || []).map((benefit: any): PremiumPackageBenefitResponse => ({
          benefitId: benefit.benefitId ?? benefit.BenefitId,
          BenefitName: benefit.benefitName ?? benefit.BenefitName,
          benefitType: benefit.benefitType ?? benefit.BenefitType,
          value: benefit.value ?? benefit.Value,
        })),
      };
      setPackageData(normalizedData);
    }
  } catch (error) {
    console.error("Error updating package:", error);
  } finally {
    setSubmitting(false);
  }
};


  if (!packageData) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              disabled={isEditing}
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Chỉnh sửa gói Premium" : packageData.name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditing ? "Cập nhật thông tin gói Premium" : "Chi tiết gói Premium"}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center gap-2"
                disabled={submitting}
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 space-y-8">
            {isEditing ? (
              /* Edit Mode - Show Form */
              <div>
                <PremiumPackageForm
                  editingPackage={packageData}
                  onSubmit={handleSubmit}
                  loading={submitting}
                  onCancel={handleCancel}
                />
              </div>
            ) : (
              /* View Mode - Show Details */
              <>
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Thông tin cơ bản
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tên gói
                  </label>
                  <p className="text-gray-900 font-medium text-base">{packageData.name}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Trạng thái
                  </label>
                  <div>
                    {packageData.isActive ? (
                      <AntTag color="green" className="flex items-center gap-1 w-fit">
                        <CheckCircle size={14} />
                        Hoạt động
                      </AntTag>
                    ) : (
                      <AntTag color="red" className="flex items-center gap-1 w-fit">
                        <XCircle size={14} />
                        Tắt
                      </AntTag>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <DollarSign size={14} />
                    Giá
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {packageData.price.toLocaleString('vi-VN')} {packageData.currency}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Calendar size={14} />
                    Thời hạn
                  </label>
                  <p className="text-gray-900 font-medium text-base">
                    {packageData.durationDays} ngày
                  </p>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MessageSquare size={14} />
                    Thông điệp Marketing
                  </label>
                  <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border text-[15px] whitespace-pre-wrap">
                    {packageData.marketingMessage || "Chưa có thông điệp marketing"}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Quyền lợi ({packageData.benefits?.length || 0})
              </h2>
              
              {!packageData.benefits || packageData.benefits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border">
                  <Award size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 italic text-sm">Chưa có quyền lợi nào</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {packageData.benefits.map((benefit, index) => (
                    <div
                      key={benefit.benefitId || index}
                      className="bg-gray-50 p-5 rounded-lg border hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag size={16} className="text-blue-600" />
                            <h3 className="font-semibold text-gray-900">
                              {getBenefitNameDisplay(benefit.BenefitName)}
                            </h3>
                          </div>
                          <AntTag color={getBenefitTypeColor(benefit.benefitType)} className="mb-2">
                            {getBenefitTypeLabel(benefit.benefitType)}
                          </AntTag>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            ID Quyền lợi
                          </p>
                          <p className="text-gray-900 text-sm font-medium">
                            #{getBenefitNameDisplay(benefit.BenefitName)} 
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Giá trị
                          </p>
                          <p className="text-gray-900 text-sm font-medium">
                            {benefit.value == null ? "Không giới hạn" : benefit.value}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Package ID */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ID Gói:</span>
                <span className="font-mono font-medium text-gray-700">#{packageData.id}</span>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default PremiumPackageDetailManagement;

