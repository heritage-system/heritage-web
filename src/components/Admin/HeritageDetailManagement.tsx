import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth, isSameDay, addMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowLeft,
  Star,
  MapPin,
  Camera,
  Tag,
  CalendarDays,
  ExternalLink,
  Edit3,
  Trash2,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Play,
  Map,
  ChevronDown,
  ChevronUp,
  Download,
  MoreVertical,
  Info,
  FileText,
  Image,
  Video,
  Navigation,
  Users,
  Archive,
  Layers,
  Globe,
  History,
  List
} from 'lucide-react';
import HeritageAdminPanel from '../../pages/AdminPage/AdminPage';
import { fetchHeritageDetail, deleteHeritage } from '../../services/heritageService';
import { HeritageDetail } from '../../types/heritage';

// Component để hiển thị mô tả có cấu trúc
const StructuredDescription: React.FC<{ description: string }> = ({ description }) => {
  try {
    // Thử parse JSON nếu description là chuỗi JSON
    const parsedData = JSON.parse(description);
    
    return (
      <div className="space-y-6">
        {parsedData.history && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <History size={18} /> Lịch sử
            </h3>
            <div className="pl-5 space-y-3">
              {parsedData.history.map((item: any, index: number) => (
                <div key={index}>
                  {item.type === 'paragraph' && <p className="text-gray-700">{item.content}</p>}
                  {item.type === 'list' && (
                    <ul className="list-disc pl-5 space-y-1">
                      {item.items.map((listItem: string, i: number) => (
                        <li key={i} className="text-gray-700">{listItem}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedData.rituals && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <List size={18} /> Nghi lễ
            </h3>
            <div className="pl-5 space-y-3">
              {parsedData.rituals.map((item: any, index: number) => (
                <div key={index}>
                  {item.type === 'paragraph' && <p className="text-gray-700">{item.content}</p>}
                  {item.type === 'list' && (
                    <ul className="list-disc pl-5 space-y-1">
                      {item.items.map((listItem: string, i: number) => (
                        <li key={i} className="text-gray-700">{listItem}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedData.values && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <Star size={18} /> Giá trị
            </h3>
            <div className="pl-5 space-y-3">
              {parsedData.values.map((item: any, index: number) => (
                <p key={index} className="text-gray-700">{item.content}</p>
              ))}
            </div>
          </div>
        )}

        {parsedData.preservation && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <Archive size={18} /> Bảo tồn
            </h3>
            <div className="pl-5 space-y-3">
              {parsedData.preservation.map((item: any, index: number) => (
                <p key={index} className="text-gray-700">{item.content}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (e) {
    // Nếu không phải JSON, hiển thị nội dung thô
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: description }} />;
  }
};

// Component mới cho thiết kế hoàn toàn khác biệt
const ModernHeritageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [heritage, setHeritage] = useState<HeritageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'locations' | 'events' | 'audit'|'bài báo'>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    location: false,
    metadata: false
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchHeritageDetail(Number(id));
        const data = (resp as any).result ?? resp;
        if (mounted) setHeritage(data ?? null);
      } catch (err) {
        console.error(err);
        if (mounted) setHeritage(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  const handleDelete = async () => {
    if (!heritage) return;
    if (!window.confirm('Bạn có chắc muốn xóa di sản này?')) return;
    try {
      await deleteHeritage(heritage.id);
      navigate('/admin');
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMediaPreview = (url: string, mediaType: string) => {
    setPreviewUrl(url);
    setPreviewType(mediaType === 'IMAGE' ? 'image' : 'video');
  };

  // Thiết kế mới hoàn toàn khác biệt
  return (
    <HeritageAdminPanel>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header với background gradient mới */}
        <div className="bg-gradient-to-r from-blue-800 to-purple-700 rounded-xl text-white p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin')} 
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{heritage?.name || 'Đang tải...'}</h1>
                <p className="text-blue-100 flex items-center gap-2 mt-1">
                  <span>ID: {heritage?.id || '—'}</span> • 
                  <span>Cập nhật: {heritage ? new Date(heritage.updatedAt).toLocaleDateString('vi-VN') : '—'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Share2 size={18} /> Chia sẻ
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-800 font-medium">
                <Edit3 size={18} /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột trái - Thông tin chính */}
          <div className="lg:col-span-3 space-y-6">
            {/* Ảnh đại diện lớn */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {heritage?.media && heritage.media.length > 0 ? (
                <div className="h-80 relative">
                  <img 
                    src={heritage.media[0].url} 
                    alt={heritage.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-blue-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Tag size={16} /> {heritage?.categoryName || 'Không phân loại'}
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-gray-100 flex items-center justify-center text-gray-400">
                  <Camera size={48} />
                  <span className="ml-2">Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Tab navigation hoàn toàn mới */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { id: 'overview', label: 'Tổng quan', icon: FileText },
                    { id: 'media', label: 'Media', icon: Image },
                    { id: 'locations', label: 'Địa điểm', icon: MapPin },
                    { id: 'events', label: 'Sự kiện', icon: CalendarDays },
                    { id: 'audit', label: 'Nhật ký', icon: Archive },
                    { id: 'bài báo', label: 'Bài báo', icon: Map }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`py-4 px-6 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab === item.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Mô tả di sản</h2>
                    {heritage?.description ? (
                      <StructuredDescription description={heritage.description} />
                    ) : (
                      <p className="italic text-gray-500">Chưa có mô tả cho di sản này</p>
                    )}
                  </div>
                )}

                {activeTab === 'media' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Media</h2>
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                        <Download size={18} /> Tải xuống tất cả
                      </button>
                    </div>
                    
                    {heritage?.media && heritage.media.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {heritage.media.map((item, index) => (
                          <div 
                            key={item.id} 
                            className="rounded-lg overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-105"
                            onClick={() => handleMediaPreview(item.url, item.mediaType)}
                          >
                            {item.mediaType?.toUpperCase() === 'IMAGE' ? (
                              <div className="relative">
                                <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-48 object-cover" />
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  ẢNH
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                                  <Play size={48} className="text-white" />
                                </div>
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  VIDEO
                                </div>
                              </div>
                            )}
                            <div className="p-3 bg-white">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {item.url || `Media${index + 1}`}
                              </div>
                              <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                                {item.mediaType?.toUpperCase() === 'IMAGE' ? (
                                  <>
                                    <Image size={12} /> Ảnh
                                  </>
                                ) : (
                                  <>
                                    <Video size={12} /> Video
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <Image size={48} className="mx-auto text-gray-400" />
                        <p className="mt-3 text-gray-500">Chưa có media nào</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'locations' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Vị trí di sản</h2>
                    {heritage?.locations && heritage.locations.length > 0 ? (
                      <div className="space-y-4">
                        {heritage.locations.map(location => (
                          <div key={location.district} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 border-b">
                              <h3 className="font-medium text-lg">{location.province}</h3>
                              {location.ward && (
                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                  <MapPin size={16} />
                                  {location.ward}
                                </p>
                              )}
                            </div>
                            
                            <div className="h-80 relative">
                              {location.latitude && location.longitude ? (
                                <>
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
                                  />
                                  <div className="absolute bottom-4 right-4">
                                    <a
                                      href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-white rounded-full p-3 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    >
                                      <ExternalLink size={18} />
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <div className="h-full bg-gray-100 flex flex-col items-center justify-center">
                                  <Map size={48} className="text-gray-400 mb-3" />
                                  <p className="text-gray-500">Chưa có thông tin tọa độ</p>
                                </div>
                              )}
                            </div>
                            
                            {location.addressDetail && (
                              <div className="p-4 bg-gray-50">
                                <p className="text-sm text-gray-700">{location.addressDetail}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <Map size={48} className="text-gray-400 mb-3" />
                        <p className="text-gray-500">Chưa có thông tin địa điểm</p>
                        <button className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2">
                          <Navigation size={16} /> Thêm vị trí
                        </button>
                      </div>
                    )}
                  </div>
                )}


                {activeTab === 'events' && heritage && heritage.occurrences && heritage.occurrences.length > 0 && (
  <div className="space-y-4">
    {heritage.occurrences.map(event => (
      <div
        key={event.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
      >
        {/* Header: Thời gian & Tần suất */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {event.startDay}-{event.endDay} Tháng {event.startMonth}
            </div>
            <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
              Từ ngày {event.startDay}/{event.startMonth} đến {event.endDay}/{event.endMonth}
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              {event.frequency === 'ANNUAL' ? 'Hàng năm' : event.frequency}
            </span>
            <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              {event.calendarType === 'LUNAR' ? 'Âm lịch' : 'Dương lịch'}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            ID Sự kiện #{event.id}
          </div>
        </div>

        {/* Mô tả */}
        <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-3">
          {event.description}
        </p>

        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Thêm vào lịch
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            Chia sẻ
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            Lưu thông tin
          </button>
        </div>
      </div>
    ))}
  </div>
)}



                {activeTab === 'audit' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Lịch sử hoạt động</h2>
                    <div className="border-l-2 border-gray-200 ml-4 pl-6 space-y-8">
                      <div className="relative">
                        <div className="absolute -left-7 top-1.5 w-4 h-4 rounded-full bg-blue-500"></div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">Di sản được tạo</h3>
                              <p className="text-sm text-gray-500">Bởi Nguyễn Văn A</p>
                            </div>
                            <span className="text-sm text-gray-500">02/09/2025 10:30</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-7 top-1.5 w-4 h-4 rounded-full bg-green-500"></div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">Cập nhật thông tin</h3>
                              <p className="text-sm text-gray-500">Bởi Trần Thị B</p>
                            </div>
                            <span className="text-sm text-gray-500">03/09/2025 14:45</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                
                {activeTab === 'bài báo' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Thông tin bài báo</h2>
                    {heritage?.mapUrl ? (
                      <div className="h-96 bg-gray-200 rounded-lg overflow-hidden relative">
                        <iframe 
                          src={heritage.mapUrl} 
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          allowFullScreen
                          loading="lazy"
                        />
                        <div className="absolute bottom-4 right-4">
                          <a 
                            href={heritage.mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white rounded-full p-3 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink size={20} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <Map size={48} className="text-gray-400 mb-3" />
                        <p className="text-gray-500">Chưa có thông tin bài báo</p>
                        <button className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-2">
                          <Navigation size={16} /> Thêm bài báo
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Cột phải - Thông tin bổ sung và hành động */}
          <div className="space-y-6">
            {/* Panel thông tin nhanh */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-600" /> Thông tin nhanh
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${heritage?.isFeatured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {heritage?.isFeatured ? 'Nổi bật' : 'Bình thường'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Địa điểm</span>
                  <span className="font-medium">{(heritage?.locations || []).length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Media</span>
                  <span className="font-medium">{(heritage?.media || []).length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sự kiện</span>
                  <span className="font-medium">{(heritage?.occurrences || []).length}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => toggleSection('basicInfo')}
                  className="flex justify-between items-center w-full text-left font-medium"
                >
                  <span>Thông tin cơ bản</span>
                  {expandedSections.basicInfo ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {expandedSections.basicInfo && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span>{heritage ? new Date(heritage.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lần cập nhật:</span>
                      <span>{heritage ? new Date(heritage.updatedAt).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Danh mục:</span>
                      <span>{heritage?.categoryName || '—'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Panel hành động */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-4">Hành động</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors">
                  <Edit3 size={18} /> Chỉnh sửa di sản
                </button>
                
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-lg transition-colors"
                >
                  <Trash2 size={18} /> Xóa di sản
                </button>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                    <Share2 size={16} /> Chia sẻ
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg transition-colors">
                    <Download size={16} /> Xuất file
                  </button>
                </div>
              </div>
            </div>
            
            {/* Panel tags */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Tag size={20} className="text-blue-600" /> Thẻ tags
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {heritage?.tags && heritage.tags.length > 0 ? (
                  heritage.tags.map(tag => (
                    <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      #{tag.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Chưa có tags nào</p>
                )}
              </div>
            </div>

            
            
          </div>
        </div>
        

        {/* Modal xem trước media */}
        {previewUrl && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setPreviewUrl(null);
              setPreviewType(null);
            }}
          >
            <div className="relative max-w-4xl max-h-full bg-black rounded-lg overflow-hidden">
              <button 
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewType(null);
                }}
              >
                Đóng
              </button>
              
              {previewType === 'image' ? (
                <img 
                  src={previewUrl} 
                  alt="Xem trước" 
                  className="max-w-full max-h-[80vh] object-contain mx-auto"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="text-white text-lg">Không thể xem trước video trực tiếp</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </HeritageAdminPanel>
  );
};

export default ModernHeritageDetail;