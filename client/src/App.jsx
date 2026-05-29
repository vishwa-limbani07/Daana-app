// App.jsx — top-level component. Owns the route table.
// Wraps every page in a shared <Navbar /> layout.
// <ToastContainer /> lives at the root so toasts can fire from any page.

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';
import Home from './pages/Home.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}
