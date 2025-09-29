import React from "react";
import { HeritageDescription } from "../../types/heritage";

interface Props {
  activeTab: "History" | "Rituals" | "Values" | "Preservation";
  description: HeritageDescription | null;
  onTabChange: (tab: "History" | "Rituals" | "Values" | "Preservation") => void;
}

const SectionCard: React.FC<{
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

export const HeritageContentTabs: React.FC<Props> = ({
  activeTab,
  description,
  onTabChange,
}) => {
  const tabs = [
    { key: "History", label: "Lịch sử" },
    { key: "Rituals", label: "Nghi lễ" },
    { key: "Values", label: "Giá trị" },
    { key: "Preservation", label: "Bảo tồn" },
  ] as const;

  // Lấy danh sách block theo tab đang chọn
  const contentBlocks = description?.[activeTab] || [];

  return (
    <SectionCard
      title="Nội dung di sản"
      right={
        <div className="grid grid-cols-2 sm:flex gap-2 bg-gray-50 p-1 rounded-xl border">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                activeTab === key
                  ? "bg-white shadow-sm border"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="prose max-w-none prose-p:leading-relaxed">
        {contentBlocks.length > 0 ? (
          contentBlocks.map((block, idx) => {
            if (block.Type === "paragraph") {
              return <p key={idx}>{block.Content}</p>;
            }
            if (block.Type === "list" && block.Items) {
              return (
                <ul key={idx}>
                  {block.Items.map((Item, i) => (
                    <li key={i}>{Item}</li>
                  ))}
                </ul>
              );
            }
            return null;
          })
        ) : (
          <p className="text-gray-500 italic">Chưa có nội dung</p>
        )}
      </div>
    </SectionCard>
  );
};
