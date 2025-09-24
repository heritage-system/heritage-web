import React from 'react';
import TrendingTopics from './TrendingTopics';
import RecommendedAuthors from './RecommendedAuthors';
import { ContributionHeritageTag } from "../../types/heritage";
import { TrendingContributor } from '../../types/contributor';
interface SidebarProps {
  contributors: TrendingContributor[];
  contributionTags: ContributionHeritageTag[];
  loadingContributors: boolean;
  loadingTrending: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ contributors,contributionTags,loadingContributors,loadingTrending}) => {
  return (
    <aside className="col-span-4 hidden lg:block">
      <div className="sticky top-24 space-y-8">
        <TrendingTopics 
          loading={loadingTrending}
          contributionTags={contributionTags}
        />
        <RecommendedAuthors
          contributors={contributors}   
          loading={loadingContributors}    
        />
        {/* <TopicsToFollow /> */}
      </div>
    </aside>
  );
};

export default Sidebar;
