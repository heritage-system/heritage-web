import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage'; 
import VRToursPage from './pages/VRToursPage/VRPage';
import DiscoveryPage from './pages/DiscoveryPage/DiscoveryPage';
import CommunityPage from './pages/CommunityPage/CommunityPage';
import Login from './pages/AuthPage/Login'; // Import Login component
import MainLayout from './components/HomePage/MainLayout';
import Register from './pages/AuthPage/Register';
import QuizzPage from './pages/QuizzPage/QuizzPage';
import ForgotPassword from './pages/AuthPage/ForgotPassword';
import ResetPassword from './pages/AuthPage/ResetPassword'; 
import ChangePassword from './pages/AuthPage/ChangePassword'; // Import ChangePassword component
import ChatBoxAI from './components/Chatbox/ChatBoxAI.jsx';
import ViewProfile from './pages/AuthPage/ViewProfile.jsx';
import HeritageDetailView from './components/Heritage/HeritageDetail';
import QuizDetailView from './components/Quizz/QuizDetailView.jsx'; // Import QuizDetailView component

function App() {
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
        <Route path="/view-profile" element={<MainLayout><ViewProfile /></MainLayout>} />
        <Route path="/heritagedetail" element={<MainLayout><HeritageDetailView /></MainLayout>} />
        <Route path="/quizdetailview" element={<MainLayout><QuizDetailView /></MainLayout>} />
        {/* Add more routes as needed */}
      </Routes>
      <ChatBoxAI/>
    </Router>
    
  );
}

export default App;
