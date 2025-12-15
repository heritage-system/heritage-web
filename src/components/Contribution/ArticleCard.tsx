import React, { useState } from "react";
import { ContributionSearchResponse } from "../../types/contribution";
import {
  Bookmark,
  BookmarkPlus,
  MessageCircle,
  Eye,
  Star,
  Flag,
  Share2 
} from "lucide-react";
import { Link } from "react-router-dom";
import ReportModal from "./ReportModal";
import toast from "react-hot-toast";

interface Props {
  contribution: ContributionSearchResponse;
  isLast?: boolean;
  onToggleSave?: (id: number, saved: boolean) => void;
}

const ArticleCard: React.FC<Props> = ({ contribution, isLast, onToggleSave }) => {
  const [showShare, setShowShare] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const date = new Date(contribution.publishedAt);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formattedDate =
    diffInDays < 7
      ? `${diffInDays === 0 ? "Hôm nay" : `${diffInDays} ngày trước`}`
      : date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });

  const handleShare = (platform: string) => {
    const url = window.location.origin + `/contributions/${contribution.id}`;
    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);   
        toast.success("Đã sao chép link!"); 
        break;
    }
    setShowShare(false);
  };

  return (
    <div
      className={`group flex flex-col md:flex-row justify-between items-stretch gap-4 ${
        !isLast ? "border-b pb-8" : ""
      }`}
    >
      <div className="flex-1 flex flex-col justify-between">
      {/* Left Content + Link */}
      <Link
        to={`/contributions/${contribution.id}`}     
      >
        {/* Contributor + Premium */}
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-2">
          <img
            src={contribution.avatarUrl}
            alt={contribution.contributorName}
            className="w-6 h-6 rounded-full"
          />
          <span>{contribution.contributorName}</span>
          {contribution.isPremium && (
            <Star
              className="w-4 h-4 text-yellow-500"
              aria-label="Bài viết Premium"
            />
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
          {contribution.title}
        </h1>

        {/* First Content */}
        {contribution.firstContent && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {contribution.firstContent}
          </p>
        )}

        {/* Heritage Tags */}
        {contribution.contributionHeritageTags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {contribution.contributionHeritageTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
         </Link>


        {/* Footer Info */}
        <div className="flex items-center text-xs text-gray-500">
          <span>{formattedDate}</span>

          <div className="flex items-center space-x-1 ml-4">
            <Eye className="w-4 h-4" />
            <span>{contribution.view}</span>
          </div>

          <div className="flex items-center space-x-1 ml-4">
            <MessageCircle className="w-4 h-4" />
            <span>{contribution.comments}</span>
          </div>

          {/* Actions (Save + Report + Share) */}
          <div className="ml-auto flex items-center space-x-3 relative">
            {/* Save */}
            <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave?.(contribution.id, contribution.isSave);
                }}
                aria-label={contribution.isSave ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                title={contribution.isSave ? "Bỏ lưu bài viết" : "Lưu bài viết"}
              >
               <Bookmark
                  className={`w-5 h-5 ${
                    contribution.isSave
                      ? "text-black fill-black" 
                      : "text-gray-500 hover:text-gray-700" 
                  }`}
                />

              </button>


            {/* Report */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setReportOpen(true);
              }}
              aria-label="Báo cáo bài viết"
              title="Báo cáo bài viết"
            >
              <Flag className="w-5 h-5 text-gray-500 hover:text-red-600" />
            </button>

            {/* Share */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowShare((prev) => !prev);
                }}
                aria-label="Chia sẻ bài viết"
                title="Chia sẻ bài viết"
              >
                <Share2 className="w-5 h-5 text-gray-500 hover:text-blue-600" />
              </button>

              {showShare && (
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 flex items-center justify-around w-40">
                <button 
                  onClick={() => handleShare('facebook')} 
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
                  title="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </button>

                <button 
                  onClick={() => handleShare('twitter')} 
                  className="p-2 rounded-full hover:bg-blue-50 text-sky-500"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.86 1.09A4.52 4.52 0 0016.11 0c-2.63 0-4.77 2.13-4.77 4.76 0 .37.04.73.12 1.07C7.69 5.67 4.07 3.75 1.64.96a4.77 4.77 0 00-.65 2.39c0 1.65.84 3.1 2.12 3.95a4.52 4.52 0 01-2.16-.6v.06c0 2.3 1.65 4.22 3.84 4.65a4.5 4.5 0 01-2.14.08c.6 1.86 2.34 3.22 4.4 3.26A9.05 9.05 0 010 19.54a12.79 12.79 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.2 0-.41-.01-.61A9.18 9.18 0 0023 3z"/>
                  </svg>
                </button>

                <button 
                  onClick={() => handleShare('copy')} 
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  title="Sao chép link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 13a5 5 0 007.54 4.54l3.36-3.36a5 5 0 00-7.07-7.07l-.88.88"/>
                    <path d="M14 11a5 5 0 00-7.54-4.54L3.1 9.82a5 5 0 007.07 7.07l.88-.88"/>
                  </svg>
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
        </div>
     {/* Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        contributionId={contribution.id}
      />
        
      {/* Right Thumbnail */}
      {contribution.mediaUrl && (
        <Link to={`/contributions/${contribution.id}`} className="self-center">
          <img
            src={contribution.mediaUrl}
            alt={contribution.title}
            className="w-44 h-28 object-cover rounded-md"
          />
        </Link>
      )}
    </div>
  );
};

export default ArticleCard;
