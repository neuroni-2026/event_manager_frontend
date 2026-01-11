import React, { useState, useEffect } from 'react';
import { X, Send, Download, Info, User } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import './ParticipantsModal.css';

const ParticipantsModal = ({ event, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");

 // În interiorul ParticipantsModal.jsx
useEffect(() => {
  const fetchParticipants = async () => {
    try {
      setLoading(true);
      // MODIFICARE: Folosește calea corectă din EventController-ul tău
      const response = await api.get(`/events/${event.id}/participants`); //
      setParticipants(response.data);
    } catch (error) {
      console.error("Eroare la încărcarea participanților:", error);
      toast.error("Nu s-a putut încărca lista.");
    } finally {
      setLoading(false);
    }
  };

  if (event?.id) fetchParticipants();
}, [event.id]);

 const handleSendNotification = async () => {
  if (!announcement.trim()) return toast.error("Scrie un mesaj!");
  try {
    // MODIFICARE: URL-ul este /api/events/{id}/notify conform codului tău Java
    await api.post(`/events/${event.id}/notify`, { 
      message: announcement 
    }); //
    
    toast.success("Notificare trimisă cu succes!");
    setAnnouncement("");
  } catch (error) {
    toast.error("Eroare la trimiterea notificării.");
  }
};

  const exportToCSV = () => {
    // Logica de export simplificată
    const headers = ["Nume", "Email", "Facultate", "An"];
    const rows = participants.map(p => [`${p.firstName} ${p.lastName}`, p.email, p.faculty, p.yearOfStudy]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participanti_${event.title}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Listă exportată!");
  };

  return (
    <div className="pm-overlay">
      <div className="pm-modal">
        {/* Header Modal */}
        <div className="pm-header">
          <div className="pm-header-info">
            <h2>{event.title}</h2>
            <p>Management Participanți ({participants.length})</p>
          </div>
          <button className="pm-close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="pm-body">
          {/* Partea Stângă - Lista Studenți */}
          <div className="pm-list-section">
            <div className="pm-list-header">
              <h3>LISTĂ STUDENȚI</h3>
              <button className="pm-export-btn" onClick={exportToCSV}>
                <Download size={16} /> EXPORT CSV
              </button>
            </div>

            <div className="pm-table-container">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>FACULTATE</th>
                    <th>AN</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3">Se încarcă...</td></tr>
                  ) : participants.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="pm-student-cell">
                          <span className="pm-name">{p.firstName} {p.lastName}</span>
                          <span className="pm-email">{p.email}</span>
                        </div>
                      </td>
                      <td><span className="pm-faculty-badge" style={{color:'black'}}>{p.studentFaculty}</span></td>
                      <td style={{color:'black'}}>{p.studentYear}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Partea Dreaptă - Sidebar Anunț Rapid */}
          <div className="pm-sidebar">
            <div className="pm-announcement-box">
              <div className="pm-box-title">
                <Send size={16} /> ANUNȚ RAPID
              </div>
              <textarea 
                placeholder="Scrie un mesaj important pentru toți participanții..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
              <button className="pm-send-btn" onClick={handleSendNotification}>
                TRIMITE NOTIFICARE
              </button>
            </div>
                <div className="pm-info-box">
              <div className="pm-info-title"><Info size={16} style={{color:'blue'}}/> INFO</div>
              <p>Notificările sunt trimise instantaneu pe site și apar în meniul de notificări al fiecărui student înscris.</p>
            </div>
           
          </div>
          
        </div>
        
      </div>
    </div>
  );
};

export default ParticipantsModal;