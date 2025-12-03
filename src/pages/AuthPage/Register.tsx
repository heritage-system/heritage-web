import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { UserCreationRequest } from "../../types/user";
import { registration } from "../../services/userService";
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [form, setForm] = useState<UserCreationRequest>({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });
  const navigate = useNavigate();

  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


  const validateForm = (): boolean => {
    if (form.password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!", {
        duration: 4000,
        position: "top-right",
      });
      return false;
    }
    if (!agree) {
      toast.error("Bạn cần đồng ý với điều khoản!", {
        duration: 4000,
        position: "top-right",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await registration(form);
      if (res.code) {
        toast.success("Đăng ký thành công!");
        setTimeout(() => {
          toast.dismiss(); 
          navigate("/login");
        }, 500);
      } else {
        toast.error(res.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://happywall-img-gallery.imgix.net/117243/vintage-vietnam-ha-long-bay-poster-roll.jpg?auto=format&q=40&w=2304')",
        }}
      />
      <div className="absolute inset-0 bg-white opacity-50 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-lg w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-4 text-4xl font-extrabold text-gray-900 text-center">Đăng ký</h3>

            {/* Username */}
            <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">Tên người dùng</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Full Name */}
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Password */}
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative mb-4">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
            <div className="relative mb-4">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={toggleConfirm}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="flex items-center text-sm text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2"
              />
              Tôi đồng ý với{" "}
              <a
                href="#"
                className="ml-1 text-yellow-700 hover:text-yellow-800 hover:underline"
              >
                điều khoản
              </a>

            </label>

           <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 mb-4 rounded-xl font-semibold transition duration-300
                ${isSubmitting 
                  ? "bg-gray-300 cursor-not-allowed" 
                  : "bg-gradient-to-r from-yellow-800 to-yellow-600 text-white hover:shadow-lg"
                }
              `}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng kí"}
            </button>


            {/* Login */}
            <p className="text-center text-sm text-gray-700">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-yellow-700 font-medium hover:text-yellow-800 hover:underline"
              >
                Đăng nhập
              </Link>

            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
