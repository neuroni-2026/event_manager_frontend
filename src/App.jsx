import Home from './Components/Home';
import EventCardDetails from './Components/EventCardDetails';
import AuthPage from './Components/Auth';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import OrganizerDashboard from './Components/OrganizerDashboard';
import AdminDashboard from './Components/AdminDashboard';
import NotificationPage from './Components/NotificationPage';
import MyTickets from './Components/MyTickets';
import Favorites from './Components/Favorites';
import Settingss from './Components/Settings';
import { Toaster,toast } from 'react-hot-toast';

function App() {
  return (
    <div>
      <Toaster 
         position="top-center" 
         reverseOrder={false} 
         toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
         }}
       />
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/event_detalii/:id" element={<EventCardDetails />} />
      <Route path="/home" element={<Home />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/notifications" element={<NotificationPage />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/settings" element={<Settingss />} />
      
    </Routes>
      
  </div>
  );
}

export default App;
