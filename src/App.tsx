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
import QuizzPage from './pages/QuizzPage/QuizzPage';
import ForgotPassword from './pages/AuthPage/ForgotPassword';
import ResetPassword from './pages/AuthPage/ResetPassword'; 
import ChangePassword from './pages/AuthPage/ChangePassword';
import ChatBoxAI from './components/Chatbox/ChatBoxAI';
import HeritageDetailPage from "./pages/HeritagePage/HeritageDetailPage";
import { Toaster } from 'react-hot-toast';
import ViewProfile from './pages/AuthPage/ViewProfile';
import CallbackGoogle from './pages/oauth2/callback/google/page';
import AdminPanelPage from './pages/AdminPanelPage/AdminPanelPage';
import ReportManagement from './components/Admin/ReportsAnalytics/ReportManagement';
import ReportDetailManagement from './components/Admin/ReportsAnalytics/ReportDetailManagement';
import ContributionFormPage from './pages/ContributionPage/ContributionFormPage';
import ContributionSearchResponse from './pages/ContributionPage/ContributionPage';
import AdminHomeDashboard from './pages/AdminPage/AdminDashboard';
import ArticleDetailPage from './pages/ContributionPage/ContributionDetailPage';
import AIpredictLensPage from './pages/DiscoveryPage/AIpredictLensPageCopy';
//import AIpredictLensPage from './pages/DiscoveryPage/AIpredictLensPage';
import JoinRoomPage from './pages/CommunityPage/JoinRoomPage';
//import LiveRoomPage from './pages/CommunityPage/LiveRoomPage';
import AdminStreamPage from './pages/AdminPage/AdminStreamPage';
import { StreamingProvider } from './components/Admin/Streaming/StreamingContext';
import LiveRoomPage from './components/Community/LiveRoomPage';
import ActivePackageList from './components/PremiumPackage/ActivePackageList';
import PaymentResultPage from './components/PremiumPackage/PaymentResultPage';
import ConfirmEmailPage from './pages/AuthPage/ConfirmEmailPage';
import { EventProvider } from "./components/Admin/EventManagement/EventContext";
import EventDetailPage from './pages/CommunityPage/EventDetailPage';
import EventDetailView from './components/Community/EventDetailView';

import TermsPage from './pages/TermsPage/TermsPage';

import ScrollToTop from "./components/Layouts/ScrollToTop";
const App: React.FC = () => {
  return (
    <Router>
       <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="VRToursPage" element={<MainLayout><VRToursPage /></MainLayout>} />
        <Route path="DiscoveryPage" element={<MainLayout><DiscoveryPage /></MainLayout>} />
        <Route path="/events/:eventId" element={<MainLayout><StreamingProvider><EventProvider><EventDetailPage/></EventProvider></StreamingProvider></MainLayout>}/>
        {/* <Route path="AIPredictLensPage" element={<MainLayout><AIpredictLensPage/></MainLayout>} /> */}
        {/* <Route path="CommunityPage" element={<MainLayout><CommunityPage /></MainLayout>} /> */}
        <Route path="/confirm-email-address" element={<MainLayout><ConfirmEmailPage/></MainLayout>} />
        <Route path="CommunityPage" element={<MainLayout><StreamingProvider><EventProvider><JoinRoomPage/></EventProvider></StreamingProvider></MainLayout>}/>
        <Route path="/QuizzPage" element={<MainLayout><QuizzPage /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
        <Route path="/change-password" element={<MainLayout><ChangePassword /></MainLayout>} />
        <Route path="/heritagedetail/:id" element={<MainLayout><HeritageDetailPage /></MainLayout>} />     
        <Route path="/view-profile" element={<MainLayout><ViewProfile /></MainLayout>} />
        <Route path="/contribution-form/:id?" element={<MainLayout><ContributionFormPage /></MainLayout>} />
        <Route path="/oauth2/callback/google" element={<CallbackGoogle />} />
        <Route path="/admin/adminPanelmanagement" element={<StreamingProvider><EventProvider><AdminPanelPage /></EventProvider></StreamingProvider>}/>

        <Route path="/heritage/:id" element={<HeritageDetailPage />} />
        <Route path="/admin/reports" element={<ReportManagement />} />
        <Route path="/reports/:id" element={<ReportDetailManagement />} />
        <Route path="/contributions" element={<MainLayout><ContributionSearchResponse /></MainLayout>} />
        <Route path="/admin/adminHomeDashboard" element={<AdminHomeDashboard />} />
        <Route path="/contributions/:id" element={<MainLayout><ArticleDetailPage /></MainLayout>} />  
        <Route path="/live/:roomId" element={<StreamingProvider><LiveRoomPage /> </StreamingProvider>} /> 
        <Route path="/premium-packages" element={<MainLayout><ActivePackageList /></MainLayout>} />
        <Route path="/payment/success" element={<MainLayout><PaymentResultPage /></MainLayout>} />
        <Route path="/payment/result" element={<MainLayout><PaymentResultPage /></MainLayout>} />
        <Route path="/payment/cancel" element={<MainLayout><PaymentResultPage /></MainLayout>} />

      
       
        <Route path="/term" element={<MainLayout><TermsPage /></MainLayout>} />
      
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
