'use client'
import React from 'react';

interface AuthLoadingProps {
    message?: string;
    provider?: 'facebook' | 'google' | 'general';
}

const AuthLoading = ({
    message = "Đang xác thực...",
    provider = 'general'
}: AuthLoadingProps) => {
    const getProviderIcon = () => {
        switch (provider) {
            case 'facebook':
                return (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>
                );
            case 'google':
                return (
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Animated Icon Container */}
            <div className="relative">
                {/* Spinning Border */}
                <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

                {/* Provider Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {getProviderIcon()}
                </div>
            </div>

            {/* Loading Message */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-xs">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Xác thực</span>
                    <span>Đăng nhập</span>
                    <span>Chuyển hướng</span>
                </div>
                <div className="flex space-x-2">
                    <div className="flex-1 h-1 bg-blue-600 rounded-full"></div>
                    <div className="flex-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthLoading;
