import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../../components/Layouts/Header';
import ArticleCard from '../../components/Contribution/ArticleCard';
import Sidebar from '../../components/Contribution/Sidebar';
import { ContributionSearchResponse, SearchRequest } from '../../types/contribution';


// Sample data
const sampleContributions: ContributionSearchResponse[] = [
  {
    id: 1,
    contributorId: 101,
    contributorName: "Nguyễn Văn An",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    firstText: "Trong quá trình phát triển website thương mại điện tử, tôi đã học được rất nhiều điều về UX/UI design và cách tối ưu hóa trải nghiệm người dùng. Dự án này không chỉ đơn thuần là một trang web bán hàng mà còn là một hệ sinh thái hoàn chỉnh...",
    title: "Xây dựng Website E-commerce: Từ ý tưởng đến thực tế",
    mediaUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    price: 5000000,
    contributorNameUnsigned: "nguyen van an",
    titleUnsigned: "website e-commerce",
    postedAt: new Date("2024-08-15T10:30:00"),
    readTime: "5 phút đọc",
    tags: ["Web Development", "E-commerce", "UX/UI"],
    claps: 142,
    comments: 23
  },
  {
    id: 2,
    contributorId: 102,
    contributorName: "Trần Thị Bình",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    firstText: "Mobile app development đã trở thành xu hướng không thể thiếu trong thời đại số. Qua dự án phát triển ứng dụng cho startup, tôi muốn chia sẻ những kinh nghiệm quý báu về React Native, từ việc setup môi trường development đến optimization performance...",
    title: "React Native cho Startup: Kinh nghiệm từ dự án thực tế",
    mediaUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    price: 8500000,
    contributorNameUnsigned: "tran thi binh",
    titleUnsigned: "mobile app development",
    postedAt: new Date("2024-08-20T14:15:00"),
    readTime: "8 phút đọc",
    tags: ["React Native", "Mobile Dev", "Startup"],
    claps: 256,
    comments: 45
  },
  {
    id: 3,
    contributorId: 103,
    contributorName: "Lê Minh Cường",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    firstText: "Artificial Intelligence không còn là khái niệm xa vời trong thế kỷ 21. Dự án nghiên cứu AI mà tôi tham gia đã mở ra những hiểu biết sâu sắc về machine learning, deep learning và ứng dụng thực tế trong business. Từ data preprocessing đến model deployment...",
    title: "AI trong thực tế: Hành trình từ research đến production",
    mediaUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    price: 12000000,
    contributorNameUnsigned: "le minh cuong",
    titleUnsigned: "ai research project",
    postedAt: new Date("2024-09-01T09:00:00"),
    readTime: "12 phút đọc",
    tags: ["AI", "Machine Learning", "Research"],
    claps: 389,
    comments: 67
  },
  {
    id: 4,
    contributorId: 104,
    contributorName: "Phạm Thu Hương",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    firstText: "Design System là xương sống của mọi sản phẩm digital hiện đại. Trong dự án xây dựng design system cho một fintech startup, chúng tôi đã phải đối mặt với nhiều thách thức về consistency, scalability và maintainability...",
    title: "Xây dựng Design System: Lessons learned từ Fintech",
    mediaUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop",
    price: 7200000,
    contributorNameUnsigned: "pham thu huong",
    titleUnsigned: "design system fintech",
    postedAt: new Date("2024-08-25T16:20:00"),
    readTime: "6 phút đọc",
    tags: ["Design System", "Fintech", "UI/UX"],
    claps: 178,
    comments: 31
  }
];

// Utility functions
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  }
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const filterContributions = (
  contributions: ContributionSearchResponse[], 
  keyword: string
): ContributionSearchResponse[] => {
  if (!keyword.trim()) {
    return contributions;
  }

  return contributions.filter(contribution =>
    contribution.title.toLowerCase().includes(keyword.toLowerCase()) ||
    contribution.contributorName.toLowerCase().includes(keyword.toLowerCase()) ||
    contribution.firstText.toLowerCase().includes(keyword.toLowerCase()) ||
    contribution.tags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
  );
};

// Main Component
const ContributionSearchUI: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchRequest, setSearchRequest] = useState<SearchRequest>({
    keyword: "",
    categoryIds: [],
    tagIds: [],
    sortBy: "PostedAt",
    page: 1,
    pageSize: 10
  });

  const [filteredContributions, setFilteredContributions] = useState<ContributionSearchResponse[]>(sampleContributions);
  const [followingAuthors, setFollowingAuthors] = useState<number[]>([]);

  const handleSearch = (keyword: string) => {
    setSearchRequest(prev => ({ ...prev, keyword, page: 1 }));
    
    const filtered = filterContributions(sampleContributions, keyword);
    setFilteredContributions(filtered);
  };

  const toggleFollow = (contributorId: number) => {
    setFollowingAuthors(prev => 
      prev.includes(contributorId) 
        ? prev.filter(id => id !== contributorId)
        : [...prev, contributorId]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Page Header + Search Bar */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 py-20 mt-16 px-6 py-12 md:py-16 text-center rounded-lg shadow-md  mt-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Khám phá{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
            Di sản Văn hóa
          </span>{" "}
          Việt Nam
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base mb-6">
          Khám phá những bài viết hay từ cộng đồng yêu văn hóa truyền thống
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, tác giả hoặc chủ đề..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg bg-white bg-opacity-90 placeholder-gray-500 shadow-sm"
              value={searchRequest.keyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Articles List */}
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-8">
              {filteredContributions.map((contribution, index) => (
                <ArticleCard
                  key={contribution.id}
                  contribution={contribution}
                  isFollowing={followingAuthors.includes(contribution.contributorId)}
                  onToggleFollow={toggleFollow}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  isLast={index === filteredContributions.length - 1}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-12 text-center">
              <button className="text-green-600 hover:text-green-700 font-medium">
                Xem thêm bài viết
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar
            contributions={sampleContributions}
            followingAuthors={followingAuthors}
            onToggleFollow={toggleFollow}
          />
        </div>
      </main>
    </div>
  );
};

export default ContributionSearchUI;