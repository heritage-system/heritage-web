import React, { useEffect, useMemo, useState, } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { HeritageDetailResponse,HeritageSearchRequest, HeritageDescription, HeritageRelatedRequest,HeritageRelatedResponse } from "../../types/heritage";
import { getHeritageDetail } from "../../services/heritageService";
import { getContributionRelated } from "../../services/contributionService";
// Import các components con
import { HeritageHero } from "../../components/HeritageDetail/HeritageHero";
import { HeritageContentTabs } from "../../components/HeritageDetail/HeritageContentTabs";
import { HeritageMediaGallery } from "../../components/HeritageDetail/HeritageMediaGallery";
import { HeritageFAQ } from "../../components/HeritageDetail/HeritageFAQ";
import { HeritageReviews } from "../../components/HeritageDetail/HeritageReviews";
import { HeritageRelated } from "../../components/HeritageDetail/HeritageRelated";
import { HeritageSidebar } from "../../components/HeritageDetail/HeritageSidebar";
import { HeritageContributorPosts } from "../../components/HeritageDetail/HeritageContributorPosts";
import { getHeritageRelated } from "../../services/heritageService";
import {ContributionSearchResponse} from "../../types/contribution";
import Spinner from "../../components/Layouts/LoadingLayouts/Spinner";
const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [heritage, setHeritage] = useState<HeritageDetailResponse | null>(null);
  const [content, setContent] = useState<HeritageDescription | null>(null);

  const [tab, setTab] = useState<"History" | "Rituals" | "Values" | "Preservation">("History");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // NEW: related
  const [related, setRelated] = useState<HeritageRelatedResponse[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [relatedPosts, setRelatedPosts] = useState<ContributionSearchResponse[]>([]);
  const [loadingPostRelated, setLoadingPostRelated] = useState(false);  
  useEffect(() => {
    if (!id) return;
    getHeritageDetail(Number(id))
      .then((response) => {
        if (response.result) {
          setHeritage(response.result);
          try {
            const parsed = JSON.parse(response.result.content);
            setContent(parsed);
          } catch {
            setContent(null);
          }
        } else {
          setHeritage(null);
          setContent(null);
        }
      })
      .catch((err) => console.error("Error fetching heritage detail:", err));
  }, [id]);

  // NEW: fetch related khi đã có heritage
  useEffect(() => {
    const run = async () => {
      if (!heritage) return;
      setLoadingRelated(true);
      const req: HeritageRelatedRequest = {
        keyword: heritage.name,
        categoryIds: heritage.categoryIds,
        tagIds: (heritage.heritageTagIds && heritage.heritageTagIds.length) ? heritage.heritageTagIds : undefined,
        heritageId: heritage.id
      };

      try {
        const res = await getHeritageRelated(req);
        
        if(res.code === 200 && res.result){
          setRelated(res.result);
        }   
      } catch (e) {
        console.error("fetch related error:", e);
        setRelated([]);
      } finally {
        setLoadingRelated(false);
      }
    };
    run();
  }, [heritage]);

  useEffect(() => {
      const fetchRelated = async () => {
        if (!heritage) return;
  
        try {
          setLoadingPostRelated(true);
          const res = await getContributionRelated({          
            tagHeritageIds: [heritage.id],         
            quantity: 6,
          });
  
          if (res.code === 200 && res.result) {
            setRelatedPosts(res.result);
          }
        } catch (err) {
          console.error("Lỗi load bài viết liên quan:", err);
        } finally {
          setLoadingPostRelated(false);
        }
      };
  
      fetchRelated();
    }, [heritage]);

  const heroImage = useMemo(
    () => heritage?.media?.find((m) => m.mediaTypeName?.toLowerCase() === "image")?.url,
    [heritage?.media]
  );

  const images = useMemo(
    () => heritage?.media?.filter((m) => m.mediaTypeName?.toLowerCase() === "image") || [],
    [heritage?.media]
  );

  const videos = useMemo(
    () => heritage?.media?.filter((m) => m.mediaTypeName?.toLowerCase() === "video") || [],
    [heritage?.media]
  );

  const handleLike = () => setLiked(!liked);
  const handleBookmark = () => setBookmarked(!bookmarked);

  if (!heritage) {
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


  return (
    <div className="min-h-screen bg-gray-50">
      <HeritageHero
        heritage={heritage}
        liked={liked}
        bookmarked={bookmarked}
        heroImage={heroImage}
        onLike={handleLike}
        onBookmark={handleBookmark}  
      />
{/* <HeritageEditor/> */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HeritageContentTabs
            activeTab={tab}
            onTabChange={setTab}
            content={content}
          />

          <HeritageMediaGallery images={images} videos={videos} heritageName={heritage.name} />

          <HeritageReviews heritageId={heritage.id} />


          
          {/* Related Heritage */}
          {loadingRelated ? (
            <div className="text-sm text-gray-500">Đang gợi ý di sản liên quan…</div>
          ) : (
            <HeritageRelated
              relatedHeritages={related}
              onClickItem={(h) => nav(`/heritagedetail/${h.id}`)}
            />
          )}

          <HeritageContributorPosts  
            posts={relatedPosts}
            onOpenPost={(post) => {
              window.location.href = `/contributions/${post.id}`;
            }}         
            loading={loadingRelated}   />

        </div>

        <HeritageSidebar
          heritage={heritage}
          liked={liked}
          bookmarked={bookmarked}
          onLike={handleLike}
          onBookmark={handleBookmark}
        />
      </div>
    </div>
  );
};

export default HeritageDetailPage;