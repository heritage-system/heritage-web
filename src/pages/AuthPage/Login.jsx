import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Xử lý đăng nhập ở đây
    alert("Đăng nhập thành công!");
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

      {/* Login content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-3 text-4xl font-extrabold text-gray-900 text-center">Đăng nhập</h3>
            <p className="mb-6 text-gray-700 text-center">Vui lòng nhập email và mật khẩu để tiếp tục</p>

            {/* Email */}
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Password */}
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="mb-2 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            {/* Options */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="mr-2"
                />
                Ghi nhớ tôi
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Đăng nhập
            </button>

            {/* Google Sign-in - optional */}
            <button
              type="button"
              className="w-full py-3 mb-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:shadow-md transition duration-300 flex justify-center items-center space-x-2"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Đăng nhập với Google</span>
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-700">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-purple-600 font-medium hover:underline">
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
