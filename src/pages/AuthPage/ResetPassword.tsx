import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // TODO: Xử lý đặt lại mật khẩu ở đây
    alert("Đặt lại mật khẩu thành công!");
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

      {/* Reset Password content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-3 text-4xl font-extrabold text-gray-900 text-center">Đặt lại mật khẩu</h3>
            <p className="mb-6 text-gray-700 text-center">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>

            {/* New Password */}
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={form.password}
              onChange={handleChange}
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Confirm Password */}
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mb-6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Đặt lại mật khẩu
            </button>

            {/* Back to login */}
            <p className="text-center text-sm text-gray-700">
              Đã nhớ mật khẩu?{" "}
              <Link to="/login" className="text-purple-600 font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
