import React, { useState, useEffect, useRef } from 'react';
import { 
  Star,
  Quote,
} from 'lucide-react';


// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Giáo viên lịch sử",
      avatar: "https://thalic.edu.vn/wp-content/uploads/2023/06/mc-minh-anh-500x500.jpg",
      content: "VTFP đã thay đổi cách tôi giảng dạy về văn hóa truyền thống. Học sinh rất thích trải nghiệm VR!",
      rating: 5
    },
    {
      name: "Trần Văn Đức",
      role: "Nhà nghiên cứu văn hóa",
      avatar: "https://medtechvietnam.org.vn/wp-content/uploads/2023/03/tran-van-duc1.jpg",
      content: "Nền tảng tuyệt vời để lưu giữ và truyền bá di sản văn hóa cho thế hệ trẻ.",
      rating: 5
    },
    {
      name: "Lê Thị Hoa",
      role: "Du khách",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1Kz2cP0Vo_5GsQ40XtkXpNR3tqi3XU7aaQ&s",
      content: "Tôi đã có những trải nghiệm tuyệt vời khi khám phá các lễ hội truyền thống qua VR.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Người dùng{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nói gì
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cảm nhận từ cộng đồng về trải nghiệm VTFP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-purple-300 mb-4" />
              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;