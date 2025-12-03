import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin, Card, Typography, Divider, message } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  HomeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {checkPaymentStatus } from '../../services/subscriptionService';


const { Title, Text, Paragraph } = Typography;

const THEME = {
  primary: "#8E1C24",
  secondary: "#B8860B",
  bg: "#F9F5F0",
};

type PaymentStatusType = 'loading' | 'success' | 'failed' | 'processing' | 'error';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatusType>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkPaymentResult = useCallback(async () => {
    try {
      console.log('🔍 Checking payment result...');
      console.log('URL Params:', {
        code: searchParams.get('code'),
        status: searchParams.get('status'),
        orderCode: searchParams.get('orderCode'),
        cancel: searchParams.get('cancel'),
        id: searchParams.get('id')
      });

      // Lấy orderCode từ URL hoặc localStorage
      const orderCodeFromUrl = searchParams.get('orderCode');
      const orderCodeFromStorage = localStorage.getItem('pendingOrderCode');
      const orderCode = orderCodeFromUrl || orderCodeFromStorage;

      console.log('📦 OrderCode:', { fromUrl: orderCodeFromUrl, fromStorage: orderCodeFromStorage });

      if (!orderCode) {
        console.error('❌ No orderCode found');
        setStatus('error');
        return;
      }

      // Lưu orderCode để có thể retry sau
      setOrderCode(Number(orderCode));

      // Lấy status từ URL (PayOS return url có thêm params)
      const urlStatus = searchParams.get('status');
      const urlCode = searchParams.get('code');
      const urlCancel = searchParams.get('cancel');

      console.log('🔍 Payment indicators:', { urlStatus, urlCode, urlCancel });

      // Nếu URL cho biết thanh toán thất bại ngay (hủy từ PayOS)
      if (urlStatus === 'CANCELLED' || urlCode === '97' || urlCancel === 'true') {
        console.log('❌ Payment cancelled from PayOS');
        setStatus('failed');
        localStorage.removeItem('pendingOrderCode');
        localStorage.removeItem('pendingPackageName');
        return;
      }

      // ⚠️ QUAN TRỌNG: Frontend KHÔNG gọi webhook endpoint!
      // Webhook được PayOS gọi trực tiếp đến backend.
      // Frontend chỉ cần polling để check status từ database (đã được webhook update).
      
      // Luôn gọi API để lấy trạng thái payment từ backend
      // Backend trả về status là string: "PAID", "PENDING", "FAILED", "CANCELLED"
      // Status này đã được webhook từ PayOS update trong database
      const response = await checkPaymentStatus(Number(orderCode));


      console.log('📦 Payment status from API:', response);

      if (response.code === 200 && response.result) {
        const paymentStatus = response.result.status?.toUpperCase(); // "PAID", "PENDING", "FAILED", "CANCELLED"

        if (paymentStatus === 'PAID') {
          // Thanh toán thành công
          console.log('✅ Payment confirmed as PAID');
          setStatus('success');
          setPaymentData(response.result);
          localStorage.removeItem('pendingOrderCode');
          localStorage.removeItem('pendingPackageName');
        } else if (paymentStatus === 'PENDING') {
          // Đang chờ webhook từ PayOS xử lý - thử polling vài lần
          // Webhook được PayOS gọi đến backend, frontend chỉ cần đợi và check lại
          console.log('⏳ Payment is PENDING, polling to wait for webhook processing...');
          
          let pollCount = 0;
          const maxPolls = 10; // Tăng lên 10 lần để đợi webhook lâu hơn
          const pollInterval = 3000; // Tăng lên 3 giây để giảm tải server

          const pollPaymentStatus = async (): Promise<void> => {
            if (pollCount >= maxPolls) {
              console.warn('⚠️ Max polls reached, status still PENDING');
              setStatus('processing');
              return;
            }

            pollCount++;
            console.log(`🔄 Polling attempt ${pollCount}/${maxPolls}...`);

            try {
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              const pollResponse = await checkPaymentStatus(Number(orderCode));

              if (pollResponse.code === 200 && pollResponse.result) {
                const currentStatus = pollResponse.result.status?.toUpperCase();
                
                if (currentStatus === 'PAID') {
                  console.log('✅ Payment confirmed as PAID after polling');
                  setStatus('success');
                  setPaymentData(pollResponse.result);
                  localStorage.removeItem('pendingOrderCode');
                  localStorage.removeItem('pendingPackageName');
                } else if (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
                  console.log('❌ Payment failed or cancelled');
                  setStatus('failed');
                  localStorage.removeItem('pendingOrderCode');
                  localStorage.removeItem('pendingPackageName');
                } else if (currentStatus === 'PENDING') {
                  // Tiếp tục polling
                  await pollPaymentStatus();
                }
              } else {
                // API error, tiếp tục polling
                await pollPaymentStatus();
              }
            } catch (error) {
              console.error('❌ Polling error:', error);
              // Nếu lỗi, vẫn tiếp tục polling
              await pollPaymentStatus();
            }
          };

          // Bắt đầu polling
          pollPaymentStatus();
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          // Thanh toán thất bại
          console.log('❌ Payment failed or cancelled');
          setStatus('failed');
          localStorage.removeItem('pendingOrderCode');
          localStorage.removeItem('pendingPackageName');
        } else {
          // Trạng thái không xác định
          console.warn('⚠️ Unknown payment status:', paymentStatus);
          setStatus('processing');
        }
      } else if (response.code === 404) {
        // Không tìm thấy payment
        console.error('❌ Payment not found');
        setStatus('error');
        localStorage.removeItem('pendingOrderCode');
        localStorage.removeItem('pendingPackageName');
      } else {
        // Lỗi API
        console.error('❌ API error:', response.message);
        setStatus('error');
      }
    } catch (error) {
      console.error('❌ Error checking payment:', error);
      setStatus('error');
    }
  }, [searchParams]);

  useEffect(() => {
    checkPaymentResult();
  }, [checkPaymentResult]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hàm để retry check payment status
  const handleRetryCheck = async () => {
    if (!orderCode) {
      const orderCodeFromStorage = localStorage.getItem('pendingOrderCode');
      if (!orderCodeFromStorage) {
        message.error('Không tìm thấy mã đơn hàng');
        return;
      }
      setOrderCode(Number(orderCodeFromStorage));
    }

    setIsRetrying(true);
    setStatus('loading');
    
    try {
      const currentOrderCode = orderCode || Number(localStorage.getItem('pendingOrderCode'));
      const response = await checkPaymentStatus(currentOrderCode);

      if (response.code === 200 && response.result) {
        const paymentStatus = response.result.status?.toUpperCase();
        
        if (paymentStatus === 'PAID') {
          setStatus('success');
          setPaymentData(response.result);
          localStorage.removeItem('pendingOrderCode');
          localStorage.removeItem('pendingPackageName');
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          setStatus('failed');
          localStorage.removeItem('pendingOrderCode');
          localStorage.removeItem('pendingPackageName');
        } else {
          setStatus('processing');
        }
      } else {
        setStatus('processing');
      }
    } catch (error) {
      console.error('❌ Retry error:', error);
      setStatus('processing');
    } finally {
      setIsRetrying(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.bg,
      }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 24, color: THEME.primary }}>
            Đang xác nhận thanh toán
          </Title>
          <Paragraph style={{ color: '#666' }}>
            Vui lòng đợi trong giây lát...
          </Paragraph>
        </Card>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
  const packageName = localStorage.getItem('pendingPackageName') || 'Premium';
  
  return (
    <div
      className="bg-dragon min-h-screen flex items-center justify-center via-white to-yellow-50 p-6"
    >
      <Card
        className="max-w-lg w-full rounded-2xl shadow-xl p-8 bg-white"
        bodyStyle={{ padding: 0 }}
      >
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-500 text-5xl" />}
          title={
            <Title level={3} className="text-red-700">
              Thanh toán thành công!
            </Title>
          }
          subTitle={`Chúc mừng bạn đã nâng cấp lên gói ${packageName}`}
          extra={[
            <Button
              key="home"
              icon={<HomeOutlined />}
              size="large"
              onClick={() => navigate('/')}
              className=" py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
              style={{
                height: 50,
                minWidth: 160,
              }}
            >
              Về trang chủ
            </Button>,
          ]}
        />

        {paymentData && (
          <div className="mt-6">
            <Divider>Thông tin giao dịch</Divider>
            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between mb-3">
                <Text strong>Mã đơn hàng:</Text>
                <Text>{paymentData.orderCode}</Text>
              </div>
              {paymentData.transactionCode && (
                <div className="flex justify-between mb-3">
                  <Text strong>Mã giao dịch:</Text>
                  <Text>{paymentData.transactionCode}</Text>
                </div>
              )}
              <div className="flex justify-between mb-3">
                <Text strong>Số tiền:</Text>
                <Text className="text-red-700 font-semibold">
                  {formatCurrency(paymentData.amount)}
                </Text>
              </div>
              {paymentData.paidAt && (
                <div className="flex justify-between">
                  <Text strong>Thời gian:</Text>
                  <Text>{formatDateTime(paymentData.paidAt)}</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}


  // Failed state
if (status === 'failed') {
  return (
    <div className="bg-dragon min-h-screen flex items-center justify-center via-white to-red-50 p-6">
      <Card className="max-w-lg w-full rounded-2xl shadow-xl p-8 bg-dragon" bodyStyle={{ padding: 0 }}>
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-500 text-5xl" />}
          title={<Title level={3} className="text-red-700">Thanh toán thất bại</Title>}
          subTitle="Đã có lỗi xảy ra trong quá trình thanh toán hoặc bạn đã hủy giao dịch"
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => navigate('/premium-packages')}
              className=" py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
              style={{ height: 50, minWidth: 160 }}
            >
              Thử lại
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              size="large"
              onClick={() => navigate('/')}
              className=" py-3 mb-4 font-semibold rounded-xl hover:shadow-lg transition duration-300"
            >
              Về trang chủ
            </Button>,
          ]}
        />

        <div className="text-center mt-6">
          <Text type="secondary">
            Nếu bạn đã thanh toán nhưng chưa thấy cập nhật, vui lòng liên hệ: 
            <a href="mailto:vtfp.portal@gmail.com" className="ml-2 text-red-700 font-medium">
              vtfp.portal@gmail.com
            </a>
          </Text>
        </div>
      </Card>
    </div>
  );
}


  // Processing state (webhook chưa về)
  if (status === 'processing') {
  return (
    <div className="bg-dragon min-h-screen flex items-center justify-center via-white to-yellow-50 p-6">
      <Card className="max-w-lg w-full rounded-2xl shadow-xl p-8 bg-white" bodyStyle={{ padding: 0 }}>
        <Result
          status="warning"
          icon={<ClockCircleOutlined className="text-yellow-500 text-5xl" />}
          title={<Title level={3} className="text-yellow-700">Đang xử lý thanh toán</Title>}
          subTitle="Giao dịch của bạn đang được xử lý. Webhook từ PayOS có thể cần thêm thời gian để cập nhật trạng thái."
          extra={[
            <Button
              type="primary"
              key="retry"
              icon={<ReloadOutlined />}
              size="large"
              loading={isRetrying}
              onClick={handleRetryCheck}
              className=" py-3 mb-4 font-semibold rounded-xl hover:shadow-lg transition duration-300"
              style={{ height: 50, minWidth: 160 }}
            >
              {isRetrying ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </Button>,
            <Button
              key="home"
              icon={<HomeOutlined />}
              size="large"
              onClick={() => navigate('/')}
              className=" py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
              style={{ height: 50, minWidth: 160 }}
            >
              Về trang chủ
            </Button>,
          ]}
        />

        <div className="mt-6 p-6 bg-yellow-50 rounded-xl shadow-sm">
          <Paragraph className="m-0 text-gray-600">
            <Text strong>Lưu ý:</Text>
            <ul className="mt-2 mb-0 pl-5 list-disc">
              <li>Nếu bạn đã thanh toán thành công, thông tin sẽ được cập nhật trong vòng 5-10 phút</li>
              <li>Bạn có thể click "Kiểm tra lại" để xem trạng thái mới nhất</li>
              <li>Nếu vẫn chưa thấy cập nhật sau 15 phút, vui lòng liên hệ hỗ trợ</li>
            </ul>
          </Paragraph>
        </div>

        <div className="text-center mt-4">
          <Text type="secondary">
            Mã đơn hàng: <Text strong>{orderCode || localStorage.getItem('pendingOrderCode')}</Text>
          </Text>
        </div>
      </Card>
    </div>
  );
}


  // Error state
  return (
    <div
    className='bg-dragon'
     style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: THEME.bg,
      padding: 24,
    }}>
      <Card style={{ maxWidth: 600, width: '100%' }}>
        <Result
          status="404"
          icon={<WarningOutlined style={{ color: '#999' }} />}
          title={
            <Title level={3} style={{ color: THEME.primary }}>
              Không tìm thấy giao dịch
            </Title>
          }
          subTitle="Không thể xác định trạng thái thanh toán"
          extra={[
            <Button 
              type="primary"
              key="packages"
              size="large"
              onClick={() => navigate('/premium-packages')}
              className=" py-3 mb-4 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white font-semibold rounded-xl hover:shadow-lg transition duration-300"
              style={{ 
                height: 45,
                minWidth: 150
              }}
            >
              Quay lại chọn gói
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
};

export default PaymentResultPage;