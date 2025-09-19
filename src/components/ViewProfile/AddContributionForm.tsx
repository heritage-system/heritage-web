import React, { ChangeEvent } from 'react';

interface ContributionForm {
  title: string;
  description: string;
  type: string;
}

interface AddContributionFormProps {
  contributionForm: ContributionForm;
  onContributionChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onContributionSubmit: () => void;
  onContributionCancel: () => void;
}

const AddContributionForm: React.FC<AddContributionFormProps> = ({
  contributionForm,
  onContributionChange,
  onContributionSubmit,
  onContributionCancel
}) => {
  return (
    <div className="bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 rounded-3xl p-8 min-h-[700px]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 bg-clip-text text-black mb-3 flex items-center gap-3">
          <span className="text-4xl">📝</span>
          Thêm đóng góp di sản
        </h2>
        <p className="text-amber-700/80 text-lg">Chia sẻ kiến thức của bạn về di sản văn hóa Việt Nam</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-yellow-200 shadow-2xl">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="flex items-center gap-3 text-sm font-bold text-yellow-700 mb-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">📋</span>
                  </div>
                  Tiêu đề đóng góp
                </label>
                <input
                  type="text"
                  name="title"
                  value={contributionForm.title}
                  onChange={onContributionChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 text-lg font-medium"
                  placeholder="Nhập tiêu đề đóng góp..."
                />
              </div>
              
              <div>
                <label className="flex items-center gap-3 text-sm font-bold text-amber-700 mb-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600">📂</span>
                  </div>
                  Loại đóng góp
                </label>
                <select
                  name="type"
                  value={contributionForm.type}
                  onChange={onContributionChange}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 text-lg font-medium"
                >
                  <option value="Bài viết">📄 Bài viết</option>
                  <option value="Hình ảnh">🖼️ Hình ảnh</option>
                  <option value="Video">🎥 Video</option>
                  <option value="Tài liệu">📋 Tài liệu</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="flex items-center gap-3 text-sm font-bold text-yellow-700 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">📝</span>
                </div>
                Mô tả chi tiết
              </label>
              <textarea
                name="description"
                value={contributionForm.description}
                onChange={onContributionChange}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl h-48 resize-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 text-lg"
                placeholder="Mô tả chi tiết về đóng góp của bạn..."
              />
            </div>
            
            <div className="flex justify-end gap-6 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onContributionCancel}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl transition-all duration-300 font-semibold text-lg"
              >
                <span className="mr-2">❌</span>
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onContributionSubmit}
                className="px-10 py-4 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 hover:from-yellow-600 hover:to-amber-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
              >
                <span className="mr-3">📤</span>
                Gửi đóng góp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddContributionForm;