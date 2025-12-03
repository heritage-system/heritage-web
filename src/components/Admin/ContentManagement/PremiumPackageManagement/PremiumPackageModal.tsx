import { Modal } from "antd";
import PremiumPackageForm from "./PremiumPackageForm";
import { PremiumPackageResponse, PremiumPackageCreateRequest, PremiumPackageUpdateRequest } from "@/types/premiumPackage";

interface PremiumPackageModalProps {
  visible: boolean;
  editingPackage: PremiumPackageResponse | null;
  onCreate: (data: PremiumPackageCreateRequest) => Promise<void>;
  onUpdate: (data: PremiumPackageUpdateRequest) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const PremiumPackageModal = ({
  visible,
  editingPackage,
  onCreate,
  onUpdate,
  onClose,
  loading = false,
}: PremiumPackageModalProps) => {
  const handleSubmit = async (data: any) => {
    try {
      if (editingPackage) {
        await onUpdate(data);
      } else {
        await onCreate(data);
      }
    } catch (error) {
      console.error("Error in modal submit:", error);
    }
  };

  return (
    <Modal
      title={editingPackage ? "Chỉnh Sửa Gói Premium" : "Tạo Gói Premium Mới"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: '1200px' }}
      centered
      className="premium-package-modal"
      maskClosable={!loading}
      closable={!loading}
    >
      <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '8px' }}>
        <PremiumPackageForm
          key={editingPackage?.id || 'new'}
          editingPackage={editingPackage}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};

export default PremiumPackageModal;