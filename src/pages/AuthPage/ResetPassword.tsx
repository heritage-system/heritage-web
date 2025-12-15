import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import { Link, useNavigate,useLocation  } from "react-router-dom"; // Thêm useNavigate
import { Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';
import { forgotPassword} from "../../services/authService";
import { resetPassword} from "../../services/authService";
import { ResetPasswordRequest } from "../../types/auth";
const OTP_LENGTH = 6;
const RESEND_TIME = 60; // thời gian chờ gửi lại OTP (giây)

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate(); 

  const location = useLocation();
  const emailForm = location.state?.emailForm || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResendOTP = async () => {    
    try {

      const res = await forgotPassword(emailForm);

      if (res.code === 200) {
        toast.success("Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn!");
        setTimer(RESEND_TIME);
        setCanResend(false);        
      } else {
        toast.error(res.message || "Gửi email thất bại!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };


  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!", { duration: 4000, position: "top-right" });
      return;
    }

    if (otp.some((digit) => digit === "")) {
      toast.error("Vui lòng nhập đủ mã OTP!", { duration: 4000, position: "top-right" });
      return;
    }

    const payload: ResetPasswordRequest = {
      email: emailForm.email,
      otp: otp.join(""),
      newPassword: newPassword,
    };

    try {
      const res = await resetPassword(payload);

      if (res.code === 200) {
        toast.success("Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          toast.dismiss();
          navigate("/login");
        }, 2000);
      } else {
        toast.error(res.message || "Đặt lại mật khẩu thất bại!");
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
              Đặt lại mật khẩu
            </h3>
            <p className="mb-6 text-gray-700 text-center">
              Nhập mã OTP và mật khẩu mới của bạn
            </p>

            <label
              htmlFor="otp"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Mã OTP
            </label>
            <div className="flex justify-between mb-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-xl rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mx-1"
                  required
                />
              ))}
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500">
                {canResend
                  ? "Bạn chưa nhận được mã?"
                  : `Gửi lại OTP sau ${timer}s`}
              </span>
              <button
                type="button"
                className={`text-yellow-700 font-medium hover:text-yellow-800 hover:underline text-sm ml-2 ${
                  canResend ? "" : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleResendOTP}
                disabled={!canResend}
              >
                Gửi lại OTP
              </button>

            </div>

            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu mới
            </label>
            <div className="relative mb-6">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowNewPassword((prev) => !prev)}
                title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Nhập lại mật khẩu mới
            </label>
            <div className="relative mb-6">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Đặt lại mật khẩu
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

export default ResetPassword;
