import { 
  Puzzle,
  Camera,
  Map,
  Headphones,
} from 'lucide-react';


// Interactive Features Data
const InteractiveFeatures = [
  {
    icon: Camera,
    title: "AR Scan & Learn",
    description: "Quét các di tích thực tế để học thêm thông tin",
    color: "from-red-500 to-pink-500",
    isNew: true
  },
  {
    icon: Map,
    title: "Heritage Journey",
    description: "Hành trình khám phá di sản trên bản đồ 3D",
    color: "from-blue-500 to-cyan-500",
    isNew: false
  },
  {
    icon: Headphones,
    title: "Audio Stories",
    description: "Nghe câu chuyện lịch sử được kể bằng giọng nói",
    color: "from-purple-500 to-indigo-500",
    isNew: true
  },
  {
    icon: Puzzle,
    title: "Heritage Puzzles",
    description: "Giải đố hình ảnh các di tích nổi tiếng",
    color: "from-green-500 to-emerald-500",
    isNew: false
  }
];

export default InteractiveFeatures;