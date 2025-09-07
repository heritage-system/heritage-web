// src/pages/Admin/HeritageDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Tag,
  CalendarDays,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Pencil,
  Eye,
  Clock,
  Globe,
  Camera,
  Play,
  Download,
  Share2,
  Bookmark,
  Award,
  Map,
  MapPinned,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Edit3,
  X
} from "lucide-react";
import HeritageAdminPanel from "../../pages/AdminPage/AdminPage";
import { fetchHeritageDetail, deleteHeritage } from "../../services/heritageService";
import { HeritageDetail } from "../../types/heritage";
import { notification } from "antd";

interface Occurrence {
  id: number;
  occurrenceType: string;
  calendarType: string;
  startDay: number;
  startMonth: number;
  frequency: string;
  description: string;
}

interface Props {
  occurrences: Occurrence[];
}

const safeParseDescription = (desc?: string) => {
  if (!desc) return null;
  try {
    return JSON.parse(desc);
  } catch (e) {
    return { raw: desc };
  }
};

// UI Components
const SmallMeta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string; size?: 'sm' | 'md' }> = ({ 
  children, 
  color = "gray", 
  size = "md" 
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1.5';
  const colorClasses = {
    purple: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-300 dark:border-purple-700",
    blue: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 dark:border-blue-700",
    green: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-300 dark:border-green-700",
    orange: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-300 dark:border-orange-700",
    red: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 dark:border-red-700",
    gray: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300 dark:border-gray-600"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm ${sizeClasses} ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {children}
    </span>
  );
};

const DetailRow: React.FC<{ 
  label: string; 
  value?: React.ReactNode; 
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ label, value, icon, action }) => (
  <div className="flex gap-4 items-start py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex items-center gap-2 w-36 text-gray-500 dark:text-gray-400 font-medium text-sm">
      {icon}
      {label}
    </div>
    <div className="flex-1 text-gray-800 dark:text-gray-200 font-medium">
      {value ?? <span className="italic text-gray-400">—</span>}
    </div>
    {action && <div className="flex items-center">{action}</div>}
  </div>
);

const StatsCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}> = ({ icon, label, value, color, onClick }) => (
  <div 
    className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  icon: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  gradient: string;
}> = ({ title, icon, count, action, gradient }) => (
  <div className={`${gradient} p-6 flex items-center justify-between`}>
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-xl font-bold text-white">
        {title} {count !== undefined && `(${count})`}
      </h2>
    </div>
    {action}
  </div>
);

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}> = ({ icon, label, variant = 'secondary', onClick }) => {
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${variantClasses[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
};

const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [heritage, setHeritage] = useState<HeritageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    locations: true,
    media: true,
    tags: true,
    occurrences: true
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchHeritageDetail(Number(id));
        const data = (resp as any).result ?? resp;
        if (mounted) setHeritage(data ?? null);
      } catch (err) {
        console.error("Error loading heritage:", err);
        if (mounted) setHeritage(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!heritage || !window.confirm(`Are you sure you want to delete "${heritage.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteHeritage(heritage.id);
      navigate("/admin", { 
        state: { message: `"${heritage.name}" has been successfully deleted` } 
      });
    } catch (error) {
      console.error("Failed to delete heritage:", error);
      alert("Failed to delete heritage. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading)
    return (
      <HeritageAdminPanel>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 h-96 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl" />
              <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl" />
            </div>
          </div>
        </div>
      </HeritageAdminPanel>
    );

  if (!heritage)
    return (
      <HeritageAdminPanel>
        <div className="p-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Không tìm thấy di sản</p>
            <p className="text-gray-500 mb-6">ID không tồn tại hoặc đã bị xóa</p>
            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={18} /> Quay về trang chủ
            </button>
          </div>
        </div>
      </HeritageAdminPanel>
    );

  const descParsed = safeParseDescription(heritage.description);

  return (
    <HeritageAdminPanel>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-md bg-white/90 dark:bg-gray-800/90">
          <div className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium"
                >
                  <ArrowLeft size={18} /> Quay về
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {heritage.name}
                    </h1>
                    {heritage.isFeatured && (
                      <Pill color="blue">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        Nổi bật
                      </Pill>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      ID: {heritage.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(heritage.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ActionButton
                  icon={<Share2 size={16} />}
                  label="Chia sẻ"
                  variant="secondary"
                />
                <ActionButton
                  icon={<Bookmark size={16} />}
                  label="Lưu"
                  variant="secondary"
                />
                <ActionButton
                  icon={<Pencil size={16} />}
                  label="Chỉnh sửa"
                  variant="primary"
                  onClick={() => navigate(`/admin/heritage/edit/${heritage.id}`)}
                />
                <div className="relative group">
                  <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    <MoreVertical size={18} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button 
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-xl"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 size={16} />
                      {deleting ? "Deleting..." : "Delete Heritage"}
                    </button>
                    <button className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-xl">
                      <Download size={16} />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCard
              icon={<Camera className="w-5 h-5 text-blue-600" />}
              label="Media"
              value={heritage.media?.length ?? 0}
              color="bg-blue-50 dark:bg-blue-900/20"
              onClick={() => {
                setActiveTab('media');
                document.getElementById('media-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <StatsCard
              icon={<Tag className="w-5 h-5 text-purple-600" />}
              label="Tags"
              value={heritage.tags?.length ?? 0}
              color="bg-purple-50 dark:bg-purple-900/20"
              onClick={() => {
                setActiveTab('tags');
                document.getElementById('tags-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <StatsCard
              icon={<MapPin className="w-5 h-5 text-green-600" />}
              label="Địa điểm"
              value={heritage.locations?.length ?? 0}
              color="bg-green-50 dark:bg-green-900/20"
              onClick={() => {
                setActiveTab('locations');
                document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <StatsCard
              icon={<CalendarDays className="w-5 h-5 text-orange-600" />}
              label="Sự kiện"
              value={heritage.occurrences?.length ?? 0}
              color="bg-orange-50 dark:bg-orange-900/20"
              onClick={() => {
                setActiveTab('occurrences');
                document.getElementById('occurrences-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <SectionHeader
                  title="Thông tin cơ bản"
                  icon={<Award className="w-6 h-6" />}
                  gradient="bg-gradient-to-r from-purple-600 to-blue-600"
                />
                <div className="p-6 space-y-0">
                  <DetailRow
                    icon={<Tag className="w-4 h-4 text-purple-500" />}
                    label="Danh mục"
                    value={<Pill color="purple">{heritage.categoryName}</Pill>}
                    
                  />
                  <DetailRow
                    icon={<Star className="w-4 h-4 text-yellow-500" />}
                    label="Trạng thái"
                    value={
                      <div className="flex gap-2">
                        <Pill color={heritage.isFeatured ? "blue" : "gray"}>
                          {heritage.isFeatured ? "Nổi bật" : "Thông thường"}
                        </Pill>
                      </div>
                    }
                    
                  />
                  <DetailRow
                    icon={<Clock className="w-4 h-4 text-gray-500" />}
                    label="Tạo lúc"
                    value={new Date(heritage.createdAt).toLocaleString('vi-VN')}
                  />
                  <DetailRow
                    icon={<Clock className="w-4 h-4 text-gray-500" />}
                    label="Cập nhật"
                    value={new Date(heritage.updatedAt).toLocaleString('vi-VN')}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div 
                  className="bg-gradient-to-r from-green-600 to-teal-600 p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('description')}
                >
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {expandedSections.description ? <ChevronUp /> : <ChevronDown />}
                    Mô tả chi tiết
                  </h2>
                  <button className="text-white/80 hover:text-white p-1">
                    <Edit3 size={18} />
                  </button>
                </div>
                {expandedSections.description && (
                  <div className="p-6">
                    {descParsed == null ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <CalendarDays className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 italic">Chưa có mô tả</p>
                        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all">
                          <Plus size={16} />
                          Thêm mô tả
                        </button>
                      </div>
                    ) : (descParsed as any).raw ? (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        {(descParsed as any).raw}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {["history", "rituals", "values", "preservation"].map((key) => {
                          const blocks = (descParsed as any)[key];
                          if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;
                          
                          const sectionTitles = {
                            history: "Lịch sử",
                            rituals: "Nghi lễ",
                            values: "Giá trị",
                            preservation: "Bảo tồn"
                          };
                          
                          return (
                            <section key={key} className="border-l-4 border-blue-400 pl-6">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                {sectionTitles[key as keyof typeof sectionTitles]}
                              </h4>
                              <div className="prose prose-gray dark:prose-invert max-w-none">
                                {blocks.map((b: any, idx: number) =>
                                  b.type === "paragraph" ? (
                                    <p key={idx} className="mb-3 leading-relaxed">{b.content}</p>
                                  ) : b.type === "list" ? (
                                    <ul key={idx} className="list-disc pl-5 space-y-1">
                                      {b.items?.map((it: string, i: number) => (
                                        <li key={i} className="leading-relaxed">{it}</li>
                                      ))}
                                    </ul>
                                  ) : null
                                )}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Locations */}
              <div id="locations-section" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('locations')}
                >
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {expandedSections.locations ? <ChevronUp /> : <ChevronDown />}
                    <MapPin className="w-6 h-6" />
                    Địa điểm ({heritage.locations?.length ?? 0})
                  </h2>
                  <button className="text-white/80 hover:text-white p-1">
                    <Plus size={20} />
                  </button>
                </div>
                {expandedSections.locations && (
                  <div className="p-6">
                    {heritage.locations && heritage.locations.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {heritage.locations.map((loc, i) => {
                          const line = [loc.addressDetail, loc.ward, loc.district, loc.province].filter(Boolean).join(", ");
                          const coords = loc.latitude && loc.longitude ? `${loc.latitude},${loc.longitude}` : null;
                          
                          return (
                            <div key={i} className="relative group">
  <div className="p-5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
        <MapPinned className="w-5 h-5 text-green-600" />
      </div>

      {/* Nội dung */}
      <div className="flex-1">
        {/* Địa chỉ */}
        <div className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {line || "Địa chỉ không xác định"}
        </div>

        {/* Chi tiết thông tin */}
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li><span className="font-medium text-gray-800 dark:text-gray-100">Tỉnh/TP:</span> {loc.province}</li>
          <li><span className="font-medium text-gray-800 dark:text-gray-100">Quận/Huyện:</span> {loc.district}</li>
          <li className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-100">Tọa độ:</span>
            <span className="font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">
              {loc.latitude}, {loc.longitude}
            </span>
          </li>
        </ul>
      </div>

      {/* Menu button */}
      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <MoreVertical size={16} />
      </button>
    </div>
  </div>
</div>

                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 italic">Chưa có thông tin địa điểm</p>
                        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all">
                          <Plus size={16} />
                          Thêm địa điểm
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Media, Tags, Occurrences */}
            <div className="space-y-6">
              {/* Media Gallery */}
              <div id="media-section" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('media')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {expandedSections.media ? <ChevronUp /> : <ChevronDown />}
                    <Camera className="w-5 h-5" />
                    Media ({heritage.media?.length ?? 0})
                  </h3>
                  <button className="text-white/80 hover:text-white p-1">
                    <Plus size={20} />
                  </button>
                </div>
                {expandedSections.media && (
                  <div className="p-6">
                    {heritage.media && heritage.media.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {heritage.media.map((m) => (
                          <div
                            key={m.id}
                            className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedImage(m.url)}
                          >
                            {m.mediaType?.toUpperCase() === "IMAGE" ? (
                              <div className="relative">
                                <img 
                                  src={m.url} 
                                  alt={heritage.name} 
                                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 transition-all">
                                <div className="text-center">
                                  <Play className="w-8 h-8 mx-auto mb-2 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                  <div className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Video</div>
                                </div>
                              </div>
                            )}
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                              <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                {m.url.split('/').pop()}
                              </div>
                              <button className="text-gray-400 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 italic">Chưa có media</p>
                        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">
                          <Plus size={16} />
                          Thêm media
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div id="tags-section" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('tags')}
                >
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {expandedSections.tags ? <ChevronUp /> : <ChevronDown />}
                    <Tag className="w-5 h-5" />
                    Tags ({heritage.tags?.length ?? 0})
                  </h3>
                  <button className="text-white/80 hover:text-white p-1">
                    <Plus size={20} />
                  </button>
                </div>
                {expandedSections.tags && (
                  <div className="p-6">
                    {heritage.tags && heritage.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {heritage.tags.map((t) => (
                          <div key={t.id} className="relative group">
                            <Pill color="purple" size="sm">
                              #{t.name}
                            </Pill>
                            <button className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                          <Plus size={12} />
                          Add Tag
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 italic">Chưa có tag</p>
                        <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all">
                          <Plus size={16} />
                          Thêm tag
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Occurrences */}
<div
  id="occurrences-section"
  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
>
  {/* Header */}
  <div
    className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex items-center justify-between cursor-pointer"
    onClick={() =>
      setExpandedSections((prev) => ({
        ...prev,
        occurrences: !prev.occurrences,
      }))
    }
  >
    <h3 className="text-lg font-bold text-white flex items-center gap-2">
      {expandedSections.occurrences ? (
        <ChevronUp />
      ) : (
        <ChevronDown />
      )}
      <CalendarDays className="w-5 h-5" />
      Thời gian diễn ra ({heritage.occurrences?.length ?? 0})
    </h3>
    <button className="text-white/80 hover:text-white p-1">
      <Plus size={20} />
    </button>
  </div>

  {/* Content */}
  {expandedSections.occurrences && (
    <div className="p-6 transition-all duration-300">
  {heritage.occurrences && heritage.occurrences.length > 0 ? (
    <div className="space-y-4">
      {heritage.occurrences.map((o) => (
        <div key={o.id} className="relative group">
          <div className="p-5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-orange-900/20 dark:via-gray-800 dark:to-yellow-900/20 hover:shadow-lg transition-all duration-300">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white dark:bg-gray-700 border-2 border-orange-200 dark:border-orange-600 shadow-md rounded-xl px-4 py-3 text-center min-w-[80px]">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{o.startDay}</div>
                <div className="text-xs uppercase text-gray-500 font-medium">Th.{o.startMonth}</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {o.occurrenceType === "EXACTDATE" ? "Ngày cố định" : "Khoảng thời gian"}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {o.startDay}/{o.startMonth} - {o.endDay}/{o.endMonth}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Pill color="orange" size="sm">
                    {o.calendarType === "LUNAR" ? "Âm lịch" : "Dương lịch"}
                  </Pill>
                  <Pill color="blue" size="sm">
                    {o.frequency === "ANNUAL" ? "Hằng năm" : o.frequency}
                  </Pill>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                ID #{o.id}
              </div>
            </div>

            {/* Mô tả (chỉ in description) */}
            {o.description && (
              <div className="mt-3 p-3 bg-white/70 dark:bg-gray-700/50 rounded-lg border border-orange-100 dark:border-orange-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {o.description}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8">
      <CalendarDays className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <p className="text-gray-500 italic">Chưa có thông tin sự kiện</p>
    </div>
  )}
</div>

  )}
</div>

            </div>
          </div>
        </div>

        {/* Modal Preview Image */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-full max-w-full rounded-xl shadow-lg"
            />
            <button
              className="absolute top-5 right-5 text-white bg-gray-800/60 hover:bg-gray-900/80 p-2 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </HeritageAdminPanel>
  );
};

export default HeritageDetailPage;
// notification service