
import {Users, Star} from 'lucide-react';

// Active Mentors Component
const ActiveMentors = () => {
  const mentors = [
    {
      id: 1,
      name: 'Nghệ nhân Nguyễn Văn A',
      specialty: 'Gốm sứ Bát Tràng',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      isOnline: true,
      rating: 4.9,
      students: 156
    },
    {
      id: 2,
      name: 'Cô Phương Lan',
      specialty: 'Thêu tay Huế',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c86f0221?w=40&h=40&fit=crop&crop=face',
      isOnline: true,
      rating: 4.8,
      students: 89
    },
    {
      id: 3,
      name: 'Thầy Hoàng Minh',
      specialty: 'Hát Xoan Phú Thọ',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      isOnline: false,
      rating: 4.7,
      students: 234
    }
  ];

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-4 h-4 mr-2 text-purple-600" />
        Nghệ nhân đang hoạt động
      </h3>
      
      <div className="space-y-3">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                mentor.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{mentor.name}</p>
              <p className="text-xs text-gray-500 truncate">{mentor.specialty}</p>
              <div className="flex items-center text-xs text-gray-400">
                <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                {mentor.rating} • {mentor.students} học viên
              </div>
            </div>
            <button className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs hover:bg-purple-200 transition-colors">
              Nhắn tin
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveMentors;