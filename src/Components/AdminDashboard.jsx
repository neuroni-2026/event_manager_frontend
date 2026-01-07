import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';
import Swal from 'sweetalert2';
import EventCard from './EventCard';

import { 
  FaArrowLeft, FaCheck, FaTimes, FaTrash, 
  FaUsers, FaChartBar, FaStar, FaDownload, FaBan, FaHistory, 
  FaClock, FaRegCalendarCheck, FaLayerGroup, FaRegCommentDots, 
  FaBriefcase, FaUserShield, FaUserMinus, FaPause, FaPlay, FaUnlock 
} from 'react-icons/fa';
import { HiOutlineOfficeBuilding } from "react-icons/hi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals');
const handleClick = () => { if (id) navigate(`/event_detalii/${id}`); };
 
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [orgRequests, setOrgRequests] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState({
  topOrganizers: [],
  categoryStats: [] 
});
const fetchReports = async () => {
  try {
    const response = await api.get('/admin/reports');
    const data = response.data;
    console.log("Datele primite de la server:", data); 

  
    const categoryArray = Object.entries(data.eventsByCategory || {}).map(([name, count]) => ({
      category: name,
      count: count,
     
      percentage: data.totalEvents > 0 ? ((count / data.totalEvents) * 100).toFixed(1) : 0
    }));

  
    const statsRes = await api.get('/admin/organizers/stats');
    
    const topOrgArray = (statsRes.data || [])
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);

    setReports({
      ...data,
      categoryStats: categoryArray, 
      topOrganizers: topOrgArray    
    });
  } catch (err) {
    console.error("Eroare la încărcare:", err);
    toast.error("Nu s-au putut încărca statisticile.");
  }
};
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'approvals':
          const resApp = await api.get('/admin/pending-events');
          setPendingEvents(resApp.data);
          break;
        case 'requests':
          const resReq = await api.get('/admin/organizer-requests');
          setOrgRequests(resReq.data);
          break;
        case 'organizers':
          const resOrg = await api.get('/admin/organizers/stats');
          setOrganizers(resOrg.data);
          break;
        case 'events':
          const resEv = await api.get('/admin/all-events');
          setAllEvents(resEv.data);
          break;
        case 'reviews':
          const resRev = await api.get('/admin/reviews');
          setReviews(resRev.data);
          break;
        case 'users':
          const resUsr = await api.get('/admin/users');
          setUsers(resUsr.data);
          break;
        case 'reports':
          const resRep = await api.get('/admin/reports');
          setReports(resRep.data);
          break;
        default: break;
      }
    } catch (err) {
      toast.error("Eroare la încărcarea datelor.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleApproveEvent = async (id) => {
    await api.put(`/admin/approve/${id}`);
    toast.success("Eveniment aprobat!");
    fetchData();
  };

  const handleRejectEvent = async (id) => {
    const { value: reason } = await Swal.fire({
      title: 'Respinge Evenimentul',
      input: 'textarea',
      inputPlaceholder: 'Motivul respingerii...',
      showCancelButton: true,
      confirmButtonColor: '#ff4757'
    });
    if (reason) {
      await api.put(`/admin/reject/${id}?reason=${encodeURIComponent(reason)}`, null);
      toast.success("Eveniment respins.");
      fetchData();
    }
  };
  const handleDeleteReview = async (reviewId) => {
    const res = await Swal.fire({
      title: 'Ștergi recenzia?',
      text: "Această acțiune nu poate fi anulată!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4757',
      cancelButtonText: 'Anulează',
      confirmButtonText: 'Da, șterge'
    });

    if (res.isConfirmed) {
      try {
        await api.delete(`/admin/reviews/${reviewId}`);
        toast.success("Recenzie ștearsă!");
        fetchData();
      } catch (err) {
        toast.error("Nu s-a putut șterge recenzia.");
      }
    }
  };

const handleToggleBan = async (id) => {
  try {
    await api.post(`/admin/organizers/${id}/ban`, {});
    toast.success("Status acces actualizat!");
    fetchData(); 
  } catch (err) {
    toast.error("Eroare la procesarea cererii.");
  }
};


const handleDowngrade = async (id) => {
  const res = await Swal.fire({
    title: 'Retrogradare',
    text: "Organizatorul va deveni STUDENT. Confirmi?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Da'
  });
  if (res.isConfirmed) {
    try {
      await api.post(`/admin/organizers/${id}/downgrade`, {});
      toast.success("Rol schimbat cu succes!");
      fetchData();
    } catch (err) {
      toast.error("Eroare la schimbarea rolului.");
    }
  }
};


const handleToggleSuspension = async (org) => {
  const isCurrentlySuspended = org.suspendedUntil && new Date(org.suspendedUntil) > new Date();

  if (isCurrentlySuspended) {
    try {
      await api.post(`/admin/organizers/${org.id}/unsuspend`);
      toast.success("Suspendare anulată!");
      fetchData();
    } catch (err) {
      toast.error("Eroare la activare.");
    }
  } else {
    const { value: days } = await Swal.fire({
      title: 'Suspendă Organizatorul',
      input: 'number',
      inputLabel: 'Zile de suspendare',
      inputValue: 7,
      showCancelButton: true
    });
    if (days) {
      try {
        await api.post(`/admin/organizers/${org.id}/suspend?days=${days}`);
        toast.success(`Suspendat pentru ${days} zile.`);
        fetchData();
      } catch (err) {
        toast.error("Eroare la suspendare.");
      }
    }
  }
};


  const handleDeleteEvent = async (id) => {
    const res = await Swal.fire({ title: 'Ștergi definitiv?', showCancelButton: true, confirmButtonColor: '#d33' });
    if (res.isConfirmed) {
      await api.delete(`/admin/events/${id}`);
      toast.success("Șters!");
      fetchData();
    }
  };

  const handleApproveOrg = async (id) => {
    await api.post(`/admin/approve-organizer/${id}`);
    toast.success("Utilizator promovat!");
    fetchData();
  };


const renderApprovals = () => (
  <div className="section-container">
    <div className="section-header">
      <h3>Evenimente în așteptarea aprobării</h3>
    </div>
    {pendingEvents.length === 0 ? (
      <p className="empty-msg">Niciun eveniment de verificat.</p>
    ) : (
      <div className="approval-list">
        {pendingEvents.map((ev) => (
          <div key={ev.id} className="approval-card">
        
            <div className="approval-img-wrapper">
              <img 
                src={ev.imageUrl || 'https://via.placeholder.com/150'} 
                alt={ev.title} 
              />
            </div>

        
            <div className="approval-content">
              <h4>{ev.title}</h4>
              <div className="approval-meta">
                <span>
                  
                  {ev.startTime ? new Date(ev.startTime).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data invalidă'}
                </span>
                <span>
                  
                  {ev.location}
                </span>
              </div>
              <p className="approval-desc">
                {ev.description?.substring(0, 160)}...
              </p>
            </div>

           
            <div className="approval-actions">
              <button 
                className="btn-view-details" 
                onClick={() => navigate(`/event_detalii/${ev.id}`)}
                title="Vezi Detalii"
              >Detalii
                </button>
              <button 
                className="btn-approve-rect" 
                onClick={() => handleApproveEvent(ev.id)}
              >
                Aprobă
              </button>
              <button 
                className="btn-reject-rect" 
                onClick={() => handleRejectEvent(ev.id)}
              >
                Respinge
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const renderOrganizers = () => (
  <div className="section-container">
    <div className="table-header-box">
      <span style={{marginRight:'30px'}}>MANAGEMENT ORGANIZATORI ACTIVI</span>
      <button className="btn-download">
        <FaDownload /> EXPORTĂ LISTA
      </button>
    </div>
    <table className="admin-table">
      <thead>
        <tr>
          <th>ORGANIZATOR</th>
          <th>STATUS</th>
          <th>EVENIMENTE / RATING</th>
          <th>ULTIMA ACTIVITATE</th>
          <th>ACȚIUNI</th>
        </tr>
      </thead>
      <tbody>
        {organizers.map((org) => {

          const isCurrentlySuspended = org.suspendedUntil && new Date(org.suspendedUntil) > new Date();
         
          const isBanned = org.isEnabled === false;

          return (
            <tr key={org.id}>
              <td>
                <div className="cell-user" style={{ display: 'flex', flexDirection: 'column' }}>
                
                  <strong>{org.firstName} {org.lastName}</strong>
                  
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {org.organizationName || "Persoană Fizică"}
                  </span>
                </div>
              </td>
              <td>
                <span
                  className={`status-pill ${
                    isBanned ? "REJECTED" : isCurrentlySuspended ? "PENDING" : "ACTIVE"
                  }`}
                >
                  {isBanned ? "BANNED" : isCurrentlySuspended ? "SUSPENDAT" : "ACTIV"}
                </span>
                
                {isCurrentlySuspended && !isBanned && (
                  <small style={{ display: "block", fontSize: "10px", marginTop: "4px", color: "#666" }}>
                    până la {new Date(org.suspendedUntil).toLocaleDateString()}
                  </small>
                )}
              </td>
              <td>
                <div className="cell-stats">
                  <strong>{org.eventCount || 0}</strong>
                
                  <span className="rating" style={{ marginLeft: '8px' }}>
                    <FaStar style={{ color: '#ffc107', marginRight: '4px' }} /> 
                    {(org.averageRating || 0).toFixed(1)}
                  </span>
                </div>
              </td>
              <td>
                <div className="cell-date">
                  <span>
                    {org.lastEventDate ? new Date(org.lastEventDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </td>
              <td>
                <div className="table-actions">
                
                  <button
                    className="btn-table-action"
                    onClick={() => handleToggleSuspension(org)}
                    title={isCurrentlySuspended ? "Anulează Suspendarea" : "Suspendă"}
                  >
                    {isCurrentlySuspended ? <FaPlay style={{ color: "#2ecc71" }} /> : <FaPause />}
                  </button>

               
                  <button
                    className="btn-table-action"
                    onClick={() => handleDowngrade(org.id)}
                    title="Retrogradează la Student"
                  >
                    <FaUserMinus />
                  </button>

                 
                  <button
                    className="btn-table-action danger"
                    onClick={() => handleToggleBan(org.id)}
                    title={isBanned ? "Deblochează Cont" : "Blochează Cont (BAN)"}
                  >
                    {isBanned ? <FaUnlock /> : <FaBan />}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
  // 2. CERERI 
  const renderRequests = () => (
    <div className="section-container">
      <h3>Cereri de organizator</h3>
      {orgRequests.length === 0 ? <p className="empty-msg">Fără cereri noi.</p> : 
        <div className="requests-flex">
          {orgRequests.map(req => (
            <div key={req.id} className="request-card-large">
                <div className="req-header">
                  <div className="req-avatar">{req.firstName?.charAt(0)}</div>
                  <div>
                    <h4>{req.firstName} {req.lastName}</h4>
                    <span className="req-faculty">{req.studentFaculty}</span>
                  </div>
                </div>
                <div className="req-reason">
                  <strong>MOTIV SOLICITARE:</strong>
                  <p>"{req.pendingReason || 'Vreau să organizez evenimente'}"</p>
                </div>
                <div className="req-footer-actions">
                  <button className="btn-approve-full" onClick={() => handleApproveOrg(req.id)}>Aprobă</button>
                  <button className="btn-reject-lite">Respinge</button>
                </div>
            </div>
          ))}
        </div>
      }
    </div>
  );

  // 3. EVENIMENTE
  const renderEvents = () => (
    <div className="section-container">
      <h3>Evenimente publicate & respinse</h3>
      <div className="event-grid-admin">
        {allEvents.map(ev => (
          <div key={ev.id} className="admin-card-wrapper">
            <div className={`status-badge-overlay ${ev.status}`}>{ev.status}</div>
            <EventCard {...ev} date={ev.startTime} />
            <div className="admin-card-tools">
                <button className="tool-btn delete" onClick={() => handleDeleteEvent(ev.id)}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. RECENZII 
 const renderReviews = () => (
    <div className="section-container">
      <h3>Recenzii Evenimente</h3>
      <div className="reviews-list">
        {reviews.map(rev => (
          <div key={rev.id} className="review-card-admin">
            <div className="rev-header">
              <div className="stars">
                {[...Array(5)].map((_, i) => <FaStar key={i} color={i < rev.rating ? "#ffc107" : "#e4e5e9"} />)}
              </div>
              <div className="rev-actions">
                <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
             
                <button className="tool-btn delete" onClick={() => handleDeleteReview(rev.id)} style={{marginLeft: '10px', border:'none', background:'none', cursor:'pointer', color:'#ff4757'}}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="rev-text">"{rev.comment}"</p>
            <div className="rev-info">
               <strong>{rev.user?.firstName} {rev.user?.lastName}</strong>
               <span>Eveniment: {rev.event?.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 5. UTILIZATORI 
 const renderUsers = () => (
  <div className="section-container">
    <div className="table-header-box">
      <span style={{ marginRight: '30px' }}>LISTĂ UTILIZATORI & ORGANIZATORI</span>
      <button className="btn-download"><FaDownload /> EXPORT CSV</button>
    </div>
    <table className="admin-table">
      <thead>
        <tr>
          <th>UTILIZATOR</th>
          <th>ROL</th>
          <th>EMAIL</th>
          <th>STATUS</th>
          <th>ACȚIUNI</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => {
         
          const isSuspended = u.suspendedUntil && new Date(u.suspendedUntil) > new Date();
          const isBanned = u.isEnabled === false;

          return (
            <tr key={u.id}>
              <td><strong>{u.firstName} {u.lastName}</strong></td>
              <td>
               
                <span className={`role-pill ${u.role}`}>
                  {u.role}
                </span>
              </td>
              <td>{u.email}</td>
              <td>
              
                {isBanned ? (
                  <span className="user-status-pill banned">Banned</span>
                ) : isSuspended ? (
                  <span className="user-status-pill suspended">Suspended</span>
                ) : (
                  <span className="user-status-pill active">Active</span>
                )}
              </td>
              <td>
                <button 
                  className="btn-ban" 
                  onClick={() => handleToggleBan(u.id)}
                  title={isBanned ? "Deblochează" : "Blochează"}
                >
                  {isBanned ? <FaUnlock /> : <FaBan />}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

  // 6. RAPOARTE 
  const renderReports = () => {
    if(!reports) return <p className="empty-msg">Se încarcă datele statistice...</p>;
    return (
      <div className="reports-wrapper">
        <div className="reports-top-header">
           <h2>ANALIZĂ PERFORMANȚĂ SISTEM</h2>
           <button className="btn-report-download"><FaDownload /> DESCARCĂ RAPORT COMPLET (CSV)</button>
        </div>

        <div className="stats-grid-main">
           <div className="stat-card">
              <div className="icon-box blue"><FaRegCalendarCheck /></div>
              <span>TOTAL EVENIMENTE</span>
              <h2>{reports.totalEvents || 0}</h2>
           </div>
           <div className="stat-card">
              <div className="icon-box purple"><FaUsers /></div>
              <span>UTILIZATORI TOTALI</span>
              <h2>{reports.totalUsers || 0}</h2>
           </div>
           <div className="stat-card">
              <div className="icon-box orange"><FaChartBar /></div>
              <span>REZERVĂRI / EVENIMENT</span>
              <h2>{reports.reservationsPerEvent || 0}</h2>
           </div>
           <div className="stat-card">
              <div className="icon-box violet"><FaClock /></div>
              <span>EVENIMENTE PENDING</span>
              <h2>{reports.pendingEventsCount || 0}</h2>
           </div>
        </div>

        <div className="charts-grid-bottom">
           <div className="chart-container-box">
              <h4><FaUserShield /> TOP ORGANIZATORI</h4>
              {reports.topOrganizers?.map((o, i) => (
                <div key={i} className="rank-row">
                   <div className={`rank-circle ${i === 0 ? 'gold' : ''}`}>{i + 1}</div>
                   <div className="rank-info">
                      <strong>{o.name}</strong>
                      <small>{o.organization}</small>
                   </div>
                   <div className="rank-val">{o.count} <span>EVENT-URI</span></div>
                </div>
              ))}
           </div>

           <div className="chart-container-box">
              <h4><FaChartBar /> DISTRIBUȚIE PE CATEGORII</h4>
              {reports.categoryStats?.map((c, i) => (
                <div key={i} className="category-progress">
                   <div className="label"><span>{c.category}</span> <strong>{c.count} evenimente ({c.percentage}%)</strong></div>
                   <div className="bar-bg"><div className="bar-fill" style={{width: `${c.percentage}%`}}></div></div>
                </div>
              ))}
           </div>

           <div className="chart-container-box">
              <h4><FaChartBar /> ACTIVITATE LUNARĂ</h4>
              <div className="activity-month-card">
                 <div className="dot">●</div>
                 <span>JANUARY 2026</span>
                 <div className="count-pill">{reports.totalEvents || 0} evenimente</div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-header-nav">
          <div className="logo-section">
             <button onClick={() => navigate(-1)} className="back-btn">←</button>
             <div className="header-text">
                <h1>Panou admin</h1>
                <p>Gestionează evenimente, utilizatori și analize de sistem</p>
             </div>
          </div>
      </div>

      <div className="tab-pill-container">
          <div className="nav-tabs-pill">
            <button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => setActiveTab('approvals')}>
              <FaRegCalendarCheck /> Aprobări
            </button>
            <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
              <FaBriefcase /> Cereri
            </button>
            <button className={activeTab === 'organizers' ? 'active' : ''} onClick={() => setActiveTab('organizers')}>
              <HiOutlineOfficeBuilding /> Organizatori
            </button>
            <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
              <FaLayerGroup /> Evenimente
            </button>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
              <FaRegCommentDots /> Recenzii
            </button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              <FaUsers /> Utilizatori
            </button>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
              <FaChartBar /> Rapoarte
            </button>
          </div>
      </div>

      <div className="admin-main-content">
        {loading ? <div className="loader">Se încarcă...</div> : (
          <div className="content-fade-in">
            {activeTab === 'approvals' && renderApprovals()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'organizers' && renderOrganizers()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'reports' && renderReports()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;