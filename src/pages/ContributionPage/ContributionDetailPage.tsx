import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, Share2, BookmarkPlus, MessageCircle, Clock, Star, ThumbsUp,Flag } from "lucide-react";
import ContentPreview from "../../components/ContributionForm/ContentPreview";
import { getContributionDetail, unlockContribution, addContributionSave, removContributionSave } from "../../services/contributionService";
import { ContributionResponse } from "../../types/contribution";
import {HeritageContributorPosts} from "../../components/HeritageDetail/HeritageContributorPosts";
import toast from 'react-hot-toast';
const ArticleDetailPage = () => {
  // Mock data - thay thế bằng data thực từ API
  const [articleMocks] = useState({
    id: 1,
    title: "Khám phá văn hóa ẩm thực truyền thống Việt Nam qua các món bánh dân gian",
    content: `
      {"ops":[{"insert":"Nếu có dịp "},{"attributes":{"bold":true,"color":"#0079c0","link":"https://vinpearl.com/vi/du-lich-ha-noi-voi-tron-bo-bi-kip-day-du-vui-quen-loi-ve"},"insert":"du lịch Hà Nội"},{"insert":" những ngày đầu tháng 3 Âm lịch, bạn nên dành thời gian tham gia "},{"attributes":{"bold":true},"insert":"lễ hội Chùa Láng"},{"insert":" – một trong những sự kiện đặc sắc của người dân Thủ đô. Tuy nhiên, lễ hội lớn này không phải năm nào cũng được tổ chức. Cùng Vinpearl tìm hiểu về lễ hội lớn nhất phía Tây Hà Nội qua bài viết dưới đây!\n1. Giới thiệu về lễ hội Chùa Láng Hà Nội"},{"attributes":{"header":2},"insert":"\n"},{"attributes":{"bold":true},"insert":"Địa điểm tổ chức:"},{"insert":" 116 phố Chùa Láng, thuộc phường Láng Thượng, quận Đống Đa, Hà Nội "},{"attributes":{"list":"bullet"},"insert":"\n"},{"attributes":{"bold":true},"insert":"Thời gian diễn ra:"},{"insert":" ngày 5 đến ngày 8 tháng 3 Âm lịch "},{"attributes":{"list":"bullet"},"insert":"\n"},{"attributes":{"alt":"Lễ hội Chùa Láng","background":"#ffffff","color":"#343a40"},"insert":{"image":"https://statics.vinpearl.com/le-hoi-chua-lang-1_1696427875.jpg"}},{"attributes":{"background":"#ffffff","color":"#343a40","italic":true},"insert":"Phục dựng lễ hội Chùa Láng – nét văn hóa độc đáo của người dân Hà thành (Ảnh: Sưu tầm)"},{"insert":"\n"},{"attributes":{"bold":true,"color":"#0079c0","link":"https://vinpearl.com/vi/chua-lang-dia-diem-tam-linh-ha-noi"},"insert":"Chùa Láng"},{"insert":" – nơi tổ chức lễ hội Chùa Láng là địa điểm được vua Lý Anh Tông xây dựng để thờ Phật, vua cha Lý Thần Tông và tiền thân của ngài là Thiền sư Từ Đạo Hạnh. Theo truyền thuyết kể lại, ông là người đã đầu thai làm con trai của Sùng Hiền Hầu, sau đó được gọi tên là Dương Hoán. Vua Lý Nhân Tông là bác ruột đã nhận Dương Hoán làm con nuôi, sau đó phong làm thái tử và trở thành người kế vị của vua Lý Thần Tông. Trong lịch sử, hiếm có người như Lý Thiền Quốc sư Từ Đạo Hạnh, bởi ông vừa là một nhà sư, vừa là Vua, vừa là Thánh. \nChùa Láng là có ý nghĩa lịch sử văn hóa đặc biệt quan trọng với người dân Thủ đô. Công trình này có tới 100 gian lớn nhỏ, mang nhiều giá trị kiến trúc nổi bật. Hiện nay, đây cũng là ngôi chùa lưu giữ nhiều di vật văn hóa, nghệ thuật đồ sộ, đa dạng về chất liệu và chủng loại. \n"},{"attributes":{"alt":"Lễ hội Chùa Láng","background":"#ffffff","color":"#343a40"},"insert":{"image":"https://statics.vinpearl.com/le-hoi-chua-lang-2_1696427901.jpg"}},{"attributes":{"background":"#ffffff","color":"#343a40","italic":true},"insert":"Chùa Láng – nơi tổ chức lễ hội làng đặc sắc bậc nhất Hà Nội (Ảnh: Sưu tầm)"},{"insert":"\nTừ trước đến nay, vào ngày mùng 7 tháng 3 Âm lịch hằng năm, người dân địa phương có tập quán tổ chức lễ hội Chùa Láng. Đây là ngày Tăng Khánh – tức là Thiền Sư họ Từ hóa ở C..."}]}
    `,
    cover: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=400&fit=crop",
    author: {
      name: "Nguyễn Văn A",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      bio: "Chuyên gia nghiên cứu văn hóa ẩm thực Việt Nam"
    },
    publishedAt: "2024-03-15T10:30:00Z",
    readTime: "8 phút đọc",
    views: 1250,
    likes: 89,
    comments: 23,
    heritages: [
  { "id": 1, "name": "Ẩm thực" },
  { "id": 2, "name": "Văn hóa dân gian" },
  { "id": 3, "name": "Truyền thống" }
],
    isPremium: false,
    isBookmarked: false,
    isLiked: false,
    rating: 4.8
  });

  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ContributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(article?.isSave ?? false);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getContributionDetail(Number(id));
        if (res.result) {
          setArticle(res.result);
          if (res.result?.isSave !== undefined) {
            setIsSaved(res.result.isSave);
          }
        } else {
          setError("Không tìm thấy bài viết.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  // Mock related articles
  const [relatedArticles] = useState([
    {
      id: 2,
      title: "Nghệ thuật trang trí bánh truyền thống",
      cover: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop",
      readTime: "5 phút",
      isPremium: true
    },
    {
      id: 3,
      title: "Bí quyết làm bánh chưng ngon đúng điệu",
      cover: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&h=200&fit=crop",
      readTime: "10 phút",
      isPremium: false
    },
    {
      id: 4,
      title: "Lịch sử và ý nghĩa các loại bánh dân gian",
      cover: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
      readTime: "7 phút",
      isPremium: false
    }
  ]);

  // Mock comments
  const [comments] = useState([
    {
      id: 1,
      author: "Trần Thị B",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9235dab?w=50&h=50&fit=crop&crop=face",
      content: "Bài viết rất hay và bổ ích! Cảm ơn tác giả đã chia sẻ.",
      createdAt: "2024-03-16T14:20:00Z",
      likes: 5
    },
    {
      id: 2,
      author: "Lê Văn C",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      content: "Mình cũng đang tìm hiểu về bánh dân gian, bài này giúp mình hiểu rõ hơn nhiều.",
      createdAt: "2024-03-16T09:15:00Z",
      likes: 3
    }
  ]);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // const formatTimeAgo = (dateString: any) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
  //   if (diffInHours < 24) {
  //     return `${diffInHours} giờ trước`;
  //   } else {
  //     const diffInDays = Math.floor(diffInHours / 24);
  //     return `${diffInDays} ngày trước`;
  //   }
  // };

  const handleShare = (platform: any) => {
    const url = window.location.href;
     const text = article?.title || "";
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Đã sao chép link!');
        break;
    }
    setShowShareMenu(false);
  };

  const handleUnlock = async () => {
    if (!article) return;
    try {
      const res = await unlockContribution(article.id);
      if (res.code === 200 && res.result) {
        // cập nhật lại article
        setArticle(res.result);
      } else {
        toast.error("Không mở khóa được bài viết", {
          duration: 5000,
          position: "top-right",
          style: { background: "#DC2626", color: "#fff" },
        });       
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi mở khóa", {
          duration: 5000,
          position: "top-right",
          style: { background: "#DC2626", color: "#fff" },
        });         
    }
  };

  const handleSave = async () => {
    if (!article) return;

    try {
      if (isSaved) {
        const res = await removContributionSave(article.id);
        if (res.code === 200 && res.result) {
          setIsSaved(false);        
        } else {
          toast.error("Không bỏ lưu được");
        }
      } else {
        const res = await addContributionSave(article.id);
        if (res.code === 201 && res.result) {
          setIsSaved(true);         
        } else {
          toast.error("Không lưu được");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi lưu/bỏ lưu");
    }
  };

  if (loading) return <div className="p-6">⏳ Đang tải bài viết...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!article) return null;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header với breadcrumb */}
      {/* <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <nav className="text-sm text-gray-600">
            <a href="/" className="hover:text-yellow-700">Trang chủ</a>
            <span className="mx-2">/</span>
            <a href="/articles" className="hover:text-yellow-700">Bài viết</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Chi tiết bài viết</span>
          </nav>
        </div>
      </div> */}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            
             <ContentPreview
              title={article.title}
              cover={article.mediaUrl}
              html={article.content}
              contentPreview={article.previewContent}
              heritageTags={article.contributionHeritageTags}
              publishedAt={article.publishedAt?.toString()}
              view={article.view}
              subscription={article.subscription}
              onUnlock={handleUnlock}
            />
            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Bình luận ({comments.length})
              </h3>

              {/* Comment Form */}
              <div className="mb-8">
                <textarea
                  placeholder="Viết bình luận của bạn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700/40 focus:border-yellow-700 resize-none"
                  // rows="3"
                />
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Hãy bình luận một cách lịch sự và tôn trọng
                  </span>
                  <button className="bg-gradient-to-r from-yellow-700 to-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                    Đăng bình luận
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex space-x-3">
                      <img 
                        src={comment.avatar} 
                        alt={comment.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                          {/* <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span> */}
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             <div className="mt-8">
               <HeritageContributorPosts
                posts={undefined} // có thể gọi API riêng để lấy danh sách thật
                onOpenPost={(post) => {
                  // redirect tới trang chi tiết bài viết
                  window.location.href = `/contributions/${post.id}`;
                }}
                onOpenAuthor={(author) => {
                  // chuyển tới trang tác giả
                  console.log("Mở tác giả:", author);
                }}
              />
            </div>
          </div>

          {/* Sidebar phải - Related Articles & Tools */}
          <div className="lg:col-span-1 order-1">
            <div className="sticky top-8 space-y-6">
              {/* Author Info */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={article.avatarUrl} 
                    alt={article.contributorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{article.contributorName}</h4>
                    <p className="text-xs text-gray-600">Tác giả</p>
                  </div>
                </div>
                {/* <p className="text-sm text-gray-600 mb-4">{article.author.bio}</p> */}
                {/* <button className="w-full bg-gradient-to-r from-yellow-700 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                  Theo dõi
                </button> */}
              </div>

              {/* Quick Actions */}
             <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h4>
                <div className="space-y-3">
                  {/* Lưu bài viết */}
                  <button 
                    onClick={handleSave}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSaved 
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-700'
                    }`}
                  >
                    <BookmarkPlus className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Đã lưu' : 'Lưu bài viết'}</span>
                  </button>


                  {/* Chia sẻ */}
                 <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Chia sẻ</span>
                    </button>

                    {showShareMenu && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 flex items-center justify-around w-40">
                        <button 
                          onClick={() => handleShare('facebook')} 
                          className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
                          title="Facebook"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
                          </svg>
                        </button>

                        <button 
                          onClick={() => handleShare('twitter')} 
                          className="p-2 rounded-full hover:bg-blue-50 text-sky-500"
                          title="Twitter"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.86 1.09A4.52 4.52 0 0016.11 0c-2.63 0-4.77 2.13-4.77 4.76 0 .37.04.73.12 1.07C7.69 5.67 4.07 3.75 1.64.96a4.77 4.77 0 00-.65 2.39c0 1.65.84 3.1 2.12 3.95a4.52 4.52 0 01-2.16-.6v.06c0 2.3 1.65 4.22 3.84 4.65a4.5 4.5 0 01-2.14.08c.6 1.86 2.34 3.22 4.4 3.26A9.05 9.05 0 010 19.54a12.79 12.79 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.41-.01-.61A9.18 9.18 0 0023 3z"/>
                          </svg>
                        </button>

                        <button 
                          onClick={() => handleShare('copy')} 
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                          title="Sao chép link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M10 13a5 5 0 007.54 4.54l3.36-3.36a5 5 0 00-7.07-7.07l-.88.88"/>
                            <path d="M14 11a5 5 0 00-7.54-4.54L3.1 9.82a5 5 0 007.07 7.07l.88-.88"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>


                  {/* Báo cáo */}
                  <button 
                    onClick={() => alert("Chức năng báo cáo sẽ xử lý sau 🚨")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-700 transition-all"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Báo cáo</span>
                  </button>
                </div>
              </div>


              {/* Related Articles */}
             
              {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
                <div className="space-y-4">
                  {relatedArticles.map(relatedArticle => (
                    <div key={relatedArticle.id} className="group cursor-pointer">
                      <div className="flex space-x-3">
                        <div className="relative">
                          <img 
                            src={relatedArticle.cover} 
                            alt={relatedArticle.title}
                            className="w-20 h-16 rounded-lg object-cover"
                          />
                          {relatedArticle.isPremium && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-700 to-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <Star className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors line-clamp-2 mb-2">
                            {relatedArticle.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{relatedArticle.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-6 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Xem thêm bài viết
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;