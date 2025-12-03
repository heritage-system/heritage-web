import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import Pagination from "../../Layouts/Pagination";
import { getEventRegistrations } from "../../../services/eventService";
import { EventRegistrationUserResponse } from "../../../types/event";

interface ParticipantManagerProps {
  eventId?: number;
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return d.toLocaleString("vi-VN");
};

const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  eventId,
}) => {
  const [items, setItems] = useState<EventRegistrationUserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setErr(null);
    try {
      const res = await getEventRegistrations(eventId);
      if (res.code === 200 && res.result) {
        // sort theo thời gian đăng ký
        const sorted = [...res.result].sort(
          (a, b) =>
            new Date(a.registeredAt).getTime() -
            new Date(b.registeredAt).getTime()
        );
        setItems(sorted);
      } else {
        setErr(res.message || "Không tải được danh sách đăng ký.");
      }
    } catch (e) {
      console.error(e);
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      setItems([]);
      setCurrentPage(1);
      load();
    }
  }, [eventId, load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((r) => {
      const name = (r.userName || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      const idStr = String(r.userId);
      return (
        name.includes(kw) ||
        email.includes(kw) ||
        idStr.includes(kw)
      );
    });
  }, [items, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage, itemsPerPage]);

  if (!eventId) {
    return (
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Người đăng ký sự kiện
        </h3>
        <p className="text-sm text-slate-500">
          Hãy chọn hoặc lưu sự kiện trước, sau đó danh sách đăng ký
          sẽ hiển thị ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Người đăng ký sự kiện ({items.length})
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, ID..."
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm w-64"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-slate-100 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-500">
                #
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">
                User ID
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">
                Tên
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">
                Email
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">
                Thời gian đăng ký
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-slate-500"
                >
                  Đang tải...
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-slate-500"
                >
                  Chưa có ai đăng ký.
                </td>
              </tr>
            ) : (
              paged.map((r, idx) => (
                <tr key={`${r.eventId}-${r.userId}-${idx}`}>
                  <td className="px-4 py-2 text-slate-700">
                    {(safePage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.userId}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.userName}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {r.email}
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {formatDateTime(r.registeredAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filtered.length}
        />
      </div>
    </div>
  );
};

export default ParticipantManager;
