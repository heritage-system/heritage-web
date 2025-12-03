import { Row, Col, Button, Typography } from "antd";
import toast from "react-hot-toast";
import { 
  CalendarOutlined, 
  InfoOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumPackageResponse } from "../../types/premiumPackage";
import { getAllActivePackage } from "../../services/premiumPackageService";
import { createSubscription, getActiveSubscription } from "../../services/subscriptionService";
import Spinner from "../Layouts/LoadingLayouts/Spinner";
import PortalModal from "../Layouts/ModalLayouts/PortalModal";
import {BenefitName } from "../../types/enum";

const { Title, Text } = Typography;

const THEME = {
  primary: "#8E1C24",  
  secondary: "#B8860B", 
  bg: "#F9F5F0",       
  cardBg: "#FFFFFF",
  textHeader: "#2C3E50",
  textLabel: "#666666",
  textValue: "#333333",
};

const UpgradePackagePage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PremiumPackageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PremiumPackageResponse | null>(null);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllActivePackage();
      if (res.code === 200 && res.result) {
        const sortedPackages = res.result.sort((a, b) => a.price - b.price);
        setPackages(sortedPackages);
      } else {
        toast.error(res.message || "Không lấy được dữ liệu gói Premium", {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Có lỗi xảy ra khi tải danh sách gói Premium";
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
          fontSize: "14px",
          borderRadius: "8px",
          maxWidth: "400px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleUpgrade = (pkg: PremiumPackageResponse) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  const confirmSubscription = async () => {
    if (!selectedPackage) return;

    setProcessingPackageId(selectedPackage.id);
    setIsModalOpen(false);

    try {
      // Kiểm tra user đã có subscription đang active chưa
      console.log('🔍 Checking active subscription...');
      const activeSubResponse = await getActiveSubscription();
      
      if (activeSubResponse.code === 200 && activeSubResponse.result) {
        const activeSub = activeSubResponse.result;
        const isActive = activeSub.status === 'ACTIVE' || activeSub.status === '0';
        
        if (isActive) {
          toast.error("Bạn đang có gói đăng ký đang hoạt động. Vui lòng hủy gói hiện tại trước khi đăng ký gói mới.", {
            duration: 6000,
            position: "top-right",
            style: {
              background: "#EF4444",
              color: "#fff",
              fontWeight: "500",
              fontSize: "14px",
              borderRadius: "8px",
              maxWidth: "400px",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          });
          setProcessingPackageId(null);
          return;
        }
      }

      console.log('🔄 Creating subscription for package:', selectedPackage.id);
      const response = await createSubscription({ packageId: selectedPackage.id });
      console.log('📦 Create subscription response:', response);

      if (response.code === 200 && response.result) {
        const { orderCode, checkoutUrl } = response.result;

        localStorage.setItem("pendingOrderCode", orderCode.toString());
        localStorage.setItem("pendingPackageName", selectedPackage.name);

        toast.success("Đang chuyển đến trang thanh toán...", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        });

        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 500);
      } else {
        // Parse error message từ backend để hiển thị rõ ràng hơn
        let errorMessage = response.message || "Không thể tạo thanh toán. Vui lòng thử lại sau.";
        
        // Map các error message phổ biến sang tiếng Việt
        if (errorMessage.includes("An error occurred while saving the entity changes")) {
          errorMessage = "Có lỗi xảy ra khi lưu dữ liệu. Có thể bạn đã có gói đăng ký đang hoạt động hoặc gói này không còn khả dụng.";
        } else if (errorMessage.includes("Bạn đang có gói đăng ký đang hoạt động")) {
          errorMessage = "Bạn đang có gói đăng ký đang hoạt động. Vui lòng hủy gói hiện tại trước khi đăng ký gói mới.";
        } else if (errorMessage.includes("Gói Premium không tồn tại")) {
          errorMessage = "Gói Premium không tồn tại hoặc đã bị xóa.";
        } else if (errorMessage.includes("Gói Premium không còn hoạt động")) {
          errorMessage = "Gói Premium này không còn hoạt động. Vui lòng chọn gói khác.";
        } else if (errorMessage.includes("Thời hạn gói Premium không hợp lệ")) {
          errorMessage = "Thời hạn gói Premium không hợp lệ.";
        }
        
        console.error('❌ Create subscription error:', {
          code: response.code,
          message: response.message,
          packageId: selectedPackage.id,
          parsedMessage: errorMessage,
        });
        
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      }
    } catch (error: any) {
      console.error('❌ Create subscription exception:', error);
      
      // Enhanced error handling với toast
      if (error?.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để tiếp tục", {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      } else if (error?.response?.status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này", {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      } else if (error?.response?.status >= 500) {
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.", {
          duration: 6000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      } else {
        // Parse error message từ exception
        let errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại sau.";
        
        // Map các error message phổ biến
        if (errorMessage.includes("An error occurred while saving the entity changes")) {
          errorMessage = "Có lỗi xảy ra khi lưu dữ liệu. Có thể bạn đã có gói đăng ký đang hoạt động hoặc có vấn đề với dữ liệu.";
        } else if (errorMessage.includes("Bạn đang có gói đăng ký đang hoạt động")) {
          errorMessage = "Bạn đang có gói đăng ký đang hoạt động. Vui lòng hủy gói hiện tại trước khi đăng ký gói mới.";
        } else if (errorMessage.includes("Gói Premium không tồn tại")) {
          errorMessage = "Gói Premium không tồn tại hoặc đã bị xóa.";
        } else if (errorMessage.includes("Gói Premium không còn hoạt động")) {
          errorMessage = "Gói Premium này không còn hoạt động. Vui lòng chọn gói khác.";
        }
        
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            fontWeight: "500",
            fontSize: "14px",
            borderRadius: "8px",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        });
      }
    } finally {
      setProcessingPackageId(null);
      setSelectedPackage(null);
    }
  };

  // --- RENDER: Phần hiển thị thời hạn (Duration) ---
  const renderDuration = (days: number | null) => {
    const isInfinite = !days || days === 0;

    let displayText = "";
    if (isInfinite) {
      displayText = "Sử dụng vĩnh viễn";
    } else {
      if (days % 30 === 0) {
        const months = days / 30;
        displayText = `Thời hạn: ${months} tháng`;
      } else {
        displayText = `Thời hạn: ${days} ngày`;
      }
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF8E1",
          color: THEME.secondary,
          padding: "8px 16px",
          borderRadius: "50px",
          marginTop: "12px",
          fontWeight: 600,
          fontSize: "14px",
          border: `1px solid ${THEME.secondary}40`,
        }}
      >
        {isInfinite ? (
          <InfoOutlined style={{ marginRight: 8 }} />
        ) : (
          <CalendarOutlined style={{ marginRight: 8 }} />
        )}
        <span>{displayText}</span>
      </div>
    );
  };

  // --- RENDER: Phần danh sách quyền lợi (2 Cột) ---
// Helper function to get BenefitName display text in Vietnamese
const getBenefitNameDisplay = (benefitNameValue: any): string => {
  if (benefitNameValue === undefined || benefitNameValue === null) return "N/A";
  
  // Mapping BenefitName enum to Vietnamese
  const benefitNameMap: Record<string, string> = {
    'QUIZ': 'Câu hỏi',
    'TOUR': 'Tour',
    'CONTRIBUTION': 'Đóng góp',
    '0': 'Câu hỏi',
    '1': 'Tour',
    '2': 'Đóng góp'
  };
  
  // If it's already a string, try to map it
  if (typeof benefitNameValue === 'string') {
    return benefitNameMap[benefitNameValue] || benefitNameValue;
  }
  
  // If it's a number, map from enum value
  if (typeof benefitNameValue === 'number') {
    // Map enum numeric values
    if (benefitNameValue === BenefitName.QUIZ) return 'Trò chơi';
    if (benefitNameValue === BenefitName.TOUR) return 'Trải nghiệm 360°';
    if (benefitNameValue === BenefitName.CONTRIBUTION) return 'Bài viết đóng góp';
    
    // Try to get enum key name
    const enumKeys = Object.keys(BenefitName).filter(k => isNaN(Number(k))) as Array<keyof typeof BenefitName>;
    const foundKey = enumKeys.find(key => BenefitName[key] === benefitNameValue);
    if (foundKey) {
      return benefitNameMap[foundKey] || foundKey;
    }
    
    return String(benefitNameValue);
  }
  
  return String(benefitNameValue);
};

const renderBenefitsList = (benefits: any[]) => {

  if (!benefits || benefits.length === 0) 
    return (
      <div style={{
        textAlign: 'center', 
        fontStyle: 'italic', 
        color: '#ccc', 
        margin: '20px 0'
      }}>
        Chưa có thông tin quyền lợi
      </div>
    );

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ 
        fontSize: '12px', 
        textTransform: 'uppercase', 
        color: '#999', 
        marginBottom: 10, 
        letterSpacing: '1px',
        fontWeight: 600
      }}>
        Chi tiết quyền lợi
      </div>

      {benefits.map((b) => {
        const isUnlimited = b.value === null || b.value === undefined;
        // Get BenefitName value (handle both camelCase and PascalCase)
        const benefitNameValue = b.benefitName ?? b.BenefitName ?? b.name;
        const benefitNameDisplay = getBenefitNameDisplay(benefitNameValue);

        return (
          <div
            key={b.benefitId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end", 
              marginBottom: 12,
              fontSize: "14px",
            }}
          >
            {/* Cột Tên */}
            <span style={{ color: THEME.textLabel, flexShrink: 0, fontWeight: 700 }}>
              {benefitNameDisplay}
            </span>

            {/* Đường kẻ chấm bi nối 2 bên */}
            <div style={{
              flex: 1,
              borderBottom: '1px dotted #ccc',
              margin: '0 8px 4px 8px', 
            }}></div>

            {/* Cột Giá trị */}
            <span style={{ 
              color: isUnlimited ? THEME.primary : THEME.textValue, 
              fontWeight: isUnlimited ? 700 : 500,
              textAlign: 'right',
              flexShrink: 0
            }}>
              {isUnlimited ? "Không giới hạn" : `${b.value} lượt`}

            </span>
          </div>
        );
      })}
    </div>
  );
};


  return (
    <div 
      className="bg-dragon"
      style={{
        padding: "60px 24px",
        backgroundColor: THEME.bg,
        minHeight: "100vh",
        fontFamily: "'Merriweather', 'Times New Roman', serif",
        position: "relative",
      }}
    >
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Spinner size={48} thickness={4} />
          <Text
            style={{
              marginTop: 16,
              fontSize: "16px",
              color: THEME.textHeader,
              fontWeight: 500,
            }}
          >
            Đang tải dữ liệu...
          </Text>
        </div>
      )}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <Title level={2} style={{ marginBottom: 10, textTransform: "uppercase" }}>
          Cổng Thông Tin{" "}
          <span
            style={{
              background: "linear-gradient(to right, #ca8a04, #b91c1c, #92400e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Di Sản
          </span>
        </Title>


          <Text style={{ fontSize: "16px", color: "#666" }}>
            Chọn gói thành viên để mở khóa kho tàng kiến thức văn hóa Việt Nam
          </Text>
          
        </div>

        <Row gutter={[24, 24]} justify="center">
          {packages.map((pkg, index) => {
            const isHighlight = index === Math.floor(packages.length / 2) && packages.length > 1;
            const isProcessing = processingPackageId === pkg.id;

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={pkg.id}>
                <div
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{
                    transition: "all 0.3s ease",
                    transformOrigin: "center top",
                    borderRadius: "10px",
                    height: "100%",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isHighlight && (
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: THEME.primary,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      zIndex: 1,
                      boxShadow: '0 2px 8px rgba(142, 28, 36, 0.3)'
                    }}>
                      Phổ biến nhất
                    </div>
                  )}
                  
                  <div
                    style={{
                      backgroundColor: THEME.cardBg,
                      borderRadius: "8px",
                      padding: "24px",
                      height: "100%",
                      minHeight: 520,        
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: isHighlight ? `2px solid ${THEME.secondary}` : "1px solid #e0e0e0",
                      boxShadow: isHighlight
                        ? "0 10px 30px rgba(184, 134, 11, 0.2)"
                        : "0 2px 8px rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Header */}
                    <div style={{ textAlign: "center" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: isHighlight ? THEME.primary : THEME.textHeader,
                          margin: 0,
                          textTransform: "uppercase",
                        }}
                      >
                        {pkg.name}
                      </h3>

                      <div style={{ marginTop: 16, marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "36px",
                            fontWeight: 800,
                            color: THEME.textHeader,
                          }}
                        >
                          {pkg.price.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#888",
                            verticalAlign: "top",
                            marginLeft: 4,
                          }}
                        >
                          {pkg.currency || "VND"}
                        </span>
                      </div>

                      {renderDuration(pkg.durationDays)}

                      <div
                        style={{
                          marginTop: 16,
                          fontSize: "13px",
                          color: "#555",
                          fontStyle: "italic",
                          borderTop: "1px solid #f0f0f0",
                          paddingTop: 12,
                        }}
                      >
                        "{pkg.marketingMessage || "Trải nghiệm văn hóa trọn vẹn"}"
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, padding: "10px 0" }}>
                      {renderBenefitsList(pkg.benefits || [])}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 24 }}>
                      <Button
                        type="primary"
                        block
                        size="large"
                        loading={isProcessing}
                        disabled={!pkg.isActive || isProcessing}
                        onClick={() => handleUpgrade(pkg)}
                        style={{
                          backgroundColor: isHighlight ? THEME.primary : "#fff",
                          color: isHighlight ? "#fff" : THEME.primary,
                          borderColor: THEME.primary,
                          height: "45px",
                          fontWeight: 600,
                          boxShadow: isHighlight
                            ? "0 4px 12px rgba(142, 28, 36, 0.3)"
                            : "none",
                        }}
                      >
                        {isProcessing 
                          ? "Đang xử lý..." 
                          : pkg.isActive 
                            ? "Đăng Ký Ngay" 
                            : "Tạm Ngưng"
                        }
                      </Button>

                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Thông tin hỗ trợ */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 60,
          padding: '24px',
          
          borderRadius: '8px',
          maxWidth: '800px',
          margin: '60px auto 0'
        }}>
          <Title level={4} style={{ color: THEME.textHeader, marginBottom: 16 }}>
            Cần hỗ trợ?
          </Title>
          <Text style={{ color: THEME.textLabel }}>
            Nếu bạn gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ với chúng tôi qua email: 
            <a href="mailto:vtfp.portal@gmail.com" style={{ color: THEME.primary, marginLeft: 8 }}>
              vtfp.portal@gmail.com
            </a>
          </Text>
        </div>

      <PortalModal
        open={isModalOpen}
        onClose={handleCloseModal}
        size="md"
        centered={true}
        closeOnOverlay={true}
        contentClassName="bg-white rounded-2xl shadow-2xl" // rounded-2xl
        ariaLabel="Xác nhận đăng ký"
      >
        {selectedPackage && (
          <div style={{ padding: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
               <div style={{ 
                  width: 64, 
                  height: 64, 
                  background: `${THEME.primary}10`, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  overflow: 'hidden' 
                }}>
                  <img 
                    src="/VTFP_Logo.png" 
                    alt="VTFP Logo" 
                    style={{ width: 100, height: 100, objectFit: 'contain' }} 
                  />
                </div>

              <Title level={3} style={{ color: THEME.textHeader, marginBottom: 8 }}>Xác nhận đăng ký</Title>
              <Text style={{ color: THEME.textLabel }}>Vui lòng kiểm tra lại thông tin gói dịch vụ</Text>
            </div>

            {/* Ticket Style Info */}
            <div style={{
              backgroundColor: "#FAFAFA",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: 32,
              border: "1px dashed #d9d9d9",
              position: "relative"
            }}>
               {/* Decorative circles to look like a ticket */}
               <div style={{ position: 'absolute', left: -10, top: '50%', width: 20, height: 20, background: 'white', borderRadius: '50%', borderRight: '1px solid #eee' }}></div>
               <div style={{ position: 'absolute', right: -10, top: '50%', width: 20, height: 20, background: 'white', borderRadius: '50%', borderLeft: '1px solid #eee' }}></div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: THEME.textLabel }}>Gói dịch vụ</Text>
                <Text strong style={{ color: THEME.textHeader, fontSize: "16px" }}>{selectedPackage.name}</Text>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: THEME.textLabel }}>Thời hạn</Text>
              <Text strong>
                {selectedPackage.durationDays
                  ? selectedPackage.durationDays % 30 === 0
                    ? `${selectedPackage.durationDays / 30} tháng`
                    : `${selectedPackage.durationDays} ngày`
                  : 'Không giới hạn'}
              </Text>
            </div>

              <div style={{ height: 1, background: "#eee", margin: "16px 0" }}></div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={{ color: THEME.textLabel }}>Tổng thanh toán</Text>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                  <Text style={{ color: THEME.primary, fontSize: 24, fontWeight: 700 }}>
                    {selectedPackage.price.toLocaleString()}
                  </Text>
                  <Text style={{ color: THEME.primary, fontSize: 12, lineHeight: "24px", alignSelf: "flex-start" }}>
                    VND
                  </Text>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <Button
                size="large"
                shape="round"
                onClick={handleCloseModal}
                style={{ flex: 1, height: 48, borderColor: '#d9d9d9' }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<CheckCircleOutlined />}
                onClick={confirmSubscription}
                loading={processingPackageId === selectedPackage.id}
                style={{ 
                  flex: 1, 
                  height: 48, 
                  backgroundColor: THEME.primary, 
                  borderColor: THEME.primary,
                  boxShadow: "0 4px 12px rgba(142, 28, 36, 0.3)"
                }}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        )}
      </PortalModal>
    </div>
  );
};

export default UpgradePackagePage;