import React, { useState } from "react";
import { QuizCreationRequest, QuizUpdateRequest } from "../../../../types/quiz";
import { toast } from "react-hot-toast";
import PortalModal from "../../../Layouts/ModalLayouts/PortalModal";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

type TempQuestion = {
  tempId: string;
  quizId: number | null;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  quizCategory: number;
  quizLevel: number;
};

interface Props {
  formData: QuizCreationRequest | QuizUpdateRequest;
  setFormData: React.Dispatch<
    React.SetStateAction<QuizCreationRequest | QuizUpdateRequest>
  >;
   onDeleteQuestion: (tempId: string, quizQuestionId?: number) => void;
}

const QuizQuestionList: React.FC<Props> = ({ formData, setFormData, onDeleteQuestion }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emptyQuestion: TempQuestion = {
    tempId: crypto.randomUUID(),
    quizId: null,
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    quizCategory: 0,
    quizLevel: 0,
  };

  const [question, setQuestion] = useState<TempQuestion>(emptyQuestion);

  const toggleOpen = (i: number) => {
    if (openIndex === i) {
      setOpenIndex(null);
      setEditingIndex(null);
    } else {
      setOpenIndex(i);
      handleEdit(formData.questions[i] as any, i);
    }
  };

  const resetForm = () => {
    setQuestion({ ...emptyQuestion, tempId: crypto.randomUUID() });
    setEditingIndex(null);
    setOpenIndex(null);
  };

  const save = () => {
    if (!question.question.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    const options = {
      A: question.optionA.trim(),
      B: question.optionB.trim(),
      C: question.optionC.trim(),
      D: question.optionD.trim(),
    };

    if (!options.A && !options.B && !options.C && !options.D) {
      toast.error("Vui lòng nhập ít nhất 1 đáp án!");
      return;
    }

    if (!options[question.correctOption as keyof typeof options]) {
      toast.error("Đáp án đúng không được để trống!");
      return;
    }

    const newQ: TempQuestion = {
      ...question,
      tempId: crypto.randomUUID(),
      quizCategory: Number(question.quizCategory),
      quizLevel: Number(question.quizLevel),
    };

    const updated = [...formData.questions];

    if (editingIndex !== null) {
      updated[editingIndex] = newQ;
    } else {
      updated.push(newQ);
    }

    setFormData({ ...formData, questions: updated });
    resetForm();
    toast.success(editingIndex !== null ? "Cập nhật câu hỏi thành công!" : "Thêm câu hỏi thành công!");
  };

  const handleDelete = (i: number) => setDeleteIndex(i);

  const confirmDelete = () => {
  if (deleteIndex === null) return;

  const q = formData.questions[deleteIndex] as any;

  onDeleteQuestion(q.tempId, q.quizId);

  setDeleteIndex(null);
};

  const handleEdit = (q: any, i: number) => {
    setQuestion({
      tempId: q.tempId ?? crypto.randomUUID(),
      quizId: q.quizId ?? null,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      quizCategory: Number(q.quizCategory) || 0,
      quizLevel: Number(q.quizLevel) || 0,
    });
    setEditingIndex(i);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Danh sách câu hỏi ({formData.questions.length})
        </h2>

        <button
          onClick={() => {
            resetForm();
            setOpenIndex(formData.questions.length);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          + Thêm câu hỏi
        </button>
      </div>

      <div className="space-y-2">
        {(formData.questions as any[]).map((q, i) => (
          <div key={q.tempId} className="border rounded-xl overflow-hidden">
            {/* Thanh ngang câu hỏi */}
            <button
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-all"
              onClick={() => toggleOpen(i)}
            >
              <span className="font-medium">Câu {i + 1}</span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(i);
                  }}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 size={16} />
                </button>
                <span>{openIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
              </div>
            </button>

            {/* Form mở ra */}
            {openIndex === i && (
              <QuestionFormUI
                question={question}
                setQuestion={setQuestion}
                onCancel={resetForm}
                onSave={save}
                editing={true}
              />
            )}
          </div>
        ))}

        {/* Form thêm câu hỏi mới */}
        {openIndex === formData.questions.length && (
          <QuestionFormUI
            question={question}
            setQuestion={setQuestion}
            onCancel={resetForm}
            onSave={save}
            editing={false}
          />
        )}
      </div>

      {/* Modal xóa */}
      <PortalModal
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        centered
        size="sm"
      >
        <div className="p-6 bg-white rounded-lg w-[380px]">
          <h2 className="text-xl font-bold mb-4 text-center">Xác nhận xóa</h2>
          <p className="text-gray-600 mb-6 text-center">
            Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 rounded bg-gray-300" onClick={() => setDeleteIndex(null)}>Hủy</button>
            <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>Xóa</button>
          </div>
        </div>
      </PortalModal>
    </div>
  );
};

export default QuizQuestionList;

const QuestionFormUI = ({
  question,
  setQuestion,
  onCancel,
  onSave,
  editing,
}: {
  question: any;
  setQuestion: any;
  onCancel: () => void;
  onSave: () => void;
  editing: boolean;
}) => {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-5 shadow mt-3">
      <h3 className="text-lg font-bold">{editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>

      <textarea
        value={question.question}
        onChange={(e) => setQuestion({ ...question, question: e.target.value })}
        className="w-full border p-3 rounded-xl"
        placeholder="Nhập nội dung câu hỏi..."
      />

      <div className="grid grid-cols-2 gap-4">
        {["A", "B", "C", "D"].map((o) => (
          <input
            key={o}
            type="text"
            placeholder={`Đáp án ${o}`}
            value={question[`option${o}`]}
            onChange={(e) => setQuestion({ ...question, [`option${o}`]: e.target.value })}
            className="border p-3 rounded-xl"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <select
          value={question.correctOption}
          onChange={(e) => setQuestion({ ...question, correctOption: e.target.value })}
          className="border p-3 rounded-xl"
        >
          {["A", "B", "C", "D"].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <select
          value={question.quizLevel}
          onChange={(e) => setQuestion({ ...question, quizLevel: Number(e.target.value) })}
          className="border p-3 rounded-xl"
        >
          <option value={0}>Khởi động</option>
          <option value={1}>Thử thách</option>
          <option value={2}>Đỉnh cao</option>
        </select>

        <select
          value={question.quizCategory}
          onChange={(e) => setQuestion({ ...question, quizCategory: Number(e.target.value) })}
          className="border p-3 rounded-xl"
        >
          <option value={0}>Phần lễ</option>
          <option value={1}>Phần hội</option>
          <option value={2}>Không có</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 border rounded-xl">Hủy</button>
        <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
          {editing ? "Cập nhật" : "Thêm câu hỏi"}
        </button>
      </div>
    </div>
  );
};
