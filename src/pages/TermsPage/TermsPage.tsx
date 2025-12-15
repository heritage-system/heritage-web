import React, { useState } from 'react';
import { 
  FaFistRaised, FaUserFriends, FaBookOpen, FaScroll, 
  FaEye, FaCoins, FaExchangeAlt, FaFileContract, FaGamepad 
} from 'react-icons/fa';

// --- TYPE DEFINITIONS ---
interface TermSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ContactPerson {
  role: string;
  name: string;
  email: string;
}

// --- CONSTANTS ---
const LAST_UPDATED = "09/12/2025";
const CONTACT_INFO: ContactPerson = {
  role: "Trưởng nhóm dự án (Project Leader)",
  name: "Phan Thị Trà My",
  email: "vtfp.portal@gmail.com",
};

// --- COMPONENT ---
const TermsPage: React.FC = () => {
  // State để quản lý Tab đang hiển thị: 'terms' hoặc 'quiz'
  const [activeTab, setActiveTab] = useState<'terms' | 'quiz'>('terms');

  // --- NỘI DUNG 1: ĐIỀU KHOẢN DỊCH VỤ ---
  const terms: TermSection[] = [
    {
      id: "agreement",
      title: "1. Thỏa thuận Người dùng",
      content: (
        <div className="space-y-3">
          <p>
            Các Điều khoản và Điều kiện sử dụng này ("Điều khoản") cấu thành một thỏa thuận pháp lý ràng buộc giữa bạn ("Người dùng", "Bạn") và Ban quản trị dự án VTFP thuộc Đại học FPT ("Chúng tôi", "VTFP", "Ban quản trị").
          </p>
          <p>
            Bằng việc truy cập, đăng ký hoặc sử dụng bất kỳ phần nào của Nền tảng VTFP (bao gồm website, API, dịch vụ VR 360°), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý chịu sự ràng buộc của các Điều khoản này.
          </p>
        </div>
      ),
    },
    {
      id: "definitions",
      title: "2. Định nghĩa Dịch vụ & Tài khoản",
      content: (
        <div className="space-y-2">
          <p>Hệ thống cung cấp dịch vụ dựa trên các cấp độ truy cập sau:</p>
          <ul className="list-none pl-2 space-y-2">
            <li><strong>2.1. Khách (Guest):</strong> Người dùng không đăng ký, có quyền truy cập hạn chế vào dữ liệu công khai và trải nghiệm VR thông qua Theasys.</li>
            <li><strong>2.2. Thành viên (Member):</strong> Người dùng đã đăng ký tài khoản hợp lệ. Được cấp quyền sử dụng các tính năng tương tác (Đánh giá, Yêu thích, Quiz) và trích xuất dữ liệu (Export Data).</li>
            <li><strong>2.3. Thành viên VIP (Premium Member):</strong> Thành viên đã thanh toán phí để truy cập nội dung nâng cao.</li>
            <li><strong>2.4. Đối tác Công nghệ:</strong> Các bên thứ ba cung cấp hạ tầng kỹ thuật, bao gồm nhưng không giới hạn ở Theasys (nền tảng VR) và các dịch vụ thanh toán.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "third-party",
      title: "3. Dịch vụ Bên thứ ba & Theasys Platform",
      content: (
        <div className="space-y-3 border-l-4 border-gray-300 pl-4 bg-gray-50 p-3">
          <p><strong>3.1. Tích hợp Theasys:</strong> Tính năng Tham quan thực tế ảo (360° Virtual Tour) trên VTFP được vận hành dựa trên nền tảng <strong>Theasys</strong>. Bằng việc sử dụng tính năng này, bạn đồng ý tuân thủ Điều khoản sử dụng riêng biệt của Theasys.</p>
          <p><strong>3.2. Miễn trừ trách nhiệm bên thứ ba:</strong> Chúng tôi không kiểm soát và không chịu trách nhiệm đối với:</p>
          <ul className="list-disc pl-5">
            <li>Sự gián đoạn dịch vụ, bảo trì hệ thống, hoặc ngừng hoạt động từ phía Theasys.</li>
            <li>Bất kỳ việc thu thập dữ liệu (Cookies, Tracking) nào do Theasys thực hiện trên thiết bị của bạn.</li>
            <li>Độ chính xác hoặc chất lượng hiển thị của hình ảnh 360° phụ thuộc vào máy chủ của Theasys.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "financial",
      title: "4. Điều khoản Thanh toán",
      content: (
        <div className="space-y-2">
          <p><strong>4.1. Dịch vụ Trả phí (Premium):</strong> Các khoản thanh toán cho gói Premium là không hoàn lại (non‑refundable), trừ trường hợp lỗi kỹ thuật rõ ràng được xác định bởi hệ thống VTFP.</p>
          <p><strong>4.2. Hủy và hoàn tiền:</strong> Chính sách hủy và hoàn tiền được áp dụng theo quy định chi tiết trong phần Thanh toán.</p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "5. Quyền Sở hữu Trí tuệ & Bản quyền",
      content: (
        <div className="space-y-2">
          <p><strong>5.1. Nội dung của VTFP:</strong> Mã nguồn, giao diện, logo và cơ sở dữ liệu tổng hợp thuộc quyền sở hữu của Nhóm dự án Capstone.</p>
          <p><strong>5.2. Nội dung Người dùng (User Content):</strong></p>
          <ul className="list-disc pl-5">
            <li>Người dùng giữ quyền sở hữu đối với nội dung tải lên.</li>
            <li>Tuy nhiên, bạn cấp cho VTFP quyền vĩnh viễn, không độc quyền, miễn phí bản quyền để sử dụng, sao chép, hiển thị và phân phối nội dung đó trên nền tảng.</li>
            <li>Bạn cam kết chịu trách nhiệm pháp lý hoàn toàn trước các khiếu nại về bản quyền từ bên thứ ba đối với nội dung bạn tải lên.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "prohibited",
      title: "6. Các hành vi bị nghiêm cấm",
      content: (
        <div className="space-y-2">
          <p>Nghiêm cấm người dùng thực hiện các hành vi sau:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sử dụng bot/script để cào dữ liệu (scraping) hoặc spam hệ thống.</li>
            <li>Tải lên nội dung xuyên tạc lịch sử, vi phạm thuần phong mỹ tục hoặc pháp luật Việt Nam.</li>
            <li>Can thiệp vào mã nguồn hoặc thực hiện tấn công từ chối dịch vụ (DDoS).</li>
          </ul>
        </div>
      ),
    },
    {
      id: "disclaimer",
      title: "7. Tuyên bố Từ chối Trách nhiệm (Disclaimer)",
      content: (
        <div className="space-y-2">
          <p>Dịch vụ được cung cấp trên cơ sở "NGUYÊN TRẠNG" (AS IS).</p>
          <p><strong>7.1. Độ chính xác của AI:</strong> Tính năng nhận diện di sản bằng AI (sử dụng Python/TensorFlow) chỉ mang tính chất tham khảo thử nghiệm.</p>
          <p><strong>7.2. Rủi ro dữ liệu:</strong> Chúng tôi không cam kết rằng hệ thống miễn nhiễm hoàn toàn với các cuộc tấn công mạng.</p>
        </div>
      ),
    },
    {
      id: "termination",
      title: "8. Chấm dứt Thỏa thuận",
      content: (
        <p>
          Ban quản trị có quyền đơn phương chấm dứt quyền truy cập hoặc xóa tài khoản của bạn (bao gồm cả tài khoản Premium) mà không cần báo trước nếu phát hiện vi phạm các Điều khoản này.
        </p>
      ),
    },
    {
      id: "contact",
      title: "9. Thông tin liên hệ pháp lý",
      content: (
        <div className="text-sm text-gray-700">
          <p>Mọi thông báo pháp lý hoặc thắc mắc về Điều khoản này vui lòng gửi về:</p>
          <ul className="mt-2 pl-4 border-l-2 border-gray-400">
            <li><strong>Người nhận:</strong> {CONTACT_INFO.name} ({CONTACT_INFO.role})</li>
            <li><strong>Email:</strong> <a href={`mailto:${CONTACT_INFO.email}`} className="text-blue-700 underline">{CONTACT_INFO.email}</a></li>
            <li><strong>Đơn vị quản lý:</strong> FPT University Da Nang Campus</li>
          </ul>
        </div>
      ),
    },
  ];

  // --- RENDER COMPONENT ---
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10 px-4 sm:px-6 lg:px-8 font-medium"> 
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        
        {/* === HEADER CHUNG === */}
        <div className="p-10 border-b border-gray-200 text-center bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            Trung tâm Chính sách & Quy định
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Cập nhật lần cuối: {LAST_UPDATED}
          </p>

          {/* === TABS NAVIGATION (Nút chuyển đổi) === */}
          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={() => setActiveTab('terms')}
              className={`flex items-center px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === 'terms' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaFileContract className="mr-2" /> Điều khoản Dịch vụ
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaGamepad className="mr-2" /> Quy chế Điểm thưởng
            </button>
          </div>
        </div>

        {/* === CONTENT AREA === */}
        <div className="p-10 text-gray-800 leading-relaxed text-justify min-h-[500px]">
          
          {/* TRƯỜNG HỢP 1: HIỂN THỊ ĐIỀU KHOẢN (TERMS) */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 mb-8 rounded">
                <strong>CHÚ Ý:</strong> Đây là thỏa thuận pháp lý quan trọng liên quan đến quyền và nghĩa vụ của bạn. Vui lòng đọc kỹ.
              </div>
              {terms.map((term) => (
                <section key={term.id}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase">
                    {term.title}
                  </h3>
                  <div className="text-sm md:text-base text-gray-600">
                    {term.content}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* TRƯỜNG HỢP 2: HIỂN THỊ QUIZ RULES */}
          {activeTab === 'quiz' && (
            <div className="space-y-12 animate-fadeIn">
              
              {/* Introduction */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-800">Cơ chế "Điểm Linh Hội" & Phần thưởng</h2>
                <p className="text-gray-500 mt-2">Tham gia tranh tài, tích lũy điểm và đổi lấy những đặc quyền giá trị.</p>
              </div>

              {/* SECTION 1: CÁC CHẾ ĐỘ */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-3">1. Các Chế độ Tranh tài</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Mode 1 */}
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 relative">
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">TÍNH ĐIỂM</div>
                    <div className="text-blue-600 text-3xl mb-3"><FaFistRaised /></div>
                    <h4 className="font-bold text-gray-900">Đấu Ngẫu nhiên (1vs1)</h4>
                    <p className="text-sm text-gray-600 mt-2 mb-3">Ghép cặp ngẫu nhiên với người lạ.</p>
                    <div className="text-xs bg-white p-2 rounded text-blue-800 font-semibold border border-blue-200">
                      Sẽ được cộng điểm
                    </div>
                  </div>
                  {/* Mode 2 */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 opacity-80">
                    <div className="text-gray-500 text-3xl mb-3"><FaUserFriends /></div>
                    <h4 className="font-bold text-gray-900">Chơi cùng Bạn bè</h4>
                    <p className="text-sm text-gray-600 mt-2">Tạo phòng riêng để giao lưu vui vẻ.</p>
                    <p className="text-xs text-gray-400 mt-2 font-bold italic">(Không tính điểm)</p>
                  </div>
                  {/* Mode 3 */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 opacity-80">
                    <div className="text-gray-500 text-3xl mb-3"><FaBookOpen /></div>
                    <h4 className="font-bold text-gray-900">Luyện tập Tùy chọn</h4>
                    <p className="text-sm text-gray-600 mt-2">Tự chọn chủ đề để ôn luyện.</p>
                    <p className="text-xs text-gray-400 mt-2 font-bold italic">(Không tính điểm)</p>
                  </div>
                </div>
              </section>

              {/* SECTION 2: BÀI VIẾT */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-yellow-500 pl-3">2. Điểm thưởng từ Nội dung</h3>
                <div className="flex items-start bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <div className="text-yellow-600 text-4xl mr-5"><FaScroll /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Viết bài & Đóng góp (Contributor)</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Bạn cũng có thể kiếm điểm thông qua việc đóng góp nội dung chất lượng. 
                      Hệ thống sẽ tự động cộng điểm dựa trên <strong>Lượt xem (Views)</strong> hợp lệ của bài viết.
                    </p>
                    <div className="flex items-center text-xs font-bold text-yellow-700">
                      <FaEye className="mr-1" /> Nhiều lượt xem = Nhiều điểm thưởng
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: ĐỔI ĐIỂM */}
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-purple-500 pl-3">3. Đặc quyền Đổi điểm</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3 text-purple-700">
                      <FaCoins className="mr-2 text-xl" />
                      <h4 className="font-bold">Nâng cấp Contributor</h4>
                    </div>
                    <p className="text-sm text-gray-600">Tích lũy điểm để mở khóa quyền đăng bài và trở thành nhà sáng tạo nội dung chính thức.</p>
                  </div>
                  <div className="border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3 text-purple-700">
                      <FaExchangeAlt className="mr-2 text-xl" />
                      <h4 className="font-bold">Xem nội dung VIP</h4>
                    </div>
                    <p className="text-sm text-gray-600">Sử dụng điểm để đổi lấy lượt xem các tài liệu quý hoặc Tour VR đặc biệt (1 lượt xem = X điểm).</p>
                  </div>
                </div>
              </section>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>© 2025 VTFP Project. All rights reserved.</p>
          <p className="mt-1">Bản quyền thuộc về Dự án Capstone Đại học FPT.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;