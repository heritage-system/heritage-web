import React, { ChangeEvent } from 'react';

// Components
import FavoriteSection from './FavoriteSection';
import EventsSection from './EventsSection';
import QuizSection from './QuizSection';
import ContributionSaveSection from './ContributionSaveSection';
import ContributionsSection from './Contribution/ContributionsSection';
import ContributionDetailSection from './Contribution/ContributionDetailSection';
import CollaboratorRequestSection from './CollaboratorRequestSection/CollaboratorRequestSection';
import ContributionFormPage from '../../pages/ContributionPage/ContributionFormPage';
import {
  ContributionOverviewItemListResponse 
} from "../../types/contribution";


interface ContributionForm {
  title: string;
  description: string;
  type: string;
}

interface TabContentProps {
  currentTab: string;
  contributionForm: ContributionForm;
  selectedContributionId: number;
  contributions: ContributionOverviewItemListResponse[];
  onMenuChange: (key: string) => void;
  onContributionChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onContributionSubmit: () => void;
  onContributionCancel: () => void;
  onSelectContribution: (id: number | null) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  currentTab,
  contributionForm,
  contributions,
  onMenuChange,
  onContributionChange,
  onContributionSubmit,
  onContributionCancel,
  selectedContributionId,
  onSelectContribution
}) => {
  // Tab content rendering
  switch (currentTab) {
    case "favorites":
      return <FavoriteSection />;
    
    case "contribution_saves":
      return <ContributionSaveSection />;

    case "events":
      return <EventsSection />;

    case "quiz":
      return <QuizSection />;

    case "contributions":
      return selectedContributionId ? (
        <ContributionDetailSection contributionId={selectedContributionId} 
          onBack={() => onSelectContribution(null)}
        />
      ) : (
        <ContributionsSection
          onMenuChange={onMenuChange}
          onSelectContribution={onSelectContribution} 
        />
      );


    case "add-contribution":
      return (
        // <AddContributionForm 
        //   contributionForm={contributionForm}
        //   onContributionChange={onContributionChange}
        //   onContributionSubmit={onContributionSubmit}
        //   onContributionCancel={onContributionCancel}
        // />
        <ContributionFormPage />
      );
    // case "view-contribution":
    //   return (
       
    //     <ContributionDetailSection contributionId={contributionId} />
    //   );

    case "collaborator-request":
      return <CollaboratorRequestSection />;

    default:
      return null;
  }
};

export default TabContent;