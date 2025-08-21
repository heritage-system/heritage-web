import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Xử lý gửi email đặt lại mật khẩu ở đây
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn!",
      confirmButtonText: "OK",
      timer: 2000,
      timerProgressBar: true,
      position: "top-end",
    }).then(() => {
      navigate("/reset-password");
    });
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
              value={email}
              onChange={handleChange}
              className="mb-6 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Gửi hướng dẫn
            </button>

            <p className="text-center text-sm text-gray-700">
              Đã nhớ mật khẩu?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-medium hover:underline"
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
