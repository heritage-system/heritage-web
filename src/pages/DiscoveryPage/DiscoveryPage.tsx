import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom"; // 👈 to navigate to heritage detail
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeritageGrid from "../../components/Discovery/DiscoveryHeritageGrid";
import DiscoveryQuickFilters from "../../components/Discovery/DiscoveryQuickFilters";
import DiscoveryUpcomingEvents from "../../components/Discovery/DiscoveryUpcomingEvents";
import DiscoveryViewToggle from "../../components/Discovery/DiscoveryViewToggle";
import DiscoveryAIUploader from "../../components/Discovery/DiscoveryAIUploader";

import Pagination from "../../components/Layouts/Pagination";
import { HeritageSearchRequest } from "../../types/heritage";
import { useDiscoveryFilters } from "../../hooks/useDiscoveryFilters";
import { Province } from "../../types/location";
import { Category } from "../../types/category";
import { Tag } from "../../types/tag";
import { fetchProvinces } from "../../services/locationSerivce";
import { fetchCategories } from "../../services/categoryService";
import { fetchTags } from "../../services/tagService";

// 👇 import AI types
import { PredictResponse } from "../../types/heritage";

const DiscoveryPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    heritages,
    loading,
    filters,
    totalPages,
    totalElements,
    onFiltersChange,
    onPageChange,
    fetchHeritagesDirect
  } = useDiscoveryFilters();

  const [view, setView] = useState<"grid" | "map">("grid");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State chuyển transition
  const [displayedHeritages, setDisplayedHeritages] = useState(heritages);
  const [isPending, startTransition] = useTransition();

  // Map mode: paged (theo phân trang) / all (tất cả)
  const [mapMode, setMapMode] = useState<"paged" | "all">("paged");
  const [allHeritagesForMap, setAllHeritagesForMap] = useState<any[]>([]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // 👇 New: AI mode
  const [aiResults, setAiResults] = useState<PredictResponse | null>(null);

  // Đồng bộ khi heritages thay đổi
  useEffect(() => {
    startTransition(() => setDisplayedHeritages(heritages));
    if (mapMode === "paged") setAllHeritagesForMap(heritages);
  }, [heritages, mapMode]);

  // Lấy vị trí hiện tại người dùng
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => setUserLocation(null)
    );
  }, []);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await fetchProvinces();
        setProvinces(res);
      } catch (err) {
        console.error("Không thể tải provinces:", err);
      }
    };
    loadProvinces();
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.result || []);
      } catch (err) {
        console.error("Không thể tải categories:", err);
      }
    };
    loadCategories();
    const loadTags = async () => {
      try {
        const res = await fetchTags();
        setTags(res.result || []);
      } catch (err) {
        console.error("Không thể tải tags:", err);
      }
    };
    loadTags();
  }, []);

  // Handle filter cho map
  const onFiltersChangeForMap = (changes: Partial<HeritageSearchRequest>) => {
    const newFilters = { ...filters, ...changes, page: 0 };
    onFiltersChange(newFilters, true);
    if (mapMode === "paged") {
      fetchHeritagesDirect(newFilters).then((res) => setAllHeritagesForMap(res));
    }
  };

  // Hiển thị tất cả map
  const showAllOnMap = async () => {
    setMapMode("all");
    try {
      const res = await fetchHeritagesDirect({ ...filters, page: 0, pageSize: 10000 });
      setAllHeritagesForMap(res);
    } catch (err) {
      console.error("Không thể tải tất cả dữ liệu map:", err);
    }
  };

  // Quay lại chế độ phân trang
  const backToPagedMap = () => {
    setMapMode("paged");
    setAllHeritagesForMap(displayedHeritages);
  };

  const updatedFiltersHeritages = (filters: HeritageSearchRequest) => {
    if (mapMode === "all") {
      fetchHeritagesDirect({ ...filters, page: 0, pageSize: 10000 })
        .then((res) => setAllHeritagesForMap(res));
    }
    return mapMode === "paged" ? displayedHeritages : allHeritagesForMap;
  };

  // 👇 Render AI results (name + description only)
  const renderAiResults = () => {
    if (!aiResults) return null;
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Kết quả AI</h2>
        {aiResults.matches.map((m) => (
          <div
            key={m.heritage_id}
            className="cursor-pointer border rounded-lg p-3 bg-white shadow hover:bg-gray-50 transition"
            onClick={() => navigate(`/heritage/${m.heritage_id}`)}
          >
            <h3 className="font-bold text-gray-800">{m.name ?? "Không rõ tên"}</h3>
            <p className="text-sm text-gray-600">
              {m.description ?? "Không có mô tả"}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khám phá{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              Di sản Văn hóa
            </span>{" "}
            Việt Nam
          </h1>
          <p className="text-gray-600">
            Hành trình khám phá những giá trị văn hóa truyền thống
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-1">
            <div className="mb-6">
  <DiscoveryAIUploader onResult={setAiResults} />
</div>
            {/* 👇 If AI results exist, show them instead of normal search */}
            {aiResults ? (
              renderAiResults()
            ) : (
              <>
                <div className="mb-4">
                  
                  <DiscoveryQuickFilters
                    filters={filters}
                    onFiltersChange={(changes) => {
                      const updatedFilters = {
                        ...filters,
                        ...changes,
                        page: mapMode === "all" ? filters.page : 1,
                      };
                      onFiltersChange(updatedFilters, true);
                      setAllHeritagesForMap(updatedFiltersHeritages(updatedFilters));
                    }}
                    view={view}
                    locations={provinces} 
                    categories={categories}
                    tags={tags}
                  />
                </div>

                <div className="flex justify-end mb-6">
                  <DiscoveryViewToggle view={view} onViewChange={setView} />
                </div>

                {view === "grid" && (
                  <p className="text-sm text-gray-600 mb-4">
                    Tìm thấy <span className="font-medium">{totalElements}</span> di sản văn hóa
                  </p>
                )}

                {view === "grid" ? (
                  <DiscoveryHeritageGrid heritages={displayedHeritages || []} />
                ) : (
                  <>
                    <div className="relative z-0 mb-2 flex gap-2 justify-end">
                      {mapMode === "paged" ? (
                        <button
                          onClick={showAllOnMap}
                          className="bg-white rounded-lg shadow px-4 py-2 text-sm border font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border z-[1000]">
                          Hiển thị tất cả
                        </button>
                      ) : (
                        <button
                          onClick={backToPagedMap}
                          className="bg-white rounded-lg shadow px-4 py-2 text-sm border font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 border z-[1000]"
                        >
                          Quay lại phân trang
                        </button>
                      )}
                    </div>
                    <DiscoveryGoogleMapsView
                      heritages={allHeritagesForMap}
                      userLocation={userLocation}
                      onFiltersChange={mapMode === "paged" ? onFiltersChangeForMap : undefined}
                    />
                  </>
                )}

                {isPending && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Đang tải dữ liệu mới...
                  </div>
                )}

                {view === "grid" && totalPages > 1 && (
                  <Pagination
                    currentPage={filters.page ?? 1}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    itemsPerPage={filters.pageSize ?? 12}
                    totalItems={totalElements}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-6 space-y-4">
              <DiscoveryUpcomingEvents />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
