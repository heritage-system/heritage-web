import { Calendar} from 'lucide-react';

// Upcoming Workshops Sidebar
const UpcomingWorkshops = () => {
  const upcomingWorkshops = [
    {
      id: 1,
      title: 'Thêu tay truyền thống',
      instructor: 'Cô Lan',
      time: '14:00 - 16:00',
      date: 'Hôm nay',
      participants: 12,
      maxParticipants: 20,
      isVirtual: true
    },
    {
      id: 2,
      title: 'Học hát Xoan',
      instructor: 'Thầy Minh',
      time: '19:00 - 21:00',
      date: 'Mai',
      participants: 8,
      maxParticipants: 15,
      isVirtual: true
    },
    {
      id: 3,
      title: 'Làm bánh dân gian',
      instructor: 'Bà Hương',
      time: '09:00 - 11:00',
      date: '30/06',
      participants: 5,
      maxParticipants: 12,
      isVirtual: false
    }
  ];

  return (
   <div className="bg-white rounded-xl border p-4 shadow-md">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold flex items-center text-gray-900">
      <Calendar className="w-4 h-4 mr-2 text-yellow-600" />
      Workshop sắp tới
    </h3>
    <button className="text-amber-800 text-sm hover:underline">Xem tất cả</button>
  </div>
  
  <div className="space-y-3">
    {upcomingWorkshops.map((workshop) => (
      <div key={workshop.id} className="p-3 rounded-lg hover:bg-amber-50 cursor-pointer border border-amber-200 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">{workshop.title}</h4>
          {workshop.isVirtual && (
            <span className="text-xs bg-red-700 text-white px-2 py-1 rounded">VR</span>
          )}
        </div>
        <p className="text-xs text-gray-600 mb-2">Giảng viên: {workshop.instructor}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{workshop.date} • {workshop.time}</span>
          <span>{workshop.participants}/{workshop.maxParticipants}</span>
        </div>
        <button className="w-full mt-2 bg-gradient-to-r from-yellow-600 via-red-700 to-amber-900 text-white py-1 px-3 rounded text-xs hover:opacity-90 transition-colors">
  Tham gia
</button>
      </div>
    ))}
  </div>
</div>
  );
};

export default UpcomingWorkshops;