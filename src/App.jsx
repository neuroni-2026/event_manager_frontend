import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import Lenis from 'lenis';
import './index.css';

// Import Components
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import CreateEvent from './components/CreateEvent';
import EditEvent from './components/EditEvent';
import MyEvents from './components/MyEvents';
import AdminDashboard from './components/AdminDashboard';
import MyTickets from './components/MyTickets'; 
import TicketView from './components/TicketView';
import Notifications from './components/Notifications';
import FavoritesList from './components/FavoritesList';
import Settings from './components/Settings';
import ScanTicket from './components/ScanTicket';

function App() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Layout>
        <Routes>
            {/* Main Public Route: Home/Event List */}
            <Route path="/" element={<EventList />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Event Routes */}
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/events" element={<EventList />} />
            
            {/* Organizer Routes */}
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Student Routes */}
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/tickets/:id" element={<TicketView />} />
            <Route path="/favorites" element={<FavoritesList />} />
            
            {/* Common */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/scan" element={<ScanTicket />} />
            
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;