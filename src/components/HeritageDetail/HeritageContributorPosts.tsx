import React, { useRef } from "react";
import {
  User,
  Calendar,
  Clock,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Contributor {
  id: number;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface ContributorPost {
  id: number;
  title: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
  readMinutes?: number;
  likeCount?: number;
  commentCount?: number;
  author: Contributor;
  url?: string;
}

interface Props {
  posts?: ContributorPost[];
  onOpenPost?: (post: ContributorPost) => void;
  onOpenAuthor?: (author: Contributor) => void;
  rightSlot?: React.ReactNode;
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
  onOpenAuthor,
  rightSlot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const fallback: ContributorPost[] = Array.from({ length: 4 }).map((_, i) => ({
    id: i + 1,
    title: `Bài viết của cộng tác viên #${i + 1}`,
    excerpt: "Tóm tắt ngắn về nghi thức, lịch sử và trải nghiệm tham dự lễ hội…",
    createdAt: new Date().toISOString(),
    readMinutes: 5 + i,
    likeCount: 8 * (i + 1),
    commentCount: 3 * (i + 1),
    author: { id: 100 + i, name: `Contributor ${i + 1}` },
  }));

  const data = posts?.length ? posts : fallback;

  const scroll = (dir: "left" | "right") => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

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
          {data.map((post) => (
            <article
              key={post.id}
              className="flex-shrink-0 w-72 border rounded-xl overflow-hidden bg-white hover:shadow-sm transition"
            >
              <div className="h-36 bg-gray-100">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
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
                  <button
                    className="flex items-center gap-2"
                    onClick={() => onOpenAuthor?.(post.author)}
                  >
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 hover:underline">
                      {post.author.name}
                    </span>
                  </button>
                </div>

                {/* Tiêu đề */}
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                  {post.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {fmtDate(post.createdAt)}
                  </span>
                  {post.readMinutes && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {post.readMinutes} phút đọc
                    </span>
                  )}
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-gray-700 line-clamp-3">{post.excerpt}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> {post.likeCount ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {post.commentCount ?? 0}
                    </span>
                  </div>
                  {post.url ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-yellow-700 hover:underline"
                    >
                      Xem <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onOpenPost?.(post)}
                      className="text-sm text-yellow-700 hover:underline inline-flex items-center gap-1"
                    >
                      Xem <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
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
