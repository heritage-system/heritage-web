import {MapPin, Calendar, Bell, Clock, Users } from 'lucide-react';

// Upcoming Events Sidebar Component
const DiscoveryUpcomingEvents = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Lễ hội Chùa Hương',
      date: '15/01/2025',
      time: '06:00',
      location: 'Hà Nội',
      attendees: 1200,
      image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=80&h=60&fit=crop'
    },
    {
      id: 2,
      title: 'Nhã nhạc Cung đình',
      date: '20/01/2025',
      time: '19:30',
      location: 'Huế',
      attendees: 350,
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=60&fit=crop'
    },
    {
      id: 3,
      title: 'Múa rối nước',
      date: '25/01/2025',
      time: '20:00',
      location: 'Hà Nội',
      attendees: 180,
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=80&h=60&fit=crop'
    }
  ];

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Bell className="w-4 h-4 mr-2 text-purple-600" />
          Sự kiện sắp tới
        </h3>
        <button className="text-purple-600 text-sm hover:underline">Xem tất cả</button>
      </div>
      
      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <img
              src={event.image}
              alt={event.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {event.date}
                <Clock className="w-3 h-3 ml-2 mr-1" />
                {event.time}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {event.location}
                <Users className="w-3 h-3 ml-2 mr-1" />
                {event.attendees}
              </div>
            </div>
            <button className="text-purple-600 hover:bg-purple-50 p-1 rounded">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoveryUpcomingEvents;