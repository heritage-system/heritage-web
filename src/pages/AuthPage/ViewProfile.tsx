import React, { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";

interface User {
  avatar: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joined: string;
  gender: string;
  birthdate: string;
  job: string;
  hobbies: string;
  bio: string;
}

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

const mockUser: User = {
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "Nguyễn Văn A",
  email: "nguyenvana@email.com",
  phone: "0123 456 789",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  joined: "01/07/2024",
  gender: "Nam",
  birthdate: "1995-05-15",
  job: "Kỹ sư phần mềm",
  hobbies: "Đọc sách, đi du lịch, chụp ảnh",
  bio: "Yêu thích khám phá di sản Việt Nam, đam mê công nghệ và du lịch.",
};

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
  { key: "heritage", label: "Di sản đã tương tác", icon: "🏛️" },
  { key: "events", label: "Sự kiện đã tham gia", icon: "🎉" },
  { key: "quiz", label: "Lịch sử quiz", icon: "📝" },
  { key: "contributions", label: "Đóng góp đã gửi", icon: "📤" },
];

const ViewProfile: React.FC = () => {
  const user = mockUser;
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<User>({ ...user });
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  const [menu, setMenu] = useState<string>(currentTab);
  const [contributionForm, setContributionForm] = useState<ContributionForm>({
    title: "",
    description: "",
    type: "Bài viết",
  });
  const [contributions, setContributions] = useState<ContributionItem[]>(mockContributions);

  useEffect(() => {
    setMenu(currentTab);
  }, [currentTab]);

  const handleMenuChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleContributionChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
              src={user.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-purple-200 shadow mb-2"
            />
            <div className="font-bold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          {MENU.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuChange(item.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition text-left ${
                menu === item.key
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
          {/* User Info Header */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-2">
              <div>
                <span className="block text-xs text-gray-500">SĐT</span>
                <span className="bg-gray-100 rounded-xl px-3 py-1 text-gray-700">
                  {user.phone}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Địa chỉ</span>
                <span className="bg-gray-100 rounded-xl px-3 py-1 text-gray-700">
                  {user.address}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Thành viên từ</span>
                <span className="bg-gray-100 rounded-xl px-3 py-1 text-gray-700">
                  {user.joined}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 italic">{user.bio}</div>
          </div>
          {/* Content Sections */}
          <div className="bg-purple-50 rounded-2xl p-4 min-h-[120px]">
            {menu === "profile" && (
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-purple-700">Thông tin cá nhân</h2>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setFormData({ ...user });
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => {
                          Object.assign(user, formData);
                          setEditMode(false);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700"
                      >
                        Lưu
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <span className="block text-xs text-gray-500">Họ và tên</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.name}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Email</span>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.email}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">SĐT</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.phone}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Địa chỉ</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.address}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Giới tính</span>
                    {editMode ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      >
                        <option>Nam</option>
                        <option>Nữ</option>
                        <option>Khác</option>
                      </select>
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.gender}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Ngày sinh</span>
                    {editMode ? (
                      <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">
                        {new Date(user.birthdate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Nghề nghiệp</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.job}</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Sở thích</span>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.hobbies}
                        onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                        className="w-full px-3 py-1 border rounded-xl"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-1">{user.hobbies}</span>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-gray-500">Giới thiệu</span>
                    {editMode ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl h-60 resize-none"
                      />
                    ) : (
                      <span className="block bg-white rounded-xl px-3 py-2">{user.bio}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {menu === "heritage" && (
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
                  <div className="text-gray-400 text-center">Chưa có dữ liệu</div>
                )}
              </ul>
            )}
            {menu === "events" && (
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
                  <div className="text-gray-400 text-center">Chưa có dữ liệu</div>
                )}
              </ul>
            )}
            {menu === "quiz" && (
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
                  <div className="text-gray-400 text-center">Chưa có dữ liệu</div>
                )}
              </ul>
            )}
            {menu === "contributions" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-purple-700">Đóng góp đã gửi</h2>
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
                    <div className="text-gray-400 text-center">Chưa có dữ liệu</div>
                  )}
                </ul>
              </div>
            )}
            {menu === "add-contribution" && (
              <div className="bg-purple-50 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-purple-700 mb-4">Thêm đóng góp di sản</h2>
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
                    <span className="block text-xs text-gray-500">Loại đóng góp</span>
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
    </div>
  );
};

export default ViewProfile;