import React from "react";
import { useParams, Link } from "react-router-dom";
import EventDetailView from "../../components/Community/EventDetailView";

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const parsedId = eventId ? Number(eventId) : NaN;
  const valid = !Number.isNaN(parsedId) && parsedId > 0;

  if (!valid) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-sm text-rose-600">
          Event ID không hợp lệ.
        </p>
        <Link
          to="/join"
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Quay lại trang sự kiện
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-4">
      <EventDetailView eventId={parsedId} />
    </div>
  );
};

export default EventDetailPage;
