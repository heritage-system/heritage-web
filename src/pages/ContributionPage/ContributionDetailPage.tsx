import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ContributionContent from "../../components/ContributionDetail/ContributionContent";
import { getContributionDetail, unlockContribution, addContributionSave, removeContributionSave, getContributionRelated } from "../../services/contributionService";
import { ContributionResponse } from "../../types/contribution";
import { HeritageContributorPosts } from "../../components/HeritageDetail/HeritageContributorPosts";
import ContributionDetailSidebar from "../../components/ContributionDetail/ContributionDetailSideBar";
import ContributionComments from "../../components/ContributionDetail/ContributionComments";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
import toast from 'react-hot-toast';
import {ContributionSearchResponse} from "../../types/contribution";

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ContributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const [relatedPosts, setRelatedPosts] = useState<ContributionSearchResponse[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);  
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

  useEffect(() => {
    const fetchRelated = async () => {
      if (!article) return;

      try {
        //setLoadingRelated(true);
        const res = await getContributionRelated({
          keyword: article.title,
          contributionId: article.id,
          contributorIds: [article.contributorId],
          tagHeritageIds: article.contributionHeritageTags.map((t) => t.id),      
          quantity: 6,
        });

        if (res.code === 200 && res.result) {
          setRelatedPosts(res.result);
        }
      } catch (err) {
        console.error("Lỗi load bài viết liên quan:", err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [article]);


  const handleUnlock = async () => {
    if (!article) return;
    try {
      const res = await unlockContribution(article.id);
      if (res.code === 200 && res.result) {
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
        const res = await removeContributionSave(article.id);
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center pb-60">
        <div className="text-center">
          <div className="mb-4">
            <Spinner size={40} thickness={5}/>
          </div>
          <div className="text-xl font-semibold text-gray-700">Đang tải thông tin...</div>
          <div className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }
  if (error) return (
    
 <div className="flex items-center justify-center h-screen -mt-10"> 
    <div className="p-6 text-red-600">{error}</div>
 </div>

);
  if (!article) return null;

  return (
    <div className="min-h-screen bg-gray-50">    
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <ContributionContent
              contributionId={article.id}
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
            <ContributionComments
              contributionId={Number(id)}
            />

            {/* Related Posts */}
            <div className="mt-8">
              <HeritageContributorPosts
                posts={relatedPosts}
                onOpenPost={(post) => {
                  window.location.href = `/contributions/${post.id}`;
                }}         
                loading={loadingRelated}   
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1">
            <ContributionDetailSidebar
              author={{
                avatarUrl: article.avatarUrl,
                contributorName: article.contributorName
              }}
              isSaved={isSaved}
              onSave={handleSave}
              contributionId={article.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;