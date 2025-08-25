import React, { useEffect, useState } from "react";
import DiscoveryGoogleMapsView from "../../components/Discovery/DiscoveryGoogleMapsView";
import DiscoveryHeritageGrid from "../../components/Discovery/DiscoveryHeritageGrid";
import DiscoveryQuickFilters from "../../components/Discovery/DiscoveryQuickFilters";
import DiscoveryUpcomingEvents from "../../components/Discovery/DiscoveryUpcomingEvents";
import DiscoveryViewToggle from "../../components/Discovery/DiscoveryViewToggle";
import { Heritage, HeritageSearchResponse } from "../../types/heritage";
import { HeritageLocationResponse } from "../../types/heritageLocation";
import { getHeritages } from "../../services/heritageLocationService";
import { useDiscoveryFilters } from "../../hooks/useDiscoveryFilters";

const DiscoveryPage: React.FC = () => {
  const {
    heritages,
    loading,
    error,
    filters,
    totalElements,
    onFiltersChange,
    onPageChange,
  } = useDiscoveryFilters();

  const [view, setView] = useState<"grid" | "map">("grid");
  const [mapHeritages, setMapHeritages] = useState<HeritageLocationResponse[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // ✅ Lấy map data khi chuyển sang Map view
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setMapLoading(true);
        setMapError(null);

        const response = await getHeritages();
        if (!response) throw new Error("No response received from API");
        if (response.code !== 200) throw new Error(`API error: ${response.message}`);
        console.log("aaaaa" + response);
        setMapHeritages(response.result ?? []);
      } catch (error) {
        setMapError(error instanceof Error ? error.message : "Unknown error occurred");
        setMapHeritages([]);
      } finally {
        setMapLoading(false);
      }
    };

    if (view === "map") {
      fetchMapData();
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khám phá{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              Di sản Văn hóa
            </span>{" "}
            Việt Nam
          </h1>
          <p className="text-gray-600">Hành trình khám phá những giá trị văn hóa truyền thống</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-1">       
            <div className="mb-4">
              <DiscoveryQuickFilters
                filters={filters}
                onFiltersChange={(changes) => onFiltersChange(changes, true)}
              />
            </div>

            {/* View Toggle nằm dưới, bên phải */}
            <div className="flex justify-end mb-6">
              <DiscoveryViewToggle view={view} onViewChange={setView} />
            </div>

            {/* Heritage Count */}
            <p className="text-sm text-gray-600 mb-4">
              Tìm thấy{" "}
              <span className="font-medium">
                {view === "map" ? mapHeritages.length : totalElements}
              </span>{" "}
              di sản văn hóa
            </p>

            {/* Error UI */}
            {mapError && view === "map" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-red-400 mr-2">⚠️</div>
                  <div>
                    <h4 className="text-red-800 font-medium">Lỗi tải dữ liệu</h4>
                    <p className="text-red-600 text-sm">{mapError}</p>
                    <button
                      onClick={() => {
                        setMapError(null);
                        setView("grid");
                        setTimeout(() => setView("map"), 100);
                      }}
                      className="text-red-700 underline text-sm mt-1 hover:text-red-800"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid / Map */}
            {view === "grid" ? (
              loading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-700"></div>
                </div>
              ) : (
               <DiscoveryHeritageGrid heritages={heritages || []} />
              )
            ) : mapLoading ? (
              <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-700 mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu bản đồ...</p>
              </div>
            ) : (
              <DiscoveryGoogleMapsView heritages={mapHeritages} />
            )}

            {/* Pagination */}
            {view === "grid" && totalElements > (filters.page ?? 1) * (filters.pageSize ?? 10) && (
              <div className="text-center mt-8">
                <button
                  className="bg-gradient-to-r from-yellow-700 to-red-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={() => onPageChange((filters.page ?? 1) + 1)}
                >
                  Xem thêm di sản
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-6 space-y-4">
              <DiscoveryUpcomingEvents />
              <div className="bg-gradient-to-r from-yellow-100 to-red-100 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-yellow-700">500+</div>
                    <div className="text-xs text-gray-600">Di sản</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-700">50+</div>
                    <div className="text-xs text-gray-600">VR Tours</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">10K+</div>
                    <div className="text-xs text-gray-600">Người dùng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-700">98%</div>
                    <div className="text-xs text-gray-600">Hài lòng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoveryPage;
