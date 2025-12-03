'use client'
import React from 'react';
import VTFPLogo from "../../assets/logo/VTFP_Logo.png";
interface AuthCallbackLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const AuthCallbackLayout = ({
    children,
    title = "Đang xác thực...",
    description = "Vui lòng đợi trong giây lát"
}: AuthCallbackLayoutProps) => {
    return (
        <div className="min-h-screen bg-dragon flex  justify-center">
            <div className="max-w-md w-full mx-4">
                {/* Logo/Brand Section */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-60 h-60 bg-gray rounded-full overflow-hidden">
                    <img
                        src={VTFPLogo}
                        alt="VTFP Logo"
                        className="w-full h-full"
                    />
                </div>

                    {/* <h1 className="text-2xl font-bold text-gray-900 mb-2">VTFP</h1>
                    <p className="text-gray-600">Ký ức sống động từ quá khứ đến hiện tại</p> */}
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
                        <p className="text-gray-600 text-sm">{description}</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center text-xs text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Kết nối được bảo mật SSL
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-xs text-gray-500">
                    © 2025. Tất cả quyền được bảo lưu.
                </div>
            </div>
        </div>
    );
};

export default AuthCallbackLayout;
