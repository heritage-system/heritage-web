import React, { useEffect, useState } from "react";
import { fetchRepliesByReportId, getReportById } from "../../services/reportService";
import { Report, ReportReply } from "../../types/report";
import { useParams } from "react-router-dom";
import HeritageAdminPanel from "../../pages/AdminPage/AdminPage";
import { 
  Send, 
  ArrowLeft, 
  MessageCircle, 
  AlertTriangle, 
  User, 
  Calendar, 
  Building2,
  Quote,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReportDetailManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const reportId = Number(id);
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [replies, setReplies] = useState<ReportReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!reportId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [reportRes, replyRes] = await Promise.all([
          getReportById(reportId),
          fetchRepliesByReportId(reportId),
        ]);
        setReport(reportRes.result || null);
        setReplies(replyRes.result || []);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [reportId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <HeritageAdminPanel>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-16 bg-white rounded-lg shadow animate-pulse"></div>
            <div className="h-96 bg-white rounded-lg shadow animate-pulse"></div>
          </div>
        </div>
      </HeritageAdminPanel>
    );
  }

  return (
    <HeritageAdminPanel>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300"
                >
                  <ArrowLeft size={18} />
                  Quay về danh sách
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-gray-900">Chi tiết báo cáo #{reportId}</h1>
              </div>
              <div className="text-sm text-gray-500">
                {report && `Tạo lúc: ${new Date(report.createdAt).toLocaleString('vi-VN')}`}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-8">
          
          {/* Report Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-900">Thông tin báo cáo vi phạm</h2>
                  <p className="text-sm text-red-700">Chi tiết báo cáo từ người dùng</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Người báo cáo</p>
                      <p className="text-lg font-semibold text-gray-900">{report?.userName || "Không xác định"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <Building2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-1">Di sản được báo cáo</p>
                      <p className="text-lg font-semibold text-gray-900">{report?.heritageName || "Không xác định"}</p>
                    </div>
                  </div>
                </div>

                {/* Reason - Highlighted */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Quote className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">Lý do báo cáo</h3>
                      <p className="text-sm text-orange-700 mb-3">Nội dung chi tiết về vi phạm</p>
                    </div>
                  </div>
                  <div className="bg-white border border-orange-200 rounded-lg p-4">
                    <p className="text-gray-900 leading-relaxed text-base max-wh-40 overflow-y-auto">
                      {report?.reason || "Chưa có thông tin chi tiết về lý do báo cáo."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Responses Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900">Phản hồi từ Admin</h2>
                    <p className="text-sm text-blue-700">
                      {replies.length > 0 
                        ? `Có ${replies.length} phản hồi từ đội ngũ quản trị` 
                        : "Chưa có phản hồi nào"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <MessageCircle size={16} />
                  {replies.length} phản hồi
                </div>
              </div>
            </div>

            <div className="p-6">
              {replies.length > 0 ? (
                <div className="space-y-6">
                  {replies.map((reply, index) => (
                    <div key={reply.id} className="relative">
                      {/* Timeline connector */}
                      {index < replies.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
                      )}
                      
                      <div className="flex gap-4">
                        {/* Avatar/Number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-semibold">{index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex-1">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                            {/* Message Header */}
                            <div className="bg-white px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Quản trị viên</p>
                                    <p className="text-sm text-gray-600">Phản hồi chính thức</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock size={14} />
                                  {new Date(reply.createdAt).toLocaleString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            
                            {/* Message Body */}
                            <div className="p-4">
                              <div 
                                className={`text-gray-800 leading-relaxed whitespace-pre-line ${
                                  expandedIds.includes(reply.id) ? "" : "line-clamp-4"
                                }`}
                              >
                                {reply.message}
                              </div>
                              
                              {reply.message.length > 200 && (
                                <button
                                  onClick={() => toggleExpand(reply.id)}
                                  className="flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                                >
                                  {expandedIds.includes(reply.id) ? (
                                    <>
                                      <ChevronUp size={16} />
                                      Thu gọn
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} />
                                      Xem đầy đủ
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phản hồi</h3>
                  <p className="text-gray-600 mb-6">Báo cáo này chưa được xử lý. Hãy gửi phản hồi đầu tiên.</p>
                </div>
              )}
            </div>
          </div>

          {/* Reply Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <h3 className="text-lg font-semibold text-green-900">Gửi phản hồi mới</h3>
              <p className="text-sm text-green-700">Phản hồi của bạn sẽ được lưu vào lịch sử xử lý</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung phản hồi
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập phản hồi chi tiết về báo cáo này..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Phản hồi sẽ được ghi nhận với thời gian hiện tại
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => setNewMessage("")}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send size={16} />
                      )}
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </HeritageAdminPanel>
  );
};

export default ReportDetailManagement;