import React, { useEffect, useMemo, useState, } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { HeritageSearchResponse,HeritageSearchRequest, HeritageDescription } from "../../types/heritage";
import { getHeritageDetail } from "../../services/heritageService";
import HeritageEditor from "./arcticleinput-Quill";
// Import các components con
import { HeritageHero } from "../../components/HeritageDetail/HeritageHero";
import { HeritageContentTabs } from "../../components/HeritageDetail/HeritageContentTabs";
import { HeritageMediaGallery } from "../../components/HeritageDetail/HeritageMediaGallery";
import { HeritageFAQ } from "../../components/HeritageDetail/HeritageFAQ";
import { HeritageReviews } from "../../components/HeritageDetail/HeritageReviews";
import { HeritageRelated } from "../../components/HeritageDetail/HeritageRelated";
import { HeritageSidebar } from "../../components/HeritageDetail/HeritageSidebar";
import { HeritageContributorPosts } from "../../components/HeritageDetail/HeritageContributorPosts";
import { searchHeritage } from "../../services/heritageService";

const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [heritage, setHeritage] = useState<HeritageSearchResponse | null>(null);
  const [description, setDescription] = useState<HeritageDescription | null>(null);

  const [tab, setTab] = useState<"history" | "rituals" | "values" | "preservation">("history");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // NEW: related
  const [related, setRelated] = useState<HeritageSearchResponse[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!id) return;
    getHeritageDetail(Number(id))
      .then((response) => {
        if (response.result) {
          setHeritage(response.result);
          try {
            const parsed = JSON.parse(response.result.description);
            setDescription(parsed);
          } catch {
            setDescription(null);
          }
        } else {
          setHeritage(null);
          setDescription(null);
        }
      })
      .catch((err) => console.error("Error fetching heritage detail:", err));
  }, [id]);

  // NEW: fetch related khi đã có heritage
  useEffect(() => {
    const run = async () => {
      if (!heritage) return;
      setLoadingRelated(true);
      const req: HeritageSearchRequest = {
       
        categoryIds: heritage.categoryIds ? [heritage.categoryIds] : undefined,
        tagIds: (heritage.heritageTagIds && heritage.heritageTagIds.length) ? heritage.heritageTagIds : undefined,
      
      };

      try {
        const res = await searchHeritage(req);
        const items = res?.result?.items || [];

        // loại chính nó + tránh trùng
        const filtered = items
          .filter((h) => h.id !== heritage.id)
          .filter((h, idx, arr) => arr.findIndex(x => x.id === h.id) === idx);

        setRelated(filtered);
      } catch (e) {
        console.error("fetch related error:", e);
        setRelated([]);
      } finally {
        setLoadingRelated(false);
      }
    };
    run();
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
      <div className="flex items-center justify-center h-screen text-gray-600">
        Đang tải thông tin di sản...
      </div>
    );
  }

  const quickIntro = description?.history?.[0]?.content;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeritageHero
        heritage={heritage}
        liked={liked}
        bookmarked={bookmarked}
        heroImage={heroImage}
        onLike={handleLike}
        onBookmark={handleBookmark}
        quickIntro={quickIntro}
      />
{/* <HeritageEditor/> */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HeritageContentTabs
            activeTab={tab}
            onTabChange={setTab}
            description={description}
          />

          <HeritageMediaGallery images={images} videos={videos} heritageName={heritage.name} />

          <HeritageReviews />
          <HeritageContributorPosts/>

          {/* Related Heritage */}
          {loadingRelated ? (
            <div className="text-sm text-gray-500">Đang gợi ý di sản liên quan…</div>
          ) : (
            <HeritageRelated
              relatedHeritages={related}
              onClickItem={(h) => nav(`/heritagedetail/${h.id}`)}
            />
          )}
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