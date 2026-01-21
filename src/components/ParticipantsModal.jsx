import React, { useState, useEffect } from 'react';
import { X, Send, Download, Info } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const ParticipantsModal = ({ event, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${event.id}/participants`);
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
      await api.post(`/events/${event.id}/notify`, {
        message: announcement
      });
      toast.success("Notificare trimisă cu succes!");
      setAnnouncement("");
    } catch (error) {
      toast.error("Eroare la trimiterea notificării.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Nume", "Email", "Facultate", "An"];
    const rows = participants.map(p => [`${p.firstName} ${p.lastName}`, p.email, p.studentFaculty || "N/A", p.studentYear || "N/A"]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participanti_${event.title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Listă exportată!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] backdrop-blur-sm p-8">
      <div className="bg-card w-full max-w-6xl h-[85vh] rounded-[30px] flex flex-col overflow-hidden shadow-2xl relative px-4 border border-gray-100 dark:border-gray-800">
        
        <button 
            className="absolute top-6 right-6 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white p-2 rounded-full transition-colors z-10" 
            onClick={onClose}
        >
            <X size={24} strokeWidth={2.5} />
        </button>

        {/* Header Section */}
        <div className="px-8 pt-14 pb-0 shrink-0">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{event.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Management Participanți ({participants.length})</p>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Student List */}
          <div className="flex-[2] px-8 py-4 overflow-y-auto border-t border-gray-100 dark:border-gray-800 lg:border-t-0">
            
            {/* List Header & Export */}
            <div className="flex justify-between items-end mb-6 mt-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">LISTĂ STUDENȚI</h3>
              
              <button 
                className="flex items-center gap-2 bg-[#1a1a1a] dark:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg hover:bg-black dark:hover:bg-gray-700 transition-colors shadow-lg shadow-gray-200 dark:shadow-black/20" 
                onClick={exportToCSV}
              >
                <Download size={16} strokeWidth={3} /> 
                EXPORT CSV
              </button>
            </div>

            <div className="w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-3 border-b border-gray-100 dark:border-gray-800">STUDENT</th>
                    <th className="text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-3 border-b border-gray-100 dark:border-gray-800 pl-4">FACULTATE</th>
                    <th className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-3 border-b border-gray-100 dark:border-gray-800 hidden sm:table-cell">AN</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="py-10 text-center text-gray-400 animate-pulse">Se încarcă lista...</td></tr>
                  ) : participants.length === 0 ? (
                    <tr><td colSpan="3" className="py-10 text-center text-gray-400">Niciun participant înscris.</td></tr>
                  ) : participants.map((p) => (
                    <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 border-b border-gray-50 dark:border-gray-800">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#ff5722] text-[15px] group-hover:text-[#f4511e] transition-colors">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{p.email}</span>
                        </div>
                      </td>
                      <td className="py-4 border-b border-gray-50 dark:border-gray-800 pl-4">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">{p.studentFaculty || "—"}</span>
                      </td>
                      <td className="py-4 border-b border-gray-50 dark:border-gray-800 text-center hidden sm:table-cell">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">{p.studentYear || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Sidebar Actions */}
          <div className="flex-1 p-8 lg:pl-0 lg:pr-8 flex flex-col gap-2 overflow-y-auto bg-card lg:max-w-md">
            
            
            <div className="bg-[#2a3547] dark:bg-gray-800/50 rounded-[30px] p-[20px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.3)] border border-white/5">
             
              <div className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                <Send size={16} /> ANUNȚ RAPID
              </div>
              <textarea
                placeholder="Scrie un mesaj important pentru toți participanții..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full h-[100px] bg-[#1e293b] dark:bg-gray-900 border border-[#334155] dark:border-gray-700 rounded-xl p-[12px] text-white resize-none mb-2 outline-none text-sm placeholder:text-slate-500"
              />
            
              <button 
                className="w-full bg-primary text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-orange-600 transition-colors shadow-md active:scale-95 cursor-pointer border-none" 
                onClick={handleSendNotification}
              >
                TRIMITE NOTIFICARE
              </button>
            </div>
            
            {/* Info Box */}
            <div className="bg-[#eff6ff] dark:bg-blue-900/20 rounded-[20px] p-4 flex gap-3 items-start border border-blue-100 dark:border-blue-900/30 mt-3">
               <Info size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"/>
               <div>
                  <div className="text-blue-700 font-bold text-[11px] uppercase tracking-wide mb-1">
                    INFO
                  </div>
                  <p className="text-[12px] text-blue-800 dark:text-blue-200 leading-relaxed">
                    Notificările sunt trimise instantaneu pe site și apar în meniul de notificări al fiecărui student înscris.
                  </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;