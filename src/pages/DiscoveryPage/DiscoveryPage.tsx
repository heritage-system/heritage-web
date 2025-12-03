import React, { useEffect, useState, useTransition } from "react";
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeritageGrid from "../../components/Discovery/DiscoveryHeritageGrid";
import DiscoveryQuickFilters from "../../components/Discovery/DiscoveryQuickFilters";
import DiscoveryUpcomingEvents from "../../components/Discovery/DiscoveryUpcomingEvents";
import DiscoveryViewToggle from "../../components/Discovery/DiscoveryViewToggle";
import DiscoverySearchToggle from "../../components/Discovery/DiscoverySearchToggle";
import Pagination from "../../components/Layouts/Pagination";
import { HeritageSearchRequest } from "../../types/heritage";
import { useDiscoveryFilters } from "../../hooks/useDiscoveryFilters";
import { Province } from "../../types/location";
import { Category } from "../../types/category";
import { Tag } from "../../types/tag";
import { fetchProvinces } from "../../services/locationSerivce";
import { fetchCategories } from "../../services/categoryService";
import { fetchTags } from "../../services/tagService";
import AIpredictLensPage from './AIpredictLensPageCopy';
import { Link } from "react-router-dom";
const DiscoveryPage: React.FC = () => {
  const {
    heritages,
    loading,
    filters,
    totalPages,
    totalElements,
    onFiltersChange,
    onPageChange,
    fetchHeritagesDirect,
    fetchHeritagesAi,
    heritagePredicts
  } = useDiscoveryFilters();

  const [view, setView] = useState<"grid" | "map">("grid");
  const [viewSearch, setViewSearch] = useState<"filter" | "ai">("filter");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State chuyển transition
  const [displayedHeritages, setDisplayedHeritages] = useState(heritages);
  const [isPending, startTransition] = useTransition();

  // Map mode: paged (theo phân trang) / all (tất cả)
  const [mapMode, setMapMode] = useState<"paged" | "all" | "north" | "central" | "south">("paged");
  const [allHeritagesForMap, setAllHeritagesForMap] = useState<any[]>([]);
  const [mapLoading, setMapLoading] = useState(false);


  const [provinces, setProvinces] = useState<Province[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const northProvinces = [
    "Hà Nội", "Hải Phòng", "Quảng Ninh", "Hà Nam", "Nam Định", "Thái Bình", "Ninh Bình",
    "Hà Giang", "Cao Bằng", "Lạng Sơn", "Bắc Giang", "Bắc Ninh", "Yên Bái", "Phú Thọ"
  ];

  const centralProvinces = [
    "Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế",
    "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận"
  ];

  const southProvinces = [
    "TP Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Bà Rịa – Vũng Tàu", "Long An", "Tiền Giang",
    "Bến Tre", "Trà Vinh", "Vĩnh Long", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Cà Mau", "An Giang", "Kiên Giang", "Tây Ninh"
  ];

  // Đồng bộ khi heritages thay đổi
  useEffect(() => {
    startTransition(() => setDisplayedHeritages(heritages));
    if (mapMode === "paged") setAllHeritagesForMap(heritages);
  }, [heritages, mapMode]);

  useEffect(() => {
    if (viewSearch === "ai") {
      setDisplayedHeritages(heritagePredicts);
      setAllHeritagesForMap(heritagePredicts);
    }
  }, [heritagePredicts, viewSearch]);
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
        console.error("Không thể tải provinces:", err);
      }
    };
    loadCategories();
    const loadTags = async () => {
      try {
        const res = await fetchTags();
        setTags(res.result || []);
      } catch (err) {
        console.error("Không thể tải provinces:", err);
      }
    };
    loadTags();
  }, []);
<Link
  to="/DiscoveryPage/AIPredictPage"
  className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
>
  Dùng AI để nhận diện
</Link>
  // Handle filter cho map
  const onFiltersChangeForMap = (changes: Partial<HeritageSearchRequest>) => {
    const newFilters = { ...filters, ...changes, page: 0 };
    onFiltersChange(newFilters, true);

    if (mapMode === "paged" || mapMode === "all") {
      fetchHeritagesDirect(newFilters).then((res) => setAllHeritagesForMap(res));
    } else {
      // Bắc / Trung / Nam
      let provincesToFilter: string[] = [];
      if (mapMode === "north") provincesToFilter = northProvinces;
      if (mapMode === "central") provincesToFilter = centralProvinces;
      if (mapMode === "south") provincesToFilter = southProvinces;

      fetchHeritagesDirect({ ...newFilters, locations: provincesToFilter })
        .then((res) => setAllHeritagesForMap(res));
    }
  };


  const showAllOnMap = async () => {
    setMapMode("all");
    setMapLoading(true);
    try {
      const res = await fetchHeritagesDirect({ ...filters, page: 0, pageSize: 10000 });
      setAllHeritagesForMap(res);
    } catch (err) {
      console.error("Không thể tải tất cả dữ liệu map:", err);
    } finally {
      setMapLoading(false);
    }
  };

  const backToPagedMap = () => {
    setMapMode("paged");
    setAllHeritagesForMap(displayedHeritages);
  };

  const fetchMapByRegion = async (provincesToFilter: string[]) => {
    setMapLoading(true);
    try {
      const res = await fetchHeritagesDirect({ ...filters, page: 0, pageSize: 10000, locations: provincesToFilter });
      setAllHeritagesForMap(res);
    } catch (err) {
      console.error("Không thể tải dữ liệu map khu vực:", err);
    } finally {
      setMapLoading(false);
    }
  };


  const updatedFiltersHeritages = (filters: HeritageSearchRequest) => {
  if (mapMode === "all") {
    // fetch lại toàn bộ map theo filter mới
    fetchHeritagesDirect({ ...filters, page: 0, pageSize: 10000 })
      .then((res) => setAllHeritagesForMap(res));
  }
  return mapMode === "paged" ? displayedHeritages : allHeritagesForMap;
};

  const onFilterChange = (mode: "filter" | "ai") => {
    if (mode === "filter") {
      setDisplayedHeritages(heritages);
      setAllHeritagesForMap(heritages);
    } else {
      setDisplayedHeritages(heritagePredicts);
      setAllHeritagesForMap(heritagePredicts);
    }
    setViewSearch(mode);
  };

  useEffect(() => {
    // Clear sessionStorage của ảnh khi load lại trang
    sessionStorage.removeItem("ai-lens-image"); 
    sessionStorage.removeItem("ai-lens-payload");
  }, []);

  return (
    
    <div className="min-h-screen bg-gray-50">
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
            <div className="mb-4">
              <div className="relative  mb-6">
                 <div className="absolute top-0 left-0 right-0 z-20 flex justify-end -translate-y-5">
                  <DiscoverySearchToggle view={viewSearch} onFilterChange={onFilterChange} />
                </div>    
              </div>
            {viewSearch === "ai" ? (             
                <AIpredictLensPage fetchHeritagesAi={fetchHeritagesAi}/>       
            ) : (
              <> 
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

              </>
            )}
            </div>

            <div className="flex justify-end mb-4">
              <DiscoveryViewToggle view={view} onViewChange={setView} />
            </div>

            {view === "grid" && viewSearch === "filter"  && (
              <p className="text-sm text-gray-600 mb-4">
                Tìm thấy <span className="font-medium">{totalElements}</span> di sản văn hóa
              </p>
            )}

            {/* Grid / Map */}
            {view === "grid" ? (
              <DiscoveryHeritageGrid heritages={displayedHeritages || []} loading={loading}  />
            ) : (
              <> 
              {viewSearch === "filter" &&(    
                <div className="relative mb-4 flex justify-end">
                  <select
                    value={mapMode}
                    onChange={async (e) => {
                      const mode = e.target.value as typeof mapMode;
                      setMapMode(mode);

                      if (mode === "paged") {
                        backToPagedMap();
                      } else if (mode === "all") {
                        showAllOnMap();
                      } else {
                        // Bắc / Trung / Nam
                        let provincesToFilter: string[] = [];
                        if (mode === "north") provincesToFilter = northProvinces;
                        if (mode === "central") provincesToFilter = centralProvinces;
                        if (mode === "south") provincesToFilter = southProvinces;

                        fetchMapByRegion(provincesToFilter);
                      }

                    }}
                    className="border rounded-lg px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="paged">Theo phân trang</option>                   
                    <option value="north">Theo Bắc Bộ</option>
                    <option value="central">Theo Trung Bộ</option>
                    <option value="south">Theo Nam Bộ</option>
                    <option value="all">Tất cả</option>
                  </select>
                </div>
              )}
                <DiscoveryGoogleMapsView
                  heritages={allHeritagesForMap}
                  userLocation={userLocation}
                  onFiltersChange={mapMode === "paged" ? onFiltersChangeForMap : undefined}
                  loading={mapLoading}
                            
                />
              </>
            )}

            {isPending && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Đang tải dữ liệu mới...
              </div>
            )}

            {view === "grid" && viewSearch === "filter" && totalPages > 1 && !loading && (
              <Pagination
                currentPage={filters.page ?? 1}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={filters.pageSize ?? 12}
                totalItems={totalElements}
              />
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