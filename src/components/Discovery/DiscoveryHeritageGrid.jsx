import DiscoveryHeritageCard from "./DiscoveryHeritageCard";

// Heritage Grid Component
const DiscoveryHeritageGrid = ({ heritages }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {heritages.map((heritage) => (
        <DiscoveryHeritageCard key={heritage.id} heritage={heritage} />
      ))}
    </div>
  );
};

export default DiscoveryHeritageGrid;