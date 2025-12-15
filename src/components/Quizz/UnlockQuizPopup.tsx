import React, { useState, useEffect } from "react";
import { X, Eye, CirclePlay, ChevronDown, ChevronUp, Star, HelpCircle, Coins, Ticket } from "lucide-react";
import { PanoramaTourDetailResponse } from "../../types/panoramaTour";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../Layouts/ModalLayouts/ConfirmModal"
import { QuizListResponse, QuizOverviewResponse } from "../../types/quiz";
import {getQuizOverview} from "../../services/quizService"
type PopupProps = {
  quiz: QuizListResponse;
  onClose: () => void;
  onHandleUnlock: (id: number) => void;
  onUnlockWithPoints: (id: number) => void;
  isAuthenticated?: boolean;  
  unlockLoading: boolean

};

const UnlockQuizPopup: React.FC<PopupProps> = ({ quiz, onClose, onHandleUnlock, unlockLoading, onUnlockWithPoints,isAuthenticated }) => {
  const navigate = useNavigate();
  const [currentQuiz, setCurrentQuiz] = useState<QuizOverviewResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"points" | "subscription" | null>(null);
  const [usePoints, setUsePoints] = useState(false);

 

  useEffect(() => {
    
    const loadQuizOverview = async () => {
      setIsLoading(true);
      try {
        const res = await getQuizOverview(quiz.id);
        setCurrentQuiz(res?.result);
      } catch (err) {
        console.error("Không thể tải", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuizOverview();   
  }, []);

  const triggerConfirm = (type: "points" | "subscription") => {
    setConfirmAction(type);
    setConfirmOpen(true);
  };

  const handleConfirm = (quizId:number) => {
    if (!confirmAction) return;

    if (confirmAction === "points") {
      onUnlockWithPoints(quizId);
    } else {
      onHandleUnlock(quizId);
    }

    setConfirmOpen(false);
  };

  const isOutOfSubscription =
    currentQuiz?.subscription &&
    !currentQuiz?.subscription.isUnlimited &&
    currentQuiz?.subscription.used >= currentQuiz?.subscription.total;

  const isNotEnoughPoints = usePoints && currentQuiz!.userPoint < 60;
  return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="
            bg-white rounded-2xl max-w-3xl  w-full mx-2 
            overflow-hidden shadow-2xl relative 
            max-h-[65vh]   /* popup không bao giờ vượt quá màn */
            flex flex-col   /* cho VR + drawer thành 2 khu */
          ">
  
          {/* HEADER */}
          <div className="bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white p-2 flex justify-between items-center">
            <div className="flex items-center">
              <CirclePlay className="w-6 h-6 mx-3" />
              <h2 className="text-lg font-bold">{quiz.title}</h2>
            </div>
            <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="h-[55vh] flex flex-col items-center justify-center bg-gray-900">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-red-700 border-b-transparent rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
            </div>
            <p className="text-white mt-4 text-lg animate-pulse">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="relative h-[55vh] bg-gray-900 overflow-hidden flex-shrink-0 pb-[20px]">

  {/* PREMIUM LOCKED MODE */}
    <div className="w-full h-full relative">

      {/* Thumbnail */}
      <img
        src={quiz.bannerUrl}
        className="w-full h-full object-cover opacity-60"
      />

      {/* Overlay Lock */}
      <div className="
        absolute inset-0 bg-black/60 backdrop-blur-sm
        flex flex-col items-center justify-center 
        text-white
      ">
        {/* Lock Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-white drop-shadow-2xl"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <rect x="3" y="10" width="18" height="12" rx="2" ry="2" />
          <path d="M7 10V7a5 5 0 0110 0v3" />
          <circle cx="12" cy="16" r="2" />
        </svg>

        {/* Message */}
        <p className="text-lg font-semibold text-center my-2">
          Nội dung dành cho hội viên
        </p>

        {/* Remaining usage */}
      {/* {tour.subscription ? (        
        <p className="text-base font-medium text-yellow-300 mb-4">
          Số lượt mở còn lại: {tour.subscription.used}/{tour.subscription.total}
        </p>
      ) : (
        <p className="text-base font-medium text-yellow-300 mb-4">
          Bạn chưa có gói Premium
        </p>
      )} */}

      {/* Unlock Button */}
  {/* CASE 1 — Chưa đăng nhập */}
  {!isAuthenticated && (
    <button
      onClick={() => navigate("/premium-packages")}
      className="bg-gradient-to-r from-yellow-700 to-red-700 
        text-white text-lg font-semibold px-6 py-3 
        rounded-full shadow-lg animate-bounce mt-4"
    >
      ⭐ Nâng cấp Premium để xem
    </button>
  )}

  {/* CASE 2 — Đã login nhưng chưa có subscription */}
  {isAuthenticated && !currentQuiz?.subscription && (
    <>
      {/* Thông tin điểm / tooltip */}
      <div className="flex items-center gap-2 mb-5">
        <span 
          title="Bạn có thể mở bài bằng lượt Premium hoặc dùng điểm Linh Hội."
          className="inline-flex"
        >
          <HelpCircle className="w-4 h-4 text-yellow-300" />
        </span>       
        {usePoints ? (
          <p className="text-base font-medium text-yellow-300">
            Điểm Linh Hội hiện có:{" "}
            <span className={currentQuiz!.userPoint < 60 ? "text-red-600 font-semibold" : "text-yellow-300 font-semibold"}>
              {currentQuiz?.userPoint.toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="text-base font-medium text-yellow-300">Bạn chưa phải hội viên</p>
        )}
      </div>

      {/* Nút mở + đổi chế độ */}
      <div className="flex items-center gap-3 animate-bounce mb-1">
        <button
          disabled={unlockLoading || isNotEnoughPoints}
          onClick={() => {
            if (usePoints) triggerConfirm("points");
            else navigate("/premium-packages");
          }}
          className={`
            px-8 py-3 rounded-full shadow-lg text-lg font-semibold flex items-center gap-2
            ${usePoints
              ? isNotEnoughPoints
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-green-700 to-emerald-700 text-white hover:brightness-110"
              : "bg-gradient-to-r from-yellow-700 to-red-700 text-white hover:brightness-110"
            }
          `}
        >
          {unlockLoading
            ? "Đang mở..."
            : usePoints
              ? isNotEnoughPoints ? "Cần 60 điểm Linh Hội" : "Mở bằng 60 điểm Linh Hội"
              : "Đăng ký Premium để mở"}
        </button>

        {/* nút đổi chế độ */}
        <button
          disabled={unlockLoading}
          onClick={() => setUsePoints(!usePoints)}
          title={
            usePoints
              ? "Chuyển sang mở bằng lượt Premium"
              : "Chuyển sang mở bằng điểm Linh Hội"
          }
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
        >
          {usePoints
            ? <Ticket className="w-5 h-5 text-yellow-700" />
            : <Coins className="w-5 h-5 text-yellow-700" />}
        </button>
      </div>

      {currentQuiz?.unSubscriptionLock ? (
        <p className="text-sm text-white">
          Bạn đã mở bằng lượt từ trước. Muốn mở vĩnh viễn bằng điểm Linh Hội không?      
        </p>
      ) : (
        <>
        {usePoints ? (
          <p className="text-sm text-white">Dùng điểm Linh Hội có thể mở khóa vĩnh viễn nội dung</p>
        ) : (
          <p className="text-sm text-white">Dùng lượt mở cho phép truy cập trong thời gian gói hội viên</p>
        )}
        </>
      )}
      </>
    )}

  {/* CASE 3 — Có subscription */}
  {isAuthenticated && currentQuiz?.subscription && (
    <>
      {/* Thông tin lượt / điểm */}
      <div className="flex items-center gap-2 mb-5">
        <span 
          title="Bạn có thể mở bài bằng lượt Premium hoặc dùng điểm Linh Hội."
          className="inline-flex"
        >
          <HelpCircle className="w-4 h-4 text-yellow-300" />
        </span>   

        {usePoints ? (
          <p className="text-base font-medium text-yellow-300">
            Điểm Linh Hội hiện có:{" "}
            <span className={isNotEnoughPoints ? "text-red-600 font-semibold" : "text-yellow-300 font-semibold"}>
              {currentQuiz?.userPoint.toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="text-base font-medium text-yellow-300">
            Số lượt mở còn lại:{" "}
            <span className={isOutOfSubscription ? "text-red-600 font-semibold" : "text-yellow-300 font-semibold"}>
              {currentQuiz?.subscription.isUnlimited ? "∞ / ∞" : `${currentQuiz?.subscription.used}/${currentQuiz?.subscription.total}`}
            </span>
          </p>
        )}
      </div>

      {/* Nút mở */}
      <div className="flex items-center gap-3 animate-bounce mb-1">
        <button
          disabled={
            unlockLoading ||
            (usePoints && isNotEnoughPoints) ||
            (!usePoints && isOutOfSubscription)
          }
          onClick={() => triggerConfirm(usePoints ? "points" : "subscription")}
          className={`
            px-8 py-3 rounded-full shadow-lg text-lg font-semibold flex items-center gap-2
            ${
              usePoints
                ? isNotEnoughPoints
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-700 to-emerald-700 text-white"
                : isOutOfSubscription
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-700 to-red-700 text-white"
            }
          `}
        >
          {unlockLoading
            ? "Đang mở..."
            : usePoints
              ? isNotEnoughPoints ? "Cần 60 điểm Linh Hội" : "Mở bằng 60 điểm Linh Hội"
              : isOutOfSubscription ? "Hết lượt mở" : "Mở bằng lượt Premium"}
        </button>

        {/* nút đổi chế độ */}
        <button
          disabled={unlockLoading}
          onClick={() => setUsePoints(!usePoints)}
          title={
            usePoints
              ? "Chuyển sang mở bằng lượt Premium"
              : "Chuyển sang mở bằng điểm Linh Hội"
          }
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 shadow"
        >
          {usePoints
            ? <Ticket className="w-5 h-5 text-yellow-700" />
            : <Coins className="w-5 h-5 text-yellow-700" />}
        </button>
      </div>

      <p className="text-sm text-white">
        {usePoints ? "Dùng điểm Linh Hội có thể mở khóa vĩnh viễn nội dung" : "Dùng lượt mở cho phép truy cập trong thời gian gói hội viên"}
      </p>
            </>
          )}
        </div>
      </div>
    </div>
  </>
  
)}
    </div>
     <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() =>handleConfirm(quiz.id)}
        title="Xác nhận mở khóa"
        message={
          confirmAction === "points"
            ? "Bạn có chắc muốn dùng 60 điểm Linh Hội để mở khóa vĩnh viễn nội dung này không?"
            : "Bạn có chắc muốn dùng 1 lượt hội viên để mở khóa nội dung này không?"
        }
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={unlockLoading}
      />
    </div>
    )}
export default UnlockQuizPopup;