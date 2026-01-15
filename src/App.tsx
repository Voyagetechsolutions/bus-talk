import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route, useLocation } from 'react-router-dom';
import { useAppStore } from './hooks/useStore';
import Navbar from './components/Navbar';
import BusOfTheWeekModal from './components/BusOfTheWeekModal';
import Home from './pages/Home';
import Companies from './pages/Companies';
import Buses from './pages/Buses';
import Drivers from './pages/Drivers';
import Posts from './pages/Posts';
import Sightings from './pages/Sightings';
import Awards from './pages/Awards';
import Vote from './pages/Vote';
import RateTrip from './pages/RateTrip';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import SpotBus from './pages/SpotBus';
import CoachTalk from './pages/CoachTalk';
import CommunityDetail from './pages/CommunityDetail';
import RoutesPage from './pages/Routes';
import './media-fix.css';
import './company-fix.css';

// Layout wrapper that conditionally shows navbar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Admin routes use their own layout, no navbar
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <BusOfTheWeekModal />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { initializeAuth } = useAppStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    if (!authInitialized) {
      initializeAuth().finally(() => setAuthInitialized(true));
    }
  }, [initializeAuth, authInitialized]);

  return (
    <Router>
      <AppLayout>
        <RouterRoutes>
          <Route path="/" element={<Home />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/sightings" element={<Sightings />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/rate-trip" element={<RateTrip />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/spot-bus" element={<SpotBus />} />
          <Route path="/coach-talk" element={<CoachTalk />} />
          <Route path="/coach-talk/:slug" element={<CommunityDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/analytics" element={<Analytics />} />
        </RouterRoutes>
      </AppLayout>
    </Router>
  );
}

export default App;
