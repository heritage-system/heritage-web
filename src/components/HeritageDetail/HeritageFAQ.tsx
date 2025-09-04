import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items?: FAQItem[];
}

const SectionCard: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }>
  = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm border p-5">
    <header className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </header>
    <div>{children}</div>
  </section>
);

const QAItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-gray-700 leading-relaxed">{a}</p>}
    </div>
  );
};

export const HeritageFAQ: React.FC<Props> = ({ items }) => {
  const defaultFAQs: FAQItem[] = [
    {
      question: "Lễ hội diễn ra vào thời gian nào?",
      answer: "Thông thường bắt đầu vào ngày [startDay]/[startMonth] theo [lịch], tùy từng năm có thể thay đổi."
    },
    {
      question: "Địa điểm tổ chức ở đâu?",
      answer: "[địa điểm chi tiết] — kèm hướng dẫn di chuyển và gửi xe nếu có."
    },
    {
      question: "Có nên đặt lịch/đặt chỗ trước?",
      answer: "Khuyến nghị trong mùa cao điểm, nên xem thông báo của BTC."
    }
  ];

  const faqItems = items || defaultFAQs;

  return (
    <SectionCard title="FAQ (Hỏi đáp)">
      <div>
        {faqItems.map((item, index) => (
          <QAItem 
            key={index}
            q={item.question} 
            a={item.answer} 
          />
        ))}
      </div>
    </SectionCard>
  );
};