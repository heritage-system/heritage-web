import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { QuizListResponse } from "../../../../types/quiz";

interface Props {
  quizzes: QuizListResponse[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const QuizTable: React.FC<Props> = ({ quizzes, onView, onEdit, onDelete }) => {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tên
            </th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Câu hỏi
            </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Lượt hoàn thành
            </th>
           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Premium
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {quizzes.map((q) => (
            <tr key={q.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{q.id}</td>
              <td className="px-6 py-4 text-sm">{q.title}</td>

              <td className="px-6 py-4 text-sm">{q.totalQuestions}</td>

              <td className="px-6 py-4 text-sm">{q.numberOfClear}</td>

              <td className="px-6 py-4 text-sm">
                {q.isPremium ? "Premium" : "Free"}
              </td>

              <td className="px-6 py-4 text-right flex gap-2 justify-end">
                <button
                  onClick={() => onView(q.id)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => onEdit(q.id)}
                  className="text-indigo-600 hover:text-indigo-900 p-1"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => onDelete(q.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuizTable;
