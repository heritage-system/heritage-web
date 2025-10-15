// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage'; 
import VRToursPage from './pages/VRToursPage/VRPage';
import DiscoveryPage from './pages/DiscoveryPage/DiscoveryPage';
import CommunityPage from './pages/CommunityPage/CommunityPage';
import Login from './pages/AuthPage/Login';
import MainLayout from './components/HomePage/MainLayout';
import Register from './pages/AuthPage/Register';
import QuizzPage from './pages/QuizzPage/QuizPage';
import ForgotPassword from './pages/AuthPage/ForgotPassword';
import ResetPassword from './pages/AuthPage/ResetPassword'; 
import ChangePassword from './pages/AuthPage/ChangePassword';
import ChatBoxAI from './components/Chatbox/ChatBoxAI';
import HeritageDetailPage from "./pages/HeritagePage/HeritageDetailPage";
import QuizDetailView from './components/Quizz/QuizDetailView';
import { Toaster } from 'react-hot-toast';
import ViewProfile from './pages/AuthPage/ViewProfile';
import CallbackGoogle from './pages/oauth2/callback/google/page';
import AdminPanelPage from './pages/AdminPanelPage/AdminPanelPage';
import HeritageDetailManagement from './components/Admin/ContentManagement/HeritageDetailManagement';
import ReportManagement from './components/Admin/ReportsAnalytics/ReportManagement';
import ReportDetailManagement from './components/Admin/ReportsAnalytics/ReportDetailManagement';
import ContributionFormPage from './pages/ContributionPage/ContributionFormPage';
import ContributionSearchResponse from './pages/ContributionPage/ContributionPage';
import AdminHomeDashboard from './pages/AdminPage/AdminDashboard';
import ArticleDetailPage from './pages/ContributionPage/ContributionDetailPage';
import HeritageForm from './pages/ContributionPage/HeritageForm'
import BoardGame from './pages/QuizzPage/BoardGame'
import BoardGameMono from './pages/QuizzPage/BoardGameMono'
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="VRToursPage" element={<MainLayout><VRToursPage /></MainLayout>} />
        <Route path="DiscoveryPage" element={<MainLayout><DiscoveryPage /></MainLayout>} />
        <Route path="CommunityPage" element={<MainLayout><CommunityPage /></MainLayout>} />
        <Route path="/QuizzPage" element={<MainLayout><QuizzPage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
        <Route path="/change-password" element={<MainLayout><ChangePassword /></MainLayout>} />
        <Route path="/heritagedetail/:id" element={<MainLayout><HeritageDetailPage /></MainLayout>} />
        <Route path="/quizdetailview" element={<MainLayout><QuizDetailView /></MainLayout>} />
        <Route path="/view-profile" element={<MainLayout><ViewProfile /></MainLayout>} />
        <Route path="/contribution-form/:id?" element={<MainLayout><ContributionFormPage /></MainLayout>} />
        <Route path="/oauth2/callback/google" element={<CallbackGoogle />} />
        <Route path="/admin/adminPanelmanagement" element={<AdminPanelPage />} />
        <Route path="/admin/heritage/:id" element={<HeritageDetailManagement />} />
        <Route path="/heritage/:id" element={<HeritageDetailPage />} />
        <Route path="/admin/reports" element={<ReportManagement />} />
        <Route path="/reports/:id" element={<ReportDetailManagement />} />
        <Route path="/contributions" element={<MainLayout><ContributionSearchResponse /></MainLayout>} />
        <Route path="/admin/adminHomeDashboard" element={<AdminHomeDashboard />} />
        <Route path="/contributions/:id" element={<MainLayout><ArticleDetailPage /></MainLayout>} />   
        <Route path="/heritage-form" element={<MainLayout><HeritageForm /></MainLayout>} /> 
         <Route path="/board-game" element={<MainLayout><BoardGame /></MainLayout>} />
         <Route path="/board-game-mono" element={<MainLayout><BoardGameMono /></MainLayout>} />
      </Routes>

      {/* <ChatBoxAI /> */}

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '8px',
          },
        }}
      />
    </Router>
  );
};

export default App;
