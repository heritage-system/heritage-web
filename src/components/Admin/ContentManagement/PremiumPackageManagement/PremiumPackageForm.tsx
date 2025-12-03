import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Space,
  Modal,
  Tag,
  message,
} from "antd";
import {PremiumPackageResponse, PremiumPackageCreateRequest, PremiumPackageUpdateRequest,PremiumBenefitCreateRequest} from "@/types/premiumPackage";
import { useEffect, useState } from "react";
import { getPremiumBenefits, createPremiumBenefit,  } from "../../../../services/premiumPackageService";
import { BenefitType, BenefitName } from "../../../../types/enum";
import {Plus } from "lucide-react";


interface PremiumPackageFormProps {
  editingPackage: PremiumPackageResponse | null;
  onSubmit: (
    data: PremiumPackageCreateRequest | PremiumPackageUpdateRequest
  ) => Promise<void>;
  loading: boolean;
  onCancel?: () => void;
}

const PremiumPackageForm = ({
  editingPackage,
  onSubmit,
  loading,
  onCancel,
}: PremiumPackageFormProps) => {
  const [form] = Form.useForm();
  const [benefits, setBenefits] = useState<any[]>([]);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState<number[]>([]);

  const [openCreateBenefit, setOpenCreateBenefit] = useState(false);
  const [creatingBenefit, setCreatingBenefit] = useState(false);
  const [benefitForm] = Form.useForm();

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

  const refreshBenefits = async () => {
    try {
      const res = await getPremiumBenefits();
      if (res.code === 200) {
        // Normalize benefit data to handle both camelCase and PascalCase
        const normalizedBenefits = (res.result || []).map((b: any) => ({
          id: b.id || b.Id,
          benefitName: b.benefitName ?? b.BenefitName ?? b.name,
          BenefitName: b.BenefitName ?? b.benefitName ?? b.name,
          benefitType: b.benefitType ?? b.BenefitType,
          value: b.value ?? b.Value,
        }));
        setBenefits(normalizedBenefits);
      }
    } catch {
      message.error("Không tải được danh sách quyền lợi!");
    }
  };

  useEffect(() => {
    refreshBenefits();
  }, []);

  useEffect(() => {
    if (editingPackage) {
      const ids = editingPackage.benefits?.map(b => b.benefitId) || [];
      setSelectedBenefitIds(ids);

      const isActive = Boolean(editingPackage.isActive);

      form.setFieldsValue({
        Name: editingPackage.name || "",
        Price: editingPackage.price || 0,
        DurationDays: editingPackage.durationDays || 0,
        MarketingMessage: editingPackage.marketingMessage || "",
        IsActive: isActive,
        BenefitIds: ids,
      });
    } else {
      // Reset form when creating new package
      form.resetFields();
      form.setFieldsValue({
        IsActive: true, // Default to active for new packages
      });
      setSelectedBenefitIds([]);
    }
  }, [editingPackage, form]);


  const handleCreateBenefit = async () => {
  try {
    const values = await benefitForm.validateFields();
    setCreatingBenefit(true);

    // Get BenefitName enum value (0, 1, or 2) from form
    const benefitNameValue = values.benefitName;
    
    // Ensure it's a number (the enum value)
    // Backend expects BenefitName enum (0, 1, or 2)
    const benefitNameNum: BenefitName = typeof benefitNameValue === 'number' 
      ? benefitNameValue as BenefitName
      : (parseInt(String(benefitNameValue), 10) as BenefitName);

    console.log("Creating benefit with:", {
      benefitNameValue,
      benefitNameNum,
      BenefitType: values.BenefitType,
      Value: values.Value,
    });

    const payload: PremiumBenefitCreateRequest = {
      BenefitName: benefitNameNum, // Send enum number: 0 (QUIZ), 1 (TOUR), or 2 (CONTRIBUTION)
      BenefitType: values.BenefitType,
      Value: values.BenefitType === BenefitType.LIMITINCREASE ? values.Value : undefined,
    };

    const res = await createPremiumBenefit(payload);

    if (res.code === 200 && res.result) {
      message.success("Thêm quyền lợi thành công!");
      await refreshBenefits();

      // auto chọn quyền lợi mới
      const newId = res.result.id;
      const newSelected = [...selectedBenefitIds, newId];
      setSelectedBenefitIds(newSelected);
      form.setFieldsValue({ BenefitIds: newSelected });

      setOpenCreateBenefit(false);
      benefitForm.resetFields();
    } else {
      message.error(res.message || "Không thể tạo quyền lợi mới");
    }
  } catch (error: any) {
    console.error("Error creating benefit:", error);
    message.error(error?.message || "Có lỗi xảy ra khi tạo quyền lợi");
  }
  finally {
    setCreatingBenefit(false);
  }
};


  const handleSubmit = async (values: any) => {
    // Validate BenefitIds
    const benefitIds = Array.isArray(values.BenefitIds) 
      ? values.BenefitIds.filter((id: any) => id != null && id !== undefined)
      : [];

    if (benefitIds.length === 0) {
      message.error("Vui lòng chọn ít nhất một quyền lợi");
      return;
    }

    const payload = editingPackage
      ? {
          id: editingPackage.id,
          Name: values.Name?.trim() || "",
          Price: Number(values.Price),
          DurationDays: Number(values.DurationDays),
          MarketingMessage: values.MarketingMessage?.trim() || "",
          IsActive: values.IsActive !== undefined ? Boolean(values.IsActive) : false,
          BenefitIds: benefitIds,
        } as PremiumPackageUpdateRequest
      : {
          Name: values.Name?.trim() || "",
          Price: Number(values.Price),
          DurationDays: Number(values.DurationDays),
          MarketingMessage: values.MarketingMessage?.trim() || "",
          BenefitIds: benefitIds,
        } as PremiumPackageCreateRequest;

    await onSubmit(payload);
  };

  return (
    <>
      {/* Modal Thêm Quyền Lợi */}
      <Modal
        title="Thêm Quyền Lợi Mới"
        open={openCreateBenefit}
        onCancel={() => setOpenCreateBenefit(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenCreateBenefit(false)}>Hủy</Button>,
          <Button key="submit" type="primary" loading={creatingBenefit} onClick={handleCreateBenefit}>Thêm</Button>,
        ]}
      >
        <Form form={benefitForm} layout="vertical">
          <Form.Item
            label="Tên quyền lợi"
            name="benefitName"
            rules={[{ required: true, message: "Vui lòng chọn quyền lợi" }]}
          >
            <Select
              options={[
                { label: "Quiz", value: BenefitName.QUIZ },
                { label: "Tour", value: BenefitName.TOUR },
                { label: "Contribution", value: BenefitName.CONTRIBUTION}
              ]}
            />
          </Form.Item>

<Form.Item
    label="Loại quyền lợi"
    name="BenefitType"
    rules={[{ required: true, message: "Vui lòng chọn loại" }]}
  >
    <Select
      options={[
        { label: "Mở khóa tính năng", value: BenefitType.FEATUREUNLOCK },
        { label: "Tăng giới hạn", value: BenefitType.LIMITINCREASE },
      ]}
    />
  </Form.Item>
  <Form.Item
    shouldUpdate={(prev, curr) => prev.BenefitType !== curr.BenefitType} 
  >
    {() => {
      const benefitType = benefitForm.getFieldValue("BenefitType");
      return (
        <Form.Item
          label="Giá trị"
          name="Value"
          rules={
            benefitType === BenefitType.LIMITINCREASE
              ? [{ required: true, message: "Vui lòng nhập giá trị" }]
              : []
          }
        >
          <InputNumber min={0} style={{ width: "100%" }} disabled={benefitType !== BenefitType.LIMITINCREASE} />
        </Form.Item>
      );
    }}
  </Form.Item>

  
</Form>

      </Modal>

      {/* Form chính */}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
  <Form.Item
    label="Tên Gói"
    name="Name"
    rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
  >
    <Input placeholder="Nhập tên gói premium" />
  </Form.Item>

  <Form.Item
    label="Giá"
    name="Price"
    rules={[{ required: true, message: "Vui lòng nhập giá" }]}
  >
    <InputNumber min={0} style={{ width: "100%" }} />
  </Form.Item>

  <Form.Item
    label="Thời hạn (ngày)"
    name="DurationDays"
    rules={[{ required: true, message: "Vui lòng nhập thời hạn" }]}
  >
    <InputNumber min={1} style={{ width: "100%" }} />
  </Form.Item>

  <Form.Item
    label="Thông điệp Marketing"
    name="MarketingMessage"
    rules={[{ required: true, message: "Vui lòng nhập thông điệp" }]}
  >
    <Input.TextArea rows={3} />
  </Form.Item>

  {/* Checkbox trạng thái */}
  <Form.Item
  label="Trạng Thái"
    name="IsActive"
    valuePropName="checked"
  >
    <Checkbox>Hoạt động</Checkbox>
  </Form.Item>

  <Form.Item
  label={
    <div className="flex items-center gap-2">
      <span>Quyền Lợi: </span>
      <Tag color="green">Mở khóa tính năng</Tag>
      <Tag color="blue">Tăng giới hạn</Tag>
    </div>
  }
  name="BenefitIds"
  rules={[{ required: true, message: "Chọn ít nhất một quyền lợi" }]}
>
  <div className="flex gap-2">
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="Chọn quyền lợi"
      value={selectedBenefitIds}
      onChange={(values) => {
        setSelectedBenefitIds(values);
        form.setFieldsValue({ BenefitIds: values });
      }}
      optionLabelProp="label"
      options={benefits.map((b: any) => {
        // Get BenefitName value (handle both camelCase and PascalCase)
        const benefitNameValue = b.BenefitName ?? b.benefitName ?? b.name;
        const benefitNameDisplay = getBenefitNameDisplay(benefitNameValue);
        
        // Get benefit type
        const benefitType = b.benefitType ?? b.BenefitType ?? 0;
        const benefitTypeValue = typeof benefitType === 'number' ? benefitType : BenefitType[benefitType as keyof typeof BenefitType] ?? 0;
        
        return {
          value: b.id,
          label: (
            <div className="flex items-center gap-2">
              <span>{benefitNameDisplay}</span>
              <span>| Value: {b.value !== null && b.value !== undefined ? b.value : "Không giới hạn"}</span>
              <Tag color={benefitTypeValue === 1 ? "blue" : "green"}>
                {benefitTypeValue === 1 ? "Tăng giới hạn" : "Mở khóa tính năng"}
              </Tag>
            </div>
          ),
        };
      })}
      tagRender={({ value, closable, onClose }) => {
        const benefit = benefits.find((b: any) => b.id === value);
        if (!benefit) return <></>;

        // Get BenefitName value (handle both camelCase and PascalCase)
        const benefitNameValue = benefit.BenefitName ?? benefit.benefitName ?? benefit.name;
        const benefitNameDisplay = getBenefitNameDisplay(benefitNameValue);
        
        // Get benefit type
        const benefitType = benefit.benefitType ?? benefit.BenefitType ?? 0;
        const benefitTypeValue = typeof benefitType === 'number' ? benefitType : BenefitType[benefitType as keyof typeof BenefitType] ?? 0;
        const color = benefitTypeValue === 1 ? "blue" : "green";
        
        return (
          <Tag color={color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
            {benefitNameDisplay} : {benefit.value !== null && benefit.value !== undefined ? benefit.value : "Không giới hạn"}
          </Tag>
        );
      }}
    />

    <Button icon={<Plus />} type="primary" onClick={() => setOpenCreateBenefit(true)}>
      Thêm
    </Button>
  </div>
</Form.Item>


  <Form.Item>
    <Space>
      <Button htmlType="submit" type="primary" loading={loading}>
        {editingPackage ? "Cập Nhật" : "Tạo Mới"}
      </Button>
      {onCancel && <Button onClick={onCancel}>Hủy</Button>}
    </Space>
  </Form.Item>
</Form>

    </>
  );
};

export default PremiumPackageForm;
