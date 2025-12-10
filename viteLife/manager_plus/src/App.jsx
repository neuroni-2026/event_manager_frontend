import Home from './Components/Home';
import EventCardDetails from './Components/EventCardDetails';
import AuthPage from './Components/Auth';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import OrganizerDashboard from './Components/OrganizerDashboard';
import AdminDashboard from './Components/AdminDashboard';


function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/event_detalii/:id" element={<EventCardDetails />} />
      <Route path="/home" element={<Home />} />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
      
  </div>
  );
}

export default App;
