import React from "react";
import { useNavigate } from "react-router-dom";
import AuthCallbackLayout from "../../components/Layouts/AuthCallbackLayout";
import { ShieldAlert, Home, LogIn } from "lucide-react";

const Forbidden403 = () => {
  const navigate = useNavigate();

  return (
    <AuthCallbackLayout
      title="403 – Truy cập bị từ chối"
      description="Bạn không có quyền truy cập vào trang này"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Icon cảnh báo */}
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        <p className="text-sm text-gray-600 text-center leading-relaxed">
          Tài khoản của bạn không đủ quyền để
          truy cập nội dung này.
        </p>

       <div className="w-full">
        <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                    bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
            <Home size={18} />
            Quay về trang chủ
        </button>
        </div>

            </div>
            </AuthCallbackLayout>
        );
        };

export default Forbidden403;
