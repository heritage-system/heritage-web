import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchHeritageDetail } from "../../services/heritageService";
import { HeritageDetail } from "../../types/heritage";
import HeritageAdminPanel from "../../pages/AdminPage/AdminPage";

const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [heritage, setHeritage] = useState<HeritageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadHeritage = async () => {
      try {
        const data = await fetchHeritageDetail(Number(id));
        setHeritage(data);
      } catch (error) {
        console.error("Error loading heritage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeritage();
  }, [id]);

  if (loading)
    return (
      <HeritageAdminPanel>
        <p>Đang tải chi tiết...</p>
      </HeritageAdminPanel>
    );
  if (!heritage)
    return (
      <HeritageAdminPanel>
        <p>Không tìm thấy di sản.</p>
      </HeritageAdminPanel>
    );

  return (
    <HeritageAdminPanel>
      
      <h1 className="text-2xl font-bold mb-4">{heritage.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="mb-2"><b>ID:</b> {heritage.id}</div>
          <div className="mb-2"><b>Danh mục:</b> {heritage.categoryName} (ID: {heritage.categoryId})</div>
          <div className="mb-2"><b>Nổi bật:</b> {heritage.isFeatured ? "Có" : "Không"}</div>
          <div className="mb-2"><b>Ngày tạo:</b> {new Date(heritage.createdAt).toLocaleString()}</div>
          <div className="mb-2"><b>Ngày cập nhật:</b> {new Date(heritage.updatedAt).toLocaleString()}</div>
          <div className="mb-2"><b>URL bản đồ:</b> <a href={heritage.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{heritage.mapUrl}</a></div>
        </div>
        <div>
          <div className="mb-2"><b>Mô tả:</b> {heritage.description || <span className="italic text-gray-400">Chưa có mô tả</span>}</div>
          <div className="mb-2">
            <b>Tags:</b>{" "}
            {heritage.tags && heritage.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {heritage.tags.map((t) => (
                  <span
                    key={t.id}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="italic text-gray-400">Không có tag</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Hình ảnh:</h3>
        {heritage.media && heritage.media.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {heritage.media.map((m) => (
              <div key={m.id} className="flex flex-col items-center">
                <img
                  src={m.url}
                  alt="Heritage"
                  style={{ width: "220px", height: "auto", borderRadius: "8px" }}
                />
                <div className="text-xs text-gray-500 mt-1">{m.mediaType}</div>
              </div>
            ))}
          </div>
        ) : (
          <span className="italic text-gray-400">Không có hình ảnh</span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Địa chỉ:</h3>
        {heritage.locations && heritage.locations.length > 0 ? (
          <ul className="list-disc ml-5">
            {heritage.locations.map((loc, idx) => (
              <li key={idx} className="mb-2">
                {loc.addressDetail}, {loc.ward}, {loc.district}, {loc.province} <br />
                <span className="text-xs text-gray-500">
                  Lat: {loc.latitude}, Lng: {loc.longitude}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="italic text-gray-400">Không có địa chỉ</span>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Thời gian diễn ra:</h3>
        {heritage.occurrences && heritage.occurrences.length > 0 ? (
          <ul className="list-disc ml-5">
            {heritage.occurrences.map((o) => (
              <li key={o.id} className="mb-2">
                <b>{o.description}</b> <br />
                Loại: {o.occurrenceType}, Lịch: {o.calendarType}, Tần suất: {o.frequency} <br />
                {o.startDay}/{o.startMonth} - {o.endDay}/{o.endMonth}
              </li>
            ))}
          </ul>
        ) : (
          <span className="italic text-gray-400">Không có thông tin</span>
        )}
      </div>
    </HeritageAdminPanel>
  );
};

export default HeritageDetailPage;