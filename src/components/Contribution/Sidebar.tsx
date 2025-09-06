import React from 'react';
import TrendingTopics from './TrendingTopics';
import RecommendedAuthors from './RecommendedAuthors';
import TopicsToFollow from './TopicsToFollow';
import { Contribution } from '../../types/contribution';

interface SidebarProps {
  contributions: Contribution[];
  followingAuthors: number[];
  onToggleFollow: (contributorId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ contributions, followingAuthors, onToggleFollow }) => {
  return (
    <aside className="col-span-4 hidden lg:block">
      <div className="sticky top-24 space-y-8">
        <TrendingTopics />
        <RecommendedAuthors
          contributors={contributions}
          followingAuthors={followingAuthors}
          onToggleFollow={onToggleFollow}
        />
        <TopicsToFollow />
      </div>
    </aside>
  );
};

export default Sidebar;
