'use client'
import React from 'react';

interface AuthErrorProps {
    error: string;
    onRetry?: () => void;
    onGoHome?: () => void;
    errorCode?: string;
}

const AuthError = ({ error, onRetry, onGoHome, errorCode }: AuthErrorProps) => {
    // Phân loại lỗi để hiển thị thông báo phù hợp
    const getErrorInfo = (error: string, code?: string) => {
        if (code === '401' || error.includes('401')) {
            return {
                title: 'Lỗi xác thực',
                message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
                icon: 'auth'
            };
        }

        if (code === '403' || error.includes('403')) {
            return {
                title: 'Không có quyền truy cập',
                message: 'Tài khoản của bạn không có quyền thực hiện thao tác này.',
                icon: 'forbidden'
            };
        }

        if (code === '404' || error.includes('404')) {
            return {
                title: 'Không tìm thấy',
                message: 'Dịch vụ xác thực hiện không khả dụng. Vui lòng thử lại sau.',
                icon: 'notfound'
            };
        }

        if (code === '500' || error.includes('500')) {
            return {
                title: 'Lỗi máy chủ',
                message: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau vài phút.',
                icon: 'server'
            };
        }

        return {
            title: 'Xác thực thất bại',
            message: error,
            icon: 'general'
        };
    };

    const errorInfo = getErrorInfo(error, errorCode);

    const getErrorIcon = (iconType: string) => {
        switch (iconType) {
            case 'auth':
                return (
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            case 'forbidden':
                return (
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                );
            case 'server':
                return (
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                {getErrorIcon(errorInfo.icon)}
            </div>

            {/* Error Message */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{errorInfo.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{errorInfo.message}</p>

                {/* Error Code */}
                {errorCode && (
                    <div className="mt-3 inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono">
                        Mã lỗi: {errorCode}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Thử lại
                    </button>
                )}

                <button
                    onClick={onGoHome}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Về trang chủ
                </button>
            </div>

            {/* Support Info */}
            <div className="text-center text-xs text-gray-500 mt-4 px-4">
                <div className="border-t border-gray-200 pt-4">
                    Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ{' '}
                    <a href="mailto:support@medically.vn" className="text-blue-600 hover:underline font-medium">
                        support@medically.vn
                    </a>
                    <br />
                    <span className="text-gray-400">Hoặc gọi hotline: 1900-xxxx</span>
                </div>
            </div>
        </div>
    );
};

export default AuthError;
