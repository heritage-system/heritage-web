import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // nếu dùng react-router
import AuthCallbackLayout from "../../components/Layouts/AuthCallbackLayout";
import { confirmEmail } from "../../services/authService";

const ConfirmEmailPage: React.FC = () => {
  const navigate = useNavigate(); // hook navigate
  const [message, setMessage] = useState("Đang xác thực email...");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const getQueryParam = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  useEffect(() => {
    const uid = getQueryParam("uid");
    const token = getQueryParam("token");

    if (!uid || !token) {
      setMessage("Link không hợp lệ");
      setStatus("error");
      return;
    }

    const confirm = async () => {
      try {
        const response = await confirmEmail(Number(uid), token);
        if (response && response.code === 200) {
          setMessage("Xác thực email thành công!");
          setStatus("success");
        } else {
          setMessage(response?.message || "Xác thực thất bại");
          setStatus("error");
        }
      } catch (err) {
        setMessage("Không thể kết nối tới server");
        setStatus("error");
      }
    };

    confirm();
  }, []);

  // Redirect khi success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/login"); 
      }, 2000); 

      return () => clearTimeout(timer); // cleanup
    }
  }, [status, navigate]);

  return (
    <AuthCallbackLayout
      title={status === "loading" ? "Đang xác thực..." : status === "success" ? "Thành công!" : "Thất bại"}
      description={message}
    >
      {/* Nếu muốn, vẫn có thể giữ button */}
      {status === "success" && (
        <div className="text-center">
          <a
            href="/login"
            className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white rounded-lg hover:scale-105 transition-transform"
          >
            Về trang đăng nhập
          </a>
        </div>
      )}
    </AuthCallbackLayout>
  );
};

export default ConfirmEmailPage;
