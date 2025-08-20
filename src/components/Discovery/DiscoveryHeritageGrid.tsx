import DiscoveryHeritageCard from "./DiscoveryHeritageCard";
import { Heritage } from "../../types/heritage";

// Heritage Grid Component
interface DiscoveryHeritageGridProps {
  heritages: Heritage[];
}

const DiscoveryHeritageGrid: React.FC<DiscoveryHeritageGridProps> = ({ heritages }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {heritages.map((heritage) => (
        <DiscoveryHeritageCard key={heritage.id} heritage={heritage} />
      ))}
    </div>
  );
};

export default DiscoveryHeritageGrid;
