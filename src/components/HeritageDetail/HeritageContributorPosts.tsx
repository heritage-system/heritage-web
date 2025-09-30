import React, { useRef, useState } from "react";
import {
  User,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye
} from "lucide-react";
import { ContributionSearchResponse } from "../../types/contribution";
import { Link } from "react-router-dom";
interface Props {
  posts?: ContributionSearchResponse[];
  onOpenPost?: (post: ContributionSearchResponse) => void;
  rightSlot?: React.ReactNode;
  loading?: boolean;
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> =
  ({ title, right, children }) => (
    <section className="bg-white rounded-2xl shadow-sm border p-5 relative">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {right}
      </header>
      <div>{children}</div>
    </section>
  );

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const HeritageContributorPosts: React.FC<Props> = ({
  posts,
  onOpenPost,
  rightSlot,
  loading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedTags, setExpandedTags] = useState<Set<number>>(new Set());

  const scroll = (dir: "left" | "right") => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  if (!posts || posts.length === 0) return null;

  return (
    <SectionCard title="Bài viết bạn có thể quan tâm" right={rightSlot}>
      <div className="relative">
        {/* Nút trái */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Danh sách */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {posts.map((post) => {
            const tags = post.contributionHeritageTags || [];
            const isExpanded = expandedTags.has(post.id);

            return (
              <article
                key={post.id}
                className="flex-shrink-0 w-72 border rounded-xl overflow-hidden bg-white hover:shadow-sm transition"
              >
                <div className="h-36 bg-gray-100">
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Không có ảnh
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  {/* Tác giả */}
                  <div className="flex items-center gap-2">
                    {post.avatarUrl ? (
                      <img
                        src={post.avatarUrl}
                        alt={post.contributorName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 hover:underline">
                      {post.contributorName}
                    </span>
                    {post.isPremium && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                  {/* Tiêu đề + Premium */}
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex items-center gap-1">
                    <span className="flex-1">{post.title}</span>               
                  </h3>
                  {/* Heritage tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(isExpanded ? tags : tags.slice(0, 1)).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {tags.length > 1 && (
                        <button
                          onClick={() => {
                            const next = new Set(expandedTags);
                            if (isExpanded) next.delete(post.id);
                            else next.add(post.id);
                            setExpandedTags(next);
                          }}
                          className="text-xs text-yellow-700 hover:underline"
                        >
                          {isExpanded ? "Ẩn bớt" : `+${tags.length - 1} xem thêm`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {fmtDate(post.publishedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {post.view ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> {post.comments ?? 0}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenPost?.(post)}
                      className="text-sm text-yellow-700 hover:underline inline-flex items-center gap-1"
                    >
                      Xem <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Nút phải */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-10 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </SectionCard>
  );
};
