import VRTourCard from "./VRTourCard";

const VRToursGrid = () => {
  const tours = [
    {
      id: 1,
      title: "Lăng Khải Định - Huế",
      description: "Khám phá lăng mộ của vua Khải Định với kiến trúc độc đáo pha trộn phương Đông và phương Tây",
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
      location: "Huế",
      duration: "25 phút",
      rating: 4.8,
      participants: "2.3K",
      category: "palace"
    },
    {
      id: 2,
      title: "Chùa Cầu Hội An",
      description: "Trải nghiệm không gian linh thiêng của ngôi chùa cầu nổi tiếng nhất Hội An",
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop",
      location: "Hội An",
      duration: "20 phút",
      rating: 4.9,
      participants: "3.1K",
      category: "temple"
    },
    {
      id: 3,
      title: "Bảo tàng Dân tộc học Việt Nam",
      description: "Tìm hiểu về 54 dân tộc Việt Nam qua không gian trưng bày sinh động",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      location: "Hà Nội",
      duration: "35 phút",
      rating: 4.7,
      participants: "1.8K",
      category: "museum"
    },
    {
      id: 4,
      title: "Lễ hội Cung đình Huế",
      description: "Tham gia lễ hội cung đình với các màn biểu diễn nghệ thuật truyền thống",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
      location: "Huế",
      duration: "40 phút",
      rating: 4.6,
      participants: "2.7K",
      category: "festival"
    },
    {
      id: 5,
      title: "Hoàng thành Thăng Long",
      description: "Khám phá di tích cung đình ngàn năm tuổi của thủ đô Hà Nội",
      image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&h=300&fit=crop",
      location: "Hà Nội",
      duration: "30 phút",
      rating: 4.5,
      participants: "1.5K",
      category: "palace"
    },
    {
      id: 6,
      title: "Tháp Bà Ponagar",
      description: "Trải nghiệm không gian thiêng liêng của tháp Chăm cổ nhất Việt Nam",
      image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
      location: "Nha Trang",
      duration: "25 phút",
      rating: 4.7,
      participants: "2.1K",
      category: "temple"
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tours VR <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Nổi bật</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá những di sản văn hóa đặc sắc nhất Việt Nam qua công nghệ thực tế ảo tiên tiến
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <VRTourCard key={tour.id} tour={tour} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all">
            Xem tất cả tours VR
          </button>
        </div>
      </div>
    </section>
  );
};

export default VRToursGrid;