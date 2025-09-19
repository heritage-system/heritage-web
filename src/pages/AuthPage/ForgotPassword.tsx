import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { ForgotPasswordRequest } from "../../types/auth";
import { forgotPassword} from "../../services/authService";
const ForgotPassword: React.FC = () => {
  const [form, setForm] = useState<ForgotPasswordRequest>({ email: ""});
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
      const res = await forgotPassword(form); 

      if (res.code === 200) {
        toast.success("Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn!");
        setTimeout(() => {
          toast.dismiss();        
          navigate("/reset-password", { state: { emailForm: form } });

        }, 1000);
      } else {
        toast.error(res.message || "Gửi email thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
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

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h3 className="mb-3 text-4xl font-extrabold text-gray-900 text-center">
              Quên mật khẩu
            </h3>
            <p className="mb-6 text-gray-700 text-center">
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
            </p>

            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className="mb-6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

           <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Gửi hướng dẫn
            </button>


            <p className="text-center text-sm text-gray-700">
              Đã nhớ mật khẩu?{" "}
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

export default ForgotPassword;
