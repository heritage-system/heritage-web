import DiscoveryHeritageCard from "./DiscoveryHeritageCard";
import { HeritageSearchResponse } from "../../types/heritage";
import SectionLoader from "../../components/Layouts/LoadingLayouts/SectionLoader";
import DiscoveryHeritageCardSkeleton from "./DiscoveryHeritageCardSkeleton";
import { PredictApiPayload, PredictResponse } from "../../types/AIpredict";
// Heritage Grid Component
interface DiscoveryHeritageGridProps {
  heritages: HeritageSearchResponse[];
  loading: boolean;
}

const DiscoveryHeritageGrid: React.FC<DiscoveryHeritageGridProps> = ({ heritages, loading }) => {
  return (
    <div className="relative">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <DiscoveryHeritageCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {heritages.map((heritage) => (
            <DiscoveryHeritageCard key={heritage.id} heritage={heritage} />
          ))}
        </div>
      )}
    </div>
  );
};


export default DiscoveryHeritageGrid;
