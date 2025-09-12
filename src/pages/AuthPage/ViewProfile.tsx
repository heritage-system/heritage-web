import React, { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import FavoriteHeritageList from "../../components/Auth/FavoriteHeritageList";

import { getProfile, updateProfile } from "../../services/userService";
import { UpdateProfileResponse, UpdateProfileRequest } from "../../types/user";

interface HeritageItem {
  name: string;
  type: string;
  rating?: number;
}

interface EventItem {
  name: string;
  date: string;
}

interface QuizItem {
  title: string;
  score: number;
  total: number;
  date: string;
}

interface ContributionItem {
  title: string;
  status: string;
}

interface ContributionForm {
  title: string;
  description: string;
  type: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: string;
}

const mockHeritage: HeritageItem[] = [
  { name: "Vịnh Hạ Long", type: "Yêu thích", rating: 5 },
  { name: "Phố cổ Hội An", type: "Đánh giá", rating: 4 },
];

const mockEvents: EventItem[] = [
  { name: "Lễ hội Áo dài", date: "20/03/2025" },
  { name: "Ngày Di sản Việt Nam", date: "23/11/2024" },
];

const mockQuiz: QuizItem[] = [
  { title: "Quiz Văn hóa miền Bắc", score: 8, total: 10, date: "01/06/2025" },
  { title: "Quiz Ẩm thực Việt", score: 7, total: 10, date: "15/05/2025" },
];

const mockContributions: ContributionItem[] = [
  { title: "Bài viết về Chùa Một Cột", status: "Đã duyệt" },
  { title: "Ảnh Lễ hội Đền Hùng", status: "Chờ duyệt" },
];

const MENU: MenuItem[] = [
  { key: "profile", label: "Thông tin cá nhân", icon: "👤" },
  { key: "favorites", label: "Di sản yêu thích", icon: "❤️" },
  { key: "heritage", label: "Di sản đã tương tác", icon: "🏛️" },
  { key: "events", label: "Sự kiện đã tham gia", icon: "🎉" },
  { key: "quiz", label: "Lịch sử quiz", icon: "📝" },
  { key: "contributions", label: "Đóng góp đã gửi", icon: "📤" },
];

const ViewProfile: React.FC = () => {
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
  const [contributions, setContributions] =
    useState<ContributionItem[]>(mockContributions);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await getProfile();
      if (res.code === 200 && res.result) {
        setProfile(res.result);
        setFormData(res.result);
      }
    };
    loadProfile();
  }, []);

  const handleMenuChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleSave = async () => {
    try {
      const res = await updateProfile(formData);
      if (res.code === 200 && res.result) {
        setProfile(res.result);
        setFormData(res.result);
        setEditMode(false);
        alert("Cập nhật thông tin thành công!");
      } else {
        alert(res.message || "Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  if (!profile) {
    return <div className="text-center py-20">Đang tải...</div>;
  }

  const handleContributionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContributionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContributionSubmit = () => {
    if (!contributionForm.title || !contributionForm.description) {
      alert("Vui lòng điền đầy đủ tiêu đề và mô tả!");
      return;
    }
    setContributions([
      ...contributions,
      { title: contributionForm.title, status: "Chờ duyệt" },
    ]);
    setContributionForm({ title: "", description: "", type: "Bài viết" });
    handleMenuChange("contributions");
  };

  const handleContributionCancel = () => {
    setContributionForm({ title: "", description: "", type: "Bài viết" });
    handleMenuChange("contributions");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-20 px-6">
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-7xl w-full overflow-hidden min-h-[800px]">
        {/* Sidebar */}
        <div className="w-60 bg-gradient-to-b from-purple-100 to-pink-100 py-8 px-4 flex flex-col gap-2">
          <div className="flex flex-col items-center mb-8">
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-purple-200 shadow mb-2"
            />
            <div className="font-bold text-gray-800">{profile.fullName}</div>
            <div className="text-xs text-gray-500">{profile.email}</div>
          </div>
          {MENU.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuChange(item.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition text-left ${
                currentTab === item.key
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow"
                  : "text-gray-700 hover:bg-purple-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {currentTab === "profile" && (
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
                    />
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{profile.fullName}</h1>
                      <p className="text-purple-100">{profile.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          Thành viên
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          Đã xác thực
                        </span>
                      </div>
                    </div>
                  </div>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <span>✏️</span>
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setFormData(profile);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
                      >
                        <span>❌</span>
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl transition-all duration-200"
                      >
                        <span>💾</span>
                        Lưu
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600">👤</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Username */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Tên đăng nhập
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            value={formData.userName || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, userName: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Nhập tên đăng nhập"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                            {profile.userName}
                          </div>
                        )}
                      </div>

                      {/* Full Name */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Họ và tên
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            value={formData.fullName || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, fullName: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Nhập họ và tên"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                            {profile.fullName}
                          </div>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Ngày sinh
                        </label>
                        {editMode ? (
                          <input
                            type="date"
                            value={formData.dateOfBirth?.split("T")[0] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                            {profile.dateOfBirth
                              ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">📞</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Thông tin liên hệ</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Email */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Nhập email"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                            {profile.email}
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Số điện thoại
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            value={formData.phone || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Nhập số điện thoại"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                            {profile.phone || "Chưa cập nhật"}
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Địa chỉ
                        </label>
                        {editMode ? (
                          <textarea
                            value={formData.address || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, address: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Nhập địa chỉ"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium min-h-[80px] flex items-center">
                            {profile.address || "Chưa cập nhật"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-blue-100">Di sản yêu thích</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-green-100">Sự kiện tham gia</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-orange-100">Quiz hoàn thành</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-purple-100">Đóng góp</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tabs remain unchanged */}
          {currentTab === "favorites" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-purple-700">
                  Di sản yêu thích
                </h2>
              </div>
              <FavoriteHeritageList />
            </div>
          )}
          {currentTab === "heritage" && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-700 mb-4">
                Di sản đã tương tác
              </h2>
              <ul>
                {mockHeritage.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.type} {item.rating && `- ${item.rating}★`}
                    </span>
                  </li>
                ))}
                {mockHeritage.length === 0 && (
                  <div className="text-gray-400 text-center">
                    Chưa có dữ liệu
                  </div>
                )}
              </ul>
            </div>
          )}
          {currentTab === "events" && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-700 mb-4">
                Sự kiện đã tham gia
              </h2>
              <ul>
                {mockEvents.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </li>
                ))}
                {mockEvents.length === 0 && (
                  <div className="text-gray-400 text-center">
                    Chưa có dữ liệu
                  </div>
                )}
              </ul>
            </div>
          )}
          {currentTab === "quiz" && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-700 mb-4">
                Lịch sử quiz
              </h2>
              <ul>
                {mockQuiz.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0"
                  >
                    <span>{item.title}</span>
                    <span className="text-xs text-gray-500">
                      {item.score}/{item.total} điểm ({item.date})
                    </span>
                  </li>
                ))}
                {mockQuiz.length === 0 && (
                  <div className="text-gray-400 text-center">
                    Chưa có dữ liệu
                  </div>
                )}
              </ul>
            </div>
          )}
          {currentTab === "contributions" && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-purple-700">
                  Đóng góp đã gửi
                </h2>
                <button
                  onClick={() => handleMenuChange("add-contribution")}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Thêm đóng góp
                </button>
              </div>
              <ul>
                {contributions.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-purple-100 last:border-b-0"
                  >
                    <span>{item.title}</span>
                    <span
                      className={`text-xs font-semibold ${
                        item.status === "Đã duyệt"
                          ? "text-green-600"
                          : item.status === "Chờ duyệt"
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </li>
                ))}
                {contributions.length === 0 && (
                  <div className="text-gray-400 text-center">
                    Chưa có dữ liệu
                  </div>
                )}
              </ul>
            </div>
          )}
          {currentTab === "add-contribution" && (
            <div className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-700 mb-4">
                Thêm đóng góp di sản
              </h2>
              <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
                <div>
                  <span className="block text-xs text-gray-500">Tiêu đề</span>
                  <input
                    type="text"
                    name="title"
                    value={contributionForm.title}
                    onChange={handleContributionChange}
                    className="w-full px-3 py-1 border rounded-xl"
                    placeholder="Nhập tiêu đề đóng góp"
                  />
                </div>
                <div>
                  <span className="block text-xs text-gray-500">
                    Loại đóng góp
                  </span>
                  <select
                    name="type"
                    value={contributionForm.type}
                    onChange={handleContributionChange}
                    className="w-full px-3 py-1 border rounded-xl"
                  >
                    <option>Bài viết</option>
                    <option>Hình ảnh</option>
                    <option>Video</option>
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Mô tả</span>
                  <textarea
                    name="description"
                    value={contributionForm.description}
                    onChange={handleContributionChange}
                    className="w-full px-3 py-2 border rounded-xl h-40 resize-none"
                    placeholder="Mô tả chi tiết về đóng góp của bạn"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleContributionCancel}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleContributionSubmit}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700"
                  >
                    Gửi đóng góp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;