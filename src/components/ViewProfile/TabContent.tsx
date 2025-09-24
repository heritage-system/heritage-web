import React, { ChangeEvent } from 'react';

// Components
import FavoriteSection from './FavoriteSection';
import EventsSection from './EventsSection';
import QuizSection from './QuizSection';
import ContributionsSection from './ContributionsSection';
import AddContributionForm from './AddContributionForm';
import CollaboratorRequestSection from './CollaboratorRequestSection/CollaboratorRequestSection';

interface ContributionItem {
  title: string;
  status: string;
}

interface ContributionForm {
  title: string;
  description: string;
  type: string;
}

interface TabContentProps {
  currentTab: string;
  contributionForm: ContributionForm;
  contributions: ContributionItem[];
  onMenuChange: (key: string) => void;
  onContributionChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onContributionSubmit: () => void;
  onContributionCancel: () => void;
}

const TabContent: React.FC<TabContentProps> = ({
  currentTab,
  contributionForm,
  contributions,
  onMenuChange,
  onContributionChange,
  onContributionSubmit,
  onContributionCancel
}) => {
  // Tab content rendering
  switch (currentTab) {
    case "favorites":
      return <FavoriteSection />;

    case "events":
      return <EventsSection />;

    case "quiz":
      return <QuizSection />;

    case "contributions":
      return (
        <ContributionsSection 
          contributions={contributions}
          onMenuChange={onMenuChange}
        />
      );

    case "add-contribution":
      return (
        <AddContributionForm 
          contributionForm={contributionForm}
          onContributionChange={onContributionChange}
          onContributionSubmit={onContributionSubmit}
          onContributionCancel={onContributionCancel}
        />
      );

    case "collaborator-request":
      return <CollaboratorRequestSection />;

    default:
      return null;
  }
};

export default TabContent;