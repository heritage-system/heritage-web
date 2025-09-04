import React from "react";
import { Review } from "../../types/review";
import ReviewThreadModal from "./ReviewThreadModal";

interface Props {
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;

  // optional: để popup post/reply gọi API
  onSubmitReview?: (payload: { rating: number; comment: string; media?: File[] }) => Promise<void> | void;
  onReply?: (payload: { parentReviewId: number; comment: string; media?: File[] }) => Promise<void> | void;

  // optional: thông tin user hiện tại
  currentUserName?: string;
  currentUserAvatar?: string;
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> =
  ({ title, right, children }) => (
    <section className="bg-white rounded-2xl shadow-sm border p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {right}
      </header>
      <div>{children}</div>
    </section>
  );

export const HeritageReviews: React.FC<Props> = ({
  reviews = [],
  averageRating,
  totalReviews,
  onSubmitReview,
  onReply,
  currentUserName,
  currentUserAvatar,
}) => {
  const [openModal, setOpenModal] = React.useState(false);

  // trong component (mock khi reviews rỗng)
const displayedReviews: Review[] = reviews.length > 0 ? reviews : [
  {
    id: 1,
    username: "Tài Solar",
    userImageUrl: "https://scontent.fdad1-1.fna.fbcdn.net/v/t39.30808-6/506404099_4197641767223591_6381738907088493658_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=OSn7iXR5OIYQ7kNvwHvRtHI&_nc_oc=AdlLgX7HzoQaqw3OtyOekroyt9a86LhnFIvsyPx0Wnr7mUmVQJ3WPFA6cps59O0IjTd_u4NLCE1VuyCrWL0GdeJ7&_nc_zt=23&_nc_ht=scontent.fdad1-1.fna&_nc_gid=f4XdW9Jz5FjeiYAVt7oplw&oh=00_AfVpwkvnRUzZLYqf6RhkFznPJniBJJ9Hvw5E1H6rFe84eQ&oe=68B9E0D1",
    heritageId: 123,
    comment: "Lễ hội rất náo nhiệt, nhiều hoạt động truyền thống thú vị.",
    likes: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewMedias: [
      {
        id: 101,
        reviewId: 1,
        mediaType: "IMAGE",
        url: "https://scontent.fdad2-1.fna.fbcdn.net/v/t39.30808-6/472562215_4041888282798941_6231677747168426427_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=2iC4yk0I5yEQ7kNvwEzHcam&_nc_oc=Adl0xbLnQSGszCtct10Rn8Ykd4fakGQRcyYuT4N9A6uyGoSPZEKuJAN3HHhKrbXvwpIr-ARNCvALzEa-j1I1IJyY&_nc_zt=23&_nc_ht=scontent.fdad2-1.fna&_nc_gid=vKv6Jd83_cLZbWCJzXGjeg&oh=00_AfUV_yd74cbOBMUjkIfbY8q5CDuaT6szZ23YC2ZVo-_4XQ&oe=68B9E183",
      },    
      {
        id: 103,
        reviewId: 1,
        mediaType: "VIDEO",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    replies: [
      {
        id: 11,
        username: "Việt South",
        userImageUrl: "https://scontent.fdad1-3.fna.fbcdn.net/v/t39.30808-6/272866399_1134733160690319_4515414860481465490_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=WrNSpXMaN70Q7kNvwHfsUvc&_nc_oc=AdlA1VWd4FB9DIzNGyBnEo3yttP9xhGVOBgfMTEZAqEfSeAk_jlFM5Yn0S-b1nh2fmwSB-jhDKeOJUPGbgCy9AZE&_nc_zt=23&_nc_ht=scontent.fdad1-3.fna&_nc_gid=CDmzmRD6BvEYdfT_gq0XUQ&oh=00_AfULaYMtRDzfG294C1eRqMw41ygn1JjAGV6g4fRPR8cBsw&oe=68BA01F7",
        heritageId: 123,
        comment: "Chuẩn luôn, năm ngoái mình đi cũng đông vui lắm.",
        parentReviewId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewMedias: [
          {
            id: 111,
            reviewId: 11,
            mediaType: "IMAGE",
            url: "https://scontent.fdad1-2.fna.fbcdn.net/v/t1.6435-9/131119118_864414937722144_792042928981028082_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=dYeHMDhYngwQ7kNvwH8XTSj&_nc_oc=AdnkHwi7M3PJksEIEPBYO5cTnNvzVC126rlGTB9dLPPLO6B7_c-MGAn8MdYkSljz_Q5O6jaNzyT5bQa6gprla98S&_nc_zt=23&_nc_ht=scontent.fdad1-2.fna&_nc_gid=2--NEOF22uLaVhvCfkJK3w&oh=00_AfXa_Q0bhAlypitvmdVN9037he7oVJaNCHUEUJCF5uHQyg&oe=68DB8FAC",
          },
        ],
        replies: [
          {
            id: 1111,
            username: "Handsome Minh",
            userImageUrl: "https://scontent.fdad2-1.fna.fbcdn.net/v/t39.30808-1/320030970_1297632987737105_93893185038403113_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=f_kQN2Zq5y8Q7kNvwEDob7M&_nc_oc=AdkYRMhxO9jCEeb8EgI20XIIz-Fqho8hNYywxGAi4pVUNVKhDPMzbMI8MWWUQJMgu3Qqn74-7jicGZwmUtkY2iZ5&_nc_zt=24&_nc_ht=scontent.fdad2-1.fna&_nc_gid=n0Lf8akFtbmVijCnwJDUEA&oh=00_AfXtwoXAvVSt86UezQvrEYh8xzoE-1IQQmIOqP5fVXLb4Q&oe=68B9DF57",
            heritageId: 123,
            comment: "Năm nay chắc còn hoành tráng hơn đó.",
            parentReviewId: 11,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reviewMedias: [],
          },
        ],
      },
      {
        id: 12,
        username: "Việt South",
        userImageUrl: "https://scontent.fdad1-3.fna.fbcdn.net/v/t39.30808-6/272866399_1134733160690319_4515414860481465490_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=WrNSpXMaN70Q7kNvwHfsUvc&_nc_oc=AdlA1VWd4FB9DIzNGyBnEo3yttP9xhGVOBgfMTEZAqEfSeAk_jlFM5Yn0S-b1nh2fmwSB-jhDKeOJUPGbgCy9AZE&_nc_zt=23&_nc_ht=scontent.fdad1-3.fna&_nc_gid=CDmzmRD6BvEYdfT_gq0XUQ&oh=00_AfULaYMtRDzfG294C1eRqMw41ygn1JjAGV6g4fRPR8cBsw&oe=68BA01F7",
        heritageId: 123,
        comment: "Có gian hàng ẩm thực địa phương rất ngon nữa nè.",
        parentReviewId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviewMedias: [
          {
            id: 121,
            reviewId: 12,
            mediaType: "IMAGE",
            url: "https://scontent.fdad1-1.fna.fbcdn.net/v/t1.6435-9/135046599_879599496203688_4827511727182124825_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=O5eNnKSFmvcQ7kNvwGuobgd&_nc_oc=AdkD4J_tLshYkhJXvedqoUfdPrWKDLPyXEFiWFc1CWWZbZ2oehmVzGKNfzCYftW8v23o1Ku15ID0oEgNgqjQ2x1x&_nc_zt=23&_nc_ht=scontent.fdad1-1.fna&_nc_gid=WHv8neN_KZZYwfPNQKLp3Q&oh=00_AfWIyh8RQNbqH-5h88FmE1p5-MJ1XwjOplxmeKwO7t9LBQ&oe=68DB9EE6",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    username: "My Cuto",
    userImageUrl: "https://scontent.fdad1-1.fna.fbcdn.net/v/t39.30808-1/426374074_1609908019778178_3489862452939210007_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=1d2534&_nc_ohc=s_q2XK0rtcgQ7kNvwHlaTuI&_nc_oc=Adlrno015rE6Yn4rcCynTvM3XpN2hWuTfdJKEo4bXOMsrMKKS5eBlSBL9Vs-B-sIQVctbIO-_r7r0y5bhCKvZUYs&_nc_zt=24&_nc_ht=scontent.fdad1-1.fna&_nc_gid=wGhDj-tiwPHbr0ZfsmT-WQ&oh=00_AfXztxE882V06azrCdE4dFH5bOmA7xt-7-GvhouHwfJBaA&oe=68B9E081",
    heritageId: 123,
    comment: "Mình thích nhất là phần trình diễn múa lân, rất đặc sắc.",
    likes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewMedias: [
      {
        id: 201,
        reviewId: 2,
        mediaType: "IMAGE",
        url: "https://scontent.fdad2-1.fna.fbcdn.net/v/t39.30808-6/474583867_1840494783386166_3591197404229912121_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Xhh1M4uK6d4Q7kNvwEeQmok&_nc_oc=AdkRgrBizMsbtQAQhXsidezMU6NEuVro2yh0K8mFWt5KrlBOvuZF3U0FpNu6HOs1OwCjNGiYl2W97-FSXftMdhRC&_nc_zt=23&_nc_ht=scontent.fdad2-1.fna&_nc_gid=isj9AiF1HLbNQzW9JVOFYw&oh=00_AfV1brhs8wKU4EUQseQX98jwqlK4McB8aHfWHduPxP4obw&oe=68B9E759",
      },
    ],
    replies: [
      {
        id: 21,
        username: "Tài Solar",
        userImageUrl: "https://scontent.fdad1-1.fna.fbcdn.net/v/t39.30808-6/506404099_4197641767223591_6381738907088493658_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=OSn7iXR5OIYQ7kNvwHvRtHI&_nc_oc=AdlLgX7HzoQaqw3OtyOekroyt9a86LhnFIvsyPx0Wnr7mUmVQJ3WPFA6cps59O0IjTd_u4NLCE1VuyCrWL0GdeJ7&_nc_zt=23&_nc_ht=scontent.fdad1-1.fna&_nc_gid=f4XdW9Jz5FjeiYAVt7oplw&oh=00_AfVpwkvnRUzZLYqf6RhkFznPJniBJJ9Hvw5E1H6rFe84eQ&oe=68B9E0D1",
        heritageId: 123,
        comment: "Múa lân là linh hồn của lễ hội luôn đó chị.",
        parentReviewId: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];


  return (
    <>
      <SectionCard
        title="Đánh giá (Review)"
        right={
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="text-sm text-yellow-700 hover:underline"
          >
            Xem tất cả
          </button>
        }
      >
        <div className="space-y-4">
          {/* Rating tổng quan */}
          {averageRating !== undefined && totalReviews !== undefined && (
            <div className="flex items-center gap-2 pb-3 border-b">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.366 2.448a1 1 0 00-.364 1.118l1.286 3.958c.3.921-.755 1.688-1.54 1.118l-3.366-2.448a1 1 0 00-1.176 0l-3.366 2.448c-.785.57-1.84-.197-1.54-1.118l1.286-3.958a1 1 0 00-.364-1.118L2.05 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({totalReviews} đánh giá)
              </span>
            </div>
          )}

          {/* Reviews preview */}
          <div className="space-y-3">
            {displayedReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{review.username}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
            {displayedReviews.length > 3 && (
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="text-sm text-yellow-700 hover:underline"
              >
                Xem thêm {displayedReviews.length - 3} bình luận
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      <ReviewThreadModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        reviews={displayedReviews}
        onSubmitReview={onSubmitReview}
        onReply={onReply}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />
    </>
  );
};

