
import { useEffect, useState, useCallback ,useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SignInWithGoogle } from '../../../../services/authService';
import { useAuth } from '../../../../hooks/useAuth';
import AuthCallbackLayout from '../../../../components/Layouts/AuthCallbackLayout';
import AuthLoading from '../../../../components/Auth/AuthLoading';
import AuthError from '../../../../components/Auth/AuthError';

function CallbackGoogle() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string>('');
  const hasAttemptedRef = useRef(false); // dùng ref thay vì state

  const { login: authLogin } = useAuth();

  const handleSendCode = useCallback(async (code: string) => {
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    try {
      const data = await SignInWithGoogle(code);
      if (data.code === 200) {
        localStorage.setItem('accessToken', data.result.accessToken);
        localStorage.setItem('refreshToken', data.result.refreshToken);
        authLogin(data.result);
    
        setTimeout(() => {
          toast.dismiss();
          navigate('/');
        }, 1500);
      } else {
        setError('Không thể xử lý phản hồi từ Google. Vui lòng thử lại sau.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi xác thực Google.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, authLogin]);

  const handleRetry = useCallback(() => {
    if (code) {
      setError(null);
      setErrorCode('');
      setIsLoading(true);
      hasAttemptedRef.current = false;
      toast.loading('Đang thử lại xác thực...', { duration: 2000 });
      handleSendCode(code);
    }
  }, [code, handleSendCode]);

  useEffect(() => {
    if (code) {
      handleSendCode(code);
    } else {
      setError('Không tìm thấy mã xác thực. Vui lòng thử đăng nhập lại.');
      setErrorCode('AUTH_CODE_MISSING');
      setIsLoading(false);
    }
  }, [code, handleSendCode]);
    const handleGoHome = useCallback(() => {
    navigate('/');
    }, [navigate]);

  return (
    <AuthCallbackLayout
      title="Đăng nhập Google"
      description="Đang xử lý thông tin xác thực từ Google"
    >
      {isLoading ? (
        <AuthLoading message="Đang xác thực với Google" provider="google" />
      ) : error ? (
        <AuthError
          error={error}
          errorCode={errorCode}
          onRetry={code ? handleRetry : undefined}
          onGoHome={handleGoHome}
        />
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập thành công!</h3>
          <p className="text-gray-600 text-sm">Đang chuyển hướng về trang chủ...</p>
        </div>
      )}
    </AuthCallbackLayout>
  );
}

export default CallbackGoogle;
