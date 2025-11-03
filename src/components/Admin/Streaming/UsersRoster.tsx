import React from "react";
import { useStreaming } from "./StreamingContext";
import type { RoomRole } from "../../../types/streaming";
import { ArrowRightLeft, Shield, UserMinus } from "lucide-react";

const roleOptions: RoomRole[] = ["Host", "CoHost", "Speaker", "Audience"];

const Badge: React.FC<{ role: RoomRole }> = ({ role }) => {
  const color =
    role === "Host" ? "bg-red-100 text-red-700" :
    role === "CoHost" ? "bg-purple-100 text-purple-700" :
    role === "Speaker" ? "bg-amber-100 text-amber-700" :
    "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {role}
    </span>
  );
};

const UsersRoster: React.FC = () => {
  const { roster, isHost, setRole, reject, refreshRoster } = useStreaming();

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">Người trong phòng</div>
        <button
          onClick={refreshRoster}
          className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
          title="Làm mới danh sách"
        >
          Làm mới
        </button>
      </div>

      <ul className="space-y-2">
        {roster.map((u) => (
          <li key={`${u.uid}-${u.userId}`} className="rounded border p-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  UID: {String(u.uid)} {u.isSelf ? "(bạn)" : ""}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">UserId: {u.userId}</div>
              </div>

              <div className="flex items-center gap-2">
                <Badge role={u.role} />
                {/* Chỉ Host/CoHost mới thấy điều khiển; không hiện thao tác cho chính mình */}
                {isHost && !u.isSelf && (
                  <div className="flex items-center gap-2">
                    {/* Đổi quyền: chọn là áp dụng luôn (đơn giản gọn) */}
                    <label className="sr-only">Đổi quyền</label>
                    <div className="flex items-center gap-1">
                      <ArrowRightLeft size={16} className="text-gray-500" />
                      <select
                        className="rounded border px-2 py-1 text-xs"
                        defaultValue={u.role}
                        onChange={(e) => setRole(u.userId, e.target.value as RoomRole)}
                        title="Chọn quyền mới để áp dụng"
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kick */}
                    <button
                      onClick={() => reject(u.userId)}
                      className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-xs text-rose-600 hover:bg-rose-100"
                      title="Kick khỏi phòng"
                    >
                      <UserMinus size={14} /> Kick
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}

        {roster.length === 0 && (
          <li className="text-sm text-gray-500">Chưa có ai</li>
        )}
      </ul>

      {isHost && (
        <p className="mt-3 text-xs text-gray-500">
          Gợi ý: chọn quyền <span className="font-medium">Speaker / CoHost</span> để cho phép đăng hình/mic.
          Dùng <span className="font-medium">Kick</span> để mời ra khỏi phòng.
        </p>
      )}
    </div>
  );
};

export default UsersRoster;
