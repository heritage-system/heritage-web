import { MessageCircle, Heart, Share2} from 'lucide-react';

// Community Feed Component
const CommunityFeed = () => {
  const posts = [
    {
      id: 1,
      user: {
        name: 'Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c86f0221?w=40&h=40&fit=crop&crop=face',
        role: 'Học viên'
      },
      content: 'Vừa hoàn thành workshop về làm gốm! Cảm ơn thầy Nguyễn đã hướng dẫn rất tận tình. Sản phẩm đầu tay của mình đây 😊',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      time: '2 giờ trước',
      likes: 24,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      user: {
        name: 'Thầy Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        role: 'Nghệ nhân'
      },
      content: 'Hôm nay sẽ có workshop trực tuyến về kỹ thuật tạo hình cơ bản. Mời các bạn tham gia lúc 14:00. Chuẩn bị sẵn đất sét nhé! 🏺',
      time: '4 giờ trước',
      likes: 156,
      comments: 23,
      shares: 45
    }
  ];

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-xl border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{post.user.name}</h4>
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                  {post.user.role}
                </span>
              </div>
              <p className="text-xs text-gray-500">{post.time}</p>
            </div>
          </div>
          
          <p className="text-gray-800 mb-3">{post.content}</p>
          
          {post.image && (
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
          )}
          
          <div className="flex items-center justify-between pt-3 border-t">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{post.shares}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed;