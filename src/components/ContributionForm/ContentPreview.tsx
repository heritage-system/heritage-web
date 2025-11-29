// components/ContentPreview.tsx
import React from "react";
import { htmlFromDeltaWithImgAlign,toHtml } from "../../utils/deltaUtils";
import { HeritageName } from "../../types/heritage";
import { SubscriptionDto } from "../../types/subscription";
import { Eye, Calendar, Tag } from "lucide-react";

interface ContentPreviewProps {
  title: string;
  cover?: string | null;
  delta?: any;
  html?: string | null;
  publishedAt?: string | null;
  view?: number | null;
  contentPreview?: string | null; // nội dung rút gọn khi locked
  heritageTags?: HeritageName[];
  subscription?: SubscriptionDto;
  onUnlock?: () => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  title,
  cover,
  delta,
  html,
  publishedAt,
  view,
  contentPreview,
  heritageTags = [],
  subscription,
  onUnlock
}) => {
  // fallback
  const viewsCount = view ?? 0;
  const displayDate = publishedAt
  ? new Date(publishedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  : new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });


  return (
    <div className="space-y-2">
      {/* Cover Image */}
      <div className="relative">
        {cover && (
          <img
            src={cover}
            alt="cover"
            className="w-full h-64 sm:h-80 object-cover border-t-4  rounded-tl-2xl rounded-tr-2xl"
          />
        )}
      </div>


      {/* Article Header */}
      <div className="p-6 border-b border-gray-200">
        {/* Heritage Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {heritageTags.map((heritage, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-700 to-red-700 text-white"
            >
              <Tag className="w-3 h-3 mr-1" />
              {heritage.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {title || "(Chưa có tiêu đề)"}
        </h1>

        {/* Meta Info */}
        {publishedAt != null && view != null && ( <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{viewsCount} lượt xem</span>
          </div>
        </div>)}
      </div>

      {/* Article Content */}
      <div className="relative p-6">
        {/* Case 1: html có → detail */}
        {html && (
          <div
            className="prose max-w-none quill-content
              [&_blockquote]:border-l-4
              [&_blockquote]:border-black
              [&_blockquote]:pl-4
              [&_blockquote]:my-2
              [&_.ql-caption]:text-gray-500
              [&_.ql-caption]:italic
              [&_.ql-caption]:text-sm
              [&_.ql-caption]:m-0
              prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
            dangerouslySetInnerHTML={{
              __html: toHtml(html),
            }}
          />
        )}

        {/* Case 2: dùng delta → preview */}
        {!html && delta && (
          <div
            className="prose max-w-none quill-content
              [&_blockquote]:border-l-4
              [&_blockquote]:border-black
              [&_blockquote]:pl-4
              [&_blockquote]:my-2
              [&_.ql-caption]:text-gray-500
              [&_.ql-caption]:italic
              [&_.ql-caption]:text-sm
              [&_.ql-caption]:m-0
              prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
            dangerouslySetInnerHTML={{
              __html: htmlFromDeltaWithImgAlign(delta.ops),
            }}
          />
        )}

        {/* Case 3: html = null, có contentPreview → locked content */}
        {!html && !delta && contentPreview && (
          <div className="relative">
            <div
              className="prose max-w-none quill-content
                [&_blockquote]:border-l-4
                [&_blockquote]:border-black
                [&_blockquote]:pl-4
                [&_blockquote]:my-2
                [&_.ql-caption]:text-gray-500
                [&_.ql-caption]:italic
                [&_.ql-caption]:text-sm
                [&_.ql-caption]:m-0
                prose-headings:mt-0 prose-p:mt-0 prose-img:mt-0 prose-figure:mt-0"
              dangerouslySetInnerHTML={{
                __html: toHtml(contentPreview),
              }}
            />

            {/* overlay che phần dưới */}
<div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white via-white/90 to-transparent flex flex-col items-center justify-end gap-3 pb-6">
  {subscription ? (
    <>
      <p className="text-sm text-gray-600 mb-5">
        Lượt mở còn lại:{" "}
        <span
          className={`font-semibold ${
            subscription.used >= subscription.total
              ? "text-red-600"
              : "text-gray-900"
          }`}
        >
          {subscription.used}/{subscription.total}
        </span>{" "}      
      </p>
      <button
        disabled={subscription.used >= subscription.total}
        className={`px-6 py-3 rounded-full shadow-lg text-lg font-semibold transition animate-bounce ${
          subscription.used >= subscription.total
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-700 to-red-700 text-white hover:brightness-110 "
        }`}
        onClick={onUnlock}
      >
        {subscription.used >= subscription.total
          ? "Đã hết lượt"
          : "Mở khóa bài viết"}
      </button>
    </>
  ) : (
    <button className="bg-gradient-to-r from-yellow-700 to-red-700 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg animate-bounce">
      ⭐ Nâng cấp Premium để đọc tiếp
    </button>
  )}
</div>

          </div>
        )}
  

      </div>

    </div>
  );
};

export default ContentPreview;
