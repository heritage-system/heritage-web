import { 
  ChevronRight,
} from 'lucide-react';
import InteractiveFeatures from './InteractiveFeatures';


const InteractiveFeaturesSection = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tương tác</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá di sản văn hóa với công nghệ hiện đại và trải nghiệm immersive
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {InteractiveFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300 relative">
                {feature.isNew && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      NEW
                    </span>
                  </div>
                )}
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto">
                  Trải nghiệm <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeaturesSection;