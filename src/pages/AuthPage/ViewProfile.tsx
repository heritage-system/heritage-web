import React, { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

// Components
import ProfileSidebar from "../../components/ViewProfile/ProfileSidebar";
import ProfileHeader from "../../components/ViewProfile/ProfileHeader";
import ProfileInfoCard from "../../components/ViewProfile/ProfileInfoCards";
import TabContent from "../../components/ViewProfile/TabContent";
import ChangePassword from "../../components/ViewProfile/ChangePassword";
import { toast } from 'react-hot-toast';
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
// Services & Types
import { getProfile, updateProfile, updatePassword } from "../../services/userService";
import { getListContributionOverview } from "../../services/contributionService";
import { UpdateProfileResponse, UpdateProfileRequest } from "../../types/user";
import {
  ContributionOverviewItemListResponse 
} from "../../types/contribution";
// Thêm interface cho Change Password (sync với backend)
interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


interface ContributionForm {
  title: string;
  description: string;
  type: string;
}


const ViewProfile: React.FC = () => {
  // State management
  const [profile, setProfile] = useState<UpdateProfileResponse | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  const [contributionForm, setContributionForm] = useState<ContributionForm>({
    title: "",
    description: "",
    type: "Bài viết",
  });
  const [contributions, setContributions] = useState<ContributionOverviewItemListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [passwordLoading, setPasswordLoading] = useState(false);  
  const [selectedContributionId, setSelectedContributionId] = useState<number | null>(null);


  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        if (res.code === 200 && res.result) {
          setProfile(res.result);
          // Đảm bảo chỉ lấy các field hợp lệ cho formData
          setFormData({
            fullName: res.result.fullName,
            email: res.result.email,
            userName: res.result.userName,
            phone: res.result.phone,
            address: res.result.address,
            dateOfBirth: res.result.dateOfBirth,
            avatarUrl: res.result.avatarUrl,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Không thể tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // // sau khi load profile thành công
  // useEffect(() => {
  //   const loadContributions = async () => {
  //     if (!profile) return;

  //     try {
  //       const res = await getListContributionOverview({     
  //         page: 1,
  //         pageSize: 10,
  //       });

  //       if (res.code === 200 && res.result) {
  //         setContributions(res.result.items); 
  //       }
  //     } catch (err) {
  //       console.error("Error loading contributions:", err);
  //       toast.error("Không thể tải danh sách đóng góp");
  //     }
  //   };

  //   loadContributions();
  // },[profile]);


  // Event handlers
  const handleMenuChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
        userName: profile.userName,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        avatarUrl: profile.avatarUrl,
      });
    }
  };

  const handleSave = async (data?: UpdateProfileRequest) => {
    try {
      const payload = data ?? formData;
      const res = await updateProfile(payload);

      if (res.code === 200 && res.result) {
        setProfile(res.result);
        setFormData({
          fullName: res.result.fullName,
          email: res.result.email,
          userName: res.result.userName,
          phone: res.result.phone,
          address: res.result.address,
          dateOfBirth: res.result.dateOfBirth,
          avatarUrl: res.result.avatarUrl,
        });
        setEditMode(false);
        localStorage.setItem("avatarUrl", res.result.avatarUrl!);
        localStorage.setItem("userName", res.result.userName!);
        toast.success("Cập nhật thông tin thành công", { position: "top-right" });
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleContributionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContributionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContributionSubmit = () => {
    if (!contributionForm.title.trim() || !contributionForm.description.trim()) {
      showNotification("Vui lòng điền đầy đủ tiêu đề và mô tả!", "error");
      return;
    }   
    
    setContributionForm({ title: "", description: "", type: "Bài viết" });
    handleMenuChange("contributions");
    showNotification("Đã gửi đóng góp thành công!", "success");
  };

  const handleContributionCancel = () => {
    setContributionForm({ title: "", description: "", type: "Bài viết" });
    handleMenuChange("contributions");
  };

  // Change Password handlers
  const handleChangePassword = () => {
    handleMenuChange("change-password");
  };

  const handlePasswordCancel = () => {
    handleMenuChange("profile");
  };

  const handlePasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      setPasswordLoading(true);
      const res = await updatePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (res.code === 200) {
        toast.success("Đổi mật khẩu thành công!");
        handleMenuChange("profile");
      } else {
        toast.error(res.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Notification system
  const showNotification = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Spinner size={45} thickness={5}/>
          </div>
          <div className="text-xl font-semibold text-gray-700">Đang tải thông tin...</div>
          <div className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Không thể tải thông tin</div>
          <div className="text-gray-500">Vui lòng thử lại sau</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors duration-200"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl flex overflow-hidden min-h-[900px] border border-white/20">
          {/* Sidebar */}
          <ProfileSidebar
            profile={profile}
            currentTab={currentTab}
            onMenuChange={handleMenuChange}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-8">
              {currentTab === "profile" ? (
                <div className="max-w-6xl mx-auto">
                  {/* Profile Header */}
                  <ProfileHeader
                    profile={profile}
                    formData={formData}
                    setFormData={setFormData}
                    editMode={editMode}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onChangePassword={handleChangePassword} 
                  />
                  {/* Profile Information Cards */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    <ProfileInfoCard
                      profile={profile}
                      formData={formData}
                      setFormData={setFormData}
                      editMode={editMode}
                      type="personal"
                    />
                    <ProfileInfoCard
                      profile={profile}
                      formData={formData}
                      setFormData={setFormData}
                      editMode={editMode}
                      type="contact"
                    />
                  </div>
                </div>
              ) : currentTab === "change-password" ? (
                <ChangePassword
                  onSubmit={handlePasswordSubmit}
                  onCancel={handlePasswordCancel}
                  isLoading={passwordLoading}
                />
              ) : (
                <TabContent
                  currentTab={currentTab}
                  contributionForm={contributionForm}
                  contributions={contributions}
                  selectedContributionId={selectedContributionId ?? 0}
                  onMenuChange={handleMenuChange}
                  onContributionChange={handleContributionChange}
                  onContributionSubmit={handleContributionSubmit}
                  onContributionCancel={handleContributionCancel}
                  onSelectContribution={setSelectedContributionId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
