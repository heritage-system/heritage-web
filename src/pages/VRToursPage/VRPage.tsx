import VRToursHero from "../../components/VRTours/VRToursHero";
import VRToursFilter from "../../components/VRTours/VRToursFilter";
import VRTourCard from "../../components/VRTours/VRTourCard";
import VRFeaturesSection from "../../components/VRTours/VRFeaturesSection";
import { useState,useEffect } from "react";
import VRTourPopup from "../../components/VRTours/VRTourPopup";
import { PanoramaTourSearchResponse,PanoramaTourSearchRequest, PanoramaTourDetailResponse } from "../../types/panoramaTour";
import { searchPanoramaTour, getPanoramaTourDetail, unlockPanoramaScene } from "../../services/panoramaTourService";
import VRTourCardSkeleton from "../../components/VRTours/VRTourCardSkeleton";
import { fetchCategories } from "../../services/categoryService";
import { Category } from "../../types/category";
import Pagination from '../../components/Layouts/Pagination';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import {PointHistoriesReason} from "../../types/enum";
import { tradePointToUnlockScene } from "../../services/userPointService";
import TheasysViewer from "../../components/VRTours/TheasysViewer";
const VRToursPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [tours, setTours] = useState<PanoramaTourSearchResponse[]>([]); 
  const [loading, setLoading] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [filters, setFilters] = useState<PanoramaTourSearchRequest>({
    keyword: "",
    categoryIds: [],
    page: 1,
    pageSize: 12,
  });
  const [selectedTour, setSelectedTour] = useState<PanoramaTourDetailResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] =  useState(0);
  const { isLoggedIn, logout: authLogout, userName, avatarUrl } = useAuth();
  useEffect(() => {     
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.result || []);
      } catch (err) {
        console.error("Không thể tải provinces:", err);
      }
    };
      loadCategories();     
  }, []);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await searchPanoramaTour({
          keyword: filters.keyword || "",
          categoryIds: filters.categoryIds || [],
          page: filters.page,
          pageSize: filters.pageSize,
        });

        if (res.code === 200) {
          setTours(res.result!.items);
          setTotalItems(res.result!.totalElements)
          setTotalPages(res.result!.totalPages)
        } 
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [filters]);

  const handleStartTour = async (tourId: number) => {
    const res = await getPanoramaTourDetail(tourId);

    if (res.code === 200 && res.result) {
      setSelectedTour(res.result);
      setIsPopupOpen(true);
    }
  };

  const handleUnlock = async (sceneId: number) => {
    if (!sceneId || !selectedTour) return;
    setUnlockLoading(true);
    try {
      const res = await unlockPanoramaScene(sceneId);

      if (res.code === 201 && res.result) {
    
        setSelectedTour(prev => {
          if (!prev) return prev;

          const updatedScenes = prev.scenes.map(scene =>
            scene.id === sceneId
              ? { ...scene, panoramaUrl: res.result!.panoramaUrl } 
              : scene
          );

          // 2. Update subscription.used (nếu có)
          let updatedSubscription = prev.subscription;

          if (updatedSubscription) {
            updatedSubscription = {
              ...updatedSubscription,
              used: updatedSubscription.used + 1,
            };
          }

          return {
            ...prev,
            scenes: updatedScenes,
            subscription: updatedSubscription
          };
        });

        // 3. Thông báo thành công
        toast.success("Mở khóa thành công!");

      } else {
        toast.error("Không mở khóa được nội dung", {
          duration: 5000,
          position: "top-right",
        });
      }

    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi mở khóa");
    } finally {
      setUnlockLoading(false);
    }
  };

  const onUnlockWithPoints = async (sceneId: number) => {
    if (!sceneId || !selectedTour) return;
    setUnlockLoading(true);
    try {

      const payload = {
        changeAmount: 60,
        reason: PointHistoriesReason.UNLOCK_SCENE,      
        referenceId: sceneId
      };
      const res = await tradePointToUnlockScene(payload);

      if (res.code === 201 && res.result) {
    
        setSelectedTour(prev => {
          if (!prev) return prev;

          const updatedScenes = prev.scenes.map(scene =>
            scene.id === sceneId
              ? { ...scene, panoramaUrl: res.result!.panoramaUrl } 
              : scene
          );

          // 2. Update subscription.used (nếu có)
          let updatedSubscription = prev.subscription;

          if (updatedSubscription) {
            updatedSubscription = {
              ...updatedSubscription,
              used: updatedSubscription.used + 1,
            };
          }

          return {
            ...prev,
            scenes: updatedScenes,
            subscription: updatedSubscription
          };
        });

        // 3. Thông báo thành công
        toast.success("Mở khóa thành công!");

      } else {
        toast.error("Không mở khóa được nội dung", {
          duration: 5000,
          position: "top-right",
        });
      }

    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra khi mở khóa");
    } finally {
      setUnlockLoading(false);
    }
  };


  

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTour(null);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      
      <VRToursHero onStartTour={handleOpenPopup} />
      <VRToursFilter
        categories={categories}
        onFilterChange={(partial) =>
          setFilters((prev) => ({
            ...prev,
            ...partial,
            page: 1 // reset trang khi search/filter
          }))
        }
      />

      <div className="max-w-7xl mx-auto px-4 my-8">
        
        {loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <VRTourCardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {tours.map((tour) => (
      <VRTourCard
        key={tour.id}
        tour={tour}
        onStartTour={handleStartTour}
      />
    ))}
  </div>
)}

      {totalPages > 1 && !loading && (
        <div className="mt-8">
          <Pagination
            currentPage={filters.page ?? 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={filters.pageSize ?? 5}
            totalItems={totalItems}
          />
        </div>
      )}
      </div>  

      
      <>
 
{/* <TheasysViewer
    embedId="9U5sTljkNoN9M0t3KiTPzLaGnIQRiS"
    open={isPopupOpen}
    height={window.innerHeight * 0.85}
  /> */}
  {isPopupOpen && selectedTour && (
    <VRTourPopup
      tour={selectedTour}
      onClose={handleClosePopup}
      onHandleUnlock={handleUnlock}
      unlockLoading={unlockLoading}
      onUnlockWithPoints={onUnlockWithPoints}
      isAuthenticated={isLoggedIn}
    />
  )}

   
</>

{/* 
        <iframe
  src="https://www.theasys.io/viewer/KEMqGSMOpDkL2ixdx8zWrAqTSPNAHz"
  allowFullScreen
  frameBorder="0"
  scrolling="no"
  allow="vr; gyroscope; accelerometer"
  style={{
    width: "100%",
    height: "100vh",   // full màn hình
    display: "block",
  }}
/> */}
    </div>
  );
};

export default VRToursPage;