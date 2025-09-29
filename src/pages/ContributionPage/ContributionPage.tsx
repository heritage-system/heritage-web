// ContributionSearchUI.tsx
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import ArticleCard from '../../components/Contribution/ArticleCard';
import Sidebar from '../../components/Contribution/Sidebar';
import Pagination from '../../components/Layouts/Pagination';
import SectionLoader from '../../components/Layouts/LoadingLayouts/SectionLoader';
import { 
  ContributionSearchResponse, 
  ContributionSearchRequest 
} from '../../types/contribution';
import { 
  searchContribution, 
  addContributionSave, 
  removeContributionSave,
  getTrendingContributionHeritageTag,
  getTrendingContributor
} from '../../services/contributionService';
import { ContributionHeritageTag } from "../../types/heritage";
import { TrendingContributor } from '../../types/contributor';
import toast from 'react-hot-toast';

const ContributionSearchUI: React.FC = () => {
  const [searchRequest, setSearchRequest] = useState<ContributionSearchRequest>({
    keyword: "",
    page: 1,
    pageSize: 5
  });

  const [contributions, setContributions] = useState<ContributionSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const [trending, setTrending] = useState<ContributionHeritageTag[]>([]);
  const [contributorTrending, setContributorTrending] = useState<TrendingContributor[]>([]);

  const [loadingTrendingTopics, setLoadingTrendingTopics] = useState(false);
  const [loadingContributors, setLoadingContributors] = useState(false);

  // gọi API danh sách bài viết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await searchContribution(searchRequest);
        if (res.code === 200 && res.result) {
          setContributions(res.result.items ?? []);
          setTotalItems(res.result.totalElements ?? 0);
        } else {
          setError(res.message || "Không thể tải dữ liệu");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchRequest]);

  // gọi API trending contributors
  useEffect(() => {
    const fetchTrendingContributors = async () => {
      try {
        setLoadingContributors(true);
        const res = await getTrendingContributor();
        if (res.code === 200 && res.result) {
          setContributorTrending(res.result);
        }
      } catch (err) {
        console.error("Lỗi load trending contributors", err);
      } finally {
        setLoadingContributors(false);
      }
    };

    fetchTrendingContributors();
  }, []);

  // gọi API trending topics
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setLoadingTrendingTopics(true);
        const res = await getTrendingContributionHeritageTag();
        if (res.code === 200 && res.result) {
          setTrending(res.result);
        }
      } catch (err) {
        console.error("Lỗi load trending topics", err);
      } finally {
        setLoadingTrendingTopics(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchRequest(prev => ({
      ...prev,
      keyword,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchRequest(prev => ({
      ...prev,
      page
    }));
  };

  const handleToggleSave = async (id: number, saved: boolean) => {
    try {
      if (saved) {
        const res = await removeContributionSave(id);
        if (res.code === 200 && res.result) {
          setContributions(prev =>
            prev.map(c =>
              c.id === id ? { ...c, isSave: false } : c
            )
          );
        }
      } else {
        const res = await addContributionSave(id);
        if (res.code === 201 && res.result) {
          setContributions(prev =>
            prev.map(c =>
              c.id === id ? { ...c, isSave: true } : c
            )
          );
        }
      }
    } catch (err) {
      toast.error("Lỗi toggle save");
    }
  };

  const totalPages = Math.ceil(totalItems / (searchRequest.pageSize ?? 1));

  return (
    <div className="min-h-screen bg-white">
      {/* Search bar */}
      <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Khám phá{" "}
              <span className="bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                Di sản Văn hóa
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Khám phá những bài viết hay từ cộng đồng yêu văn hóa truyền thống Việt Nam
            </p>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả hoặc chủ đề..."
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 text-lg bg-white placeholder-gray-500 transition-all duration-200 hover:border-gray-300"
                value={searchRequest.keyword}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto sm:px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* List */}
          <div className="col-span-12 lg:col-span-8">
            {loading && (
              <SectionLoader show={loading} text="Đang tải dữ liệu trang…" />
            )}

            {error && <p className="text-center text-red-500">{error}</p>}

            {contributions.length === 0 && !loading && !error && (
              <p className="text-center text-gray-500">Không có kết quả</p>
            )}

            {!loading && <div className="space-y-8">
              {contributions.map((c, i) => (
                <ArticleCard
                  key={c.id}
                  contribution={c}
                  isLast={i === contributions.length - 1}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>}

            {totalPages > 1 && !loading && (
              <div className="mt-8">
                <Pagination
                  currentPage={searchRequest.page ?? 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={searchRequest.pageSize ?? 5}
                  totalItems={totalItems}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar
            contributors={contributorTrending}
            contributionTags={trending}
            loadingContributors={loadingContributors}
            loadingTrending={loadingTrendingTopics}
          />
        </div>
      </main>
    </div>
  );
};

export default ContributionSearchUI;
