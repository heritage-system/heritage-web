import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser} from "../../services/authService"; 
import { getRedirectPath } from "../../utils/Authorities";
import toast, { Toaster } from 'react-hot-toast';
import { SignInRequest } from "../../types/auth";
import { useAuth } from '../../hooks/useAuth';
import { GoogleConfiguration } from '../../configuration/GoogleConfiguration';
import { Eye, EyeOff } from "lucide-react"; 

const Login: React.FC = () => {
  const [form, setForm] = useState<SignInRequest>({ emailOrUsername: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const request: SignInRequest = {
        emailOrUsername: form.emailOrUsername,
        password: form.password,
        remember: form.remember,
      };

      const response = await loginUser(request);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      toast.success('Đăng nhập thành công! Chào mừng bạn trở lại!', {
        duration: 1000,
        position: 'top-right',
        style: { background: '#059669', color: '#fff' },
        iconTheme: { primary: '#fff', secondary: '#059669' },
      });
      authLogin(response);
      const redirectPath = getRedirectPath(response.userType);
      setTimeout(() => navigate(redirectPath), 500);
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!', {
        duration: 5000,
        position: 'top-right',
        style: { background: '#DC2626', color: '#fff' },
        iconTheme: { primary: '#fff', secondary: '#DC2626' },
      });
    }
  };
  const handleGoogleLogin = () => {
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GoogleConfiguration.client_id}&redirect_uri=${GoogleConfiguration.redirect_uri}&response_type=${GoogleConfiguration.response_type}&scope=${GoogleConfiguration.scope}&prompt=consent`;
        window.location.href = url;
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

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-3 text-4xl font-extrabold text-gray-900 text-center">Đăng nhập</h3>
            <p className="mb-6 text-gray-700 text-center">Vui lòng nhập email và mật khẩu để tiếp tục</p>

            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="emailOrUsername"
              type="email"
              placeholder="example@email.com"
              value={form.emailOrUsername}
              onChange={handleChange}
              className="mb-4 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative mb-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

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

            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Đăng nhập
            </button>

            <button
              type="button"
              className="w-full py-3 mb-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:shadow-md transition duration-300 flex justify-center items-center space-x-2"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Đăng nhập với Google</span>
            </button>

            <p className="text-center text-sm text-gray-700">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-purple-600 font-medium hover:underline">
                Đăng ký
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default Login;
