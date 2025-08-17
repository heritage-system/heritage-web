import React, { useState } from "react";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      alert("Mật khẩu mới xác nhận không khớp!");
      return;
    }
    // TODO: Xử lý đổi mật khẩu ở đây
    alert("Đổi mật khẩu thành công!");
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://happywall-img-gallery.imgix.net/117243/vintage-vietnam-ha-long-bay-poster-roll.jpg?auto=format&q=40&w=2304')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-white opacity-50 z-0" />

      {/* Change Password content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-3 text-4xl font-extrabold text-gray-900 text-center">Đổi mật khẩu</h3>
            <p className="mb-6 text-gray-700 text-center">
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
            </p>

            {/* Current Password */}
            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={form.currentPassword}
              onChange={handleChange}
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* New Password */}
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={form.newPassword}
              onChange={handleChange}
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Confirm New Password */}
            <label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmNewPassword}
              onChange={handleChange}
              className="mb-6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ChangePassword;