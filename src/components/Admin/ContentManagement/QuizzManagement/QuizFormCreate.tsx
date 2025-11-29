import React, { useState, useEffect } from "react";
import QuizQuestionList from "./QuizQuestionList";
import {
  QuizDetailAdminResponse,
  QuizCreationRequest,
  QuizUpdateRequest,
  QuizQuestionCreationRequest,
  QuizQuestionUpdateRequest,
} from "../../../../types/quiz";
import { PremiumType } from "../../../../types/enum";
import { ArrowLeft } from "lucide-react";
import { uploadImage } from "../../../../services/uploadService";
import { toast } from "react-hot-toast";
import { createQuiz, updateQuiz, createQuizQuestion, updateQuizQuestion, deleteQuizQuestion  } from "../../../../services/quizService";

interface Props {
  mode: "create" | "edit";
  quiz: QuizDetailAdminResponse | null;
  onSave: (data: QuizCreationRequest | QuizUpdateRequest) => void;
  onCancel: () => void;
}

const QuizFormCreate: React.FC<Props> = ({
  mode,
  quiz,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] =
    useState<QuizCreationRequest | QuizUpdateRequest>({
      title: "",
      bannerUrl: "",
      premiumType: PremiumType.FREE,
      questions: [],
    });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && quiz) {
      const mappedQuestions = quiz.questions.map((q) => ({
        quizId: quiz.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        quizCategory:
          q.quizCategory === "RITUAL"
            ? 0
            : q.quizCategory === "GAME"
            ? 1
            : 2,
        quizLevel:
          q.quizLevel === "EASY"
            ? 0
            : q.quizLevel === "MEDIUM"
            ? 1
            : 2,
        tempId: crypto.randomUUID(),
      }));

      setFormData({
        id: quiz.id,
        title: quiz.title,
        bannerUrl: quiz.bannerUrl ?? "",
        premiumType: quiz.premiumType,
        questions: mappedQuestions,
      });
    }
  }, [mode, quiz]);

  const handleSave = async () => {
  if (isSubmitting) return; 
  setIsSubmitting(true);

  if (!formData.title.trim()) {
    toast.error("Tên quiz không được để trống!");
    setIsSubmitting(false);
    return;
  }

  try {
    let quizId: number;

    if (mode === "create") {
      const res = await createQuiz({
        title: formData.title,
        bannerUrl: formData.bannerUrl,
        premiumType: Number(formData.premiumType),
        questions: [],
      });

      if (!res.message) throw new Error("Tạo quiz thất bại");
      quizId = (res.result as any).quizId;
    } else {
      await updateQuiz(formData as QuizUpdateRequest);
      quizId = (formData as QuizUpdateRequest).id;
    }

    await Promise.all(
      formData.questions.map((q: any) => {
        const payload = {
          quizId,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          quizCategory: Number(q.quizCategory),
          quizLevel: Number(q.quizLevel),
        };

        if (mode === "edit" && q.quizId) {
          return updateQuizQuestion({ id: q.quizId, ...payload });
        } else {
          return createQuizQuestion(payload);
        }
      })
    );

    toast.success("Lưu trò chơi và câu hỏi thành công!");
    onSave({ ...formData, id: quizId });
  } catch (err: any) {
    toast.error(err.message || "Lưu thất bại");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await uploadImage(file);
    if (res.code === 200 && res.result) {
      setFormData({ ...formData, bannerUrl: res.result });
    } else {
      toast.error("Upload ảnh thất bại!");
    }
  };

  const handleDeleteQuestion = async (tempId: string, quizQuestionId?: number) => {
  try {
    if (mode === "edit" && quizQuestionId) {
      const res = await deleteQuizQuestion(quizQuestionId);
      if (res.code !== 200) throw new Error("Xóa câu hỏi thất bại!");
    }

    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q: any) => q.tempId !== tempId)
    }));

    toast.success("Xóa câu hỏi thành công!");
  } catch (error: any) {
    toast.error(error.message || "Không thể xóa câu hỏi!");
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === "create" ? "Tạo Trò Chơi" : "Chỉnh Sửa Trò Chơi"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Điền thông tin trò chơi & câu hỏi của bạn
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-medium text-white transition-all ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Trò Chơi"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Thông Tin Trò Chơi
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tên Trò Chơi
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
              placeholder="Nhập tên quiz..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Banner Trò Chơi
            </label>

            <input
              type="text"
              value={formData.bannerUrl}
              onChange={(e) =>
                setFormData({ ...formData, bannerUrl: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
              placeholder="https://example.com/image.jpg"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc upload ảnh từ máy
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full"
              />
            </div>

            {formData.bannerUrl && (
              <div className="mt-2 border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={formData.bannerUrl}
                  alt="Preview"
                  className="w-full h-60 object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Loại truy cập
            </label>
            <select
              value={formData.premiumType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  premiumType: Number(e.target.value) as PremiumType,
                })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
            >
              <option value={PremiumType.FREE}>Miễn phí</option>
              <option value={PremiumType.SUBSCRIPTIONONLY}>
                Chỉ thành viên
              </option>
            </select>
          </div>

          <div className="pt-8 border-t-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Danh sách câu hỏi
            </h2>

            <QuizQuestionList
              formData={formData}
              setFormData={setFormData}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizFormCreate;
