import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import DefaultImage from '../Images/usv.jpg'; 
import './EventCard.css';

const EventCard = ({ 
    id, 
    title, 
    description, 
    location, 
    date, 
    imageUrl, 
    category, 
    occupiedSeats,    // Primim prop-ul
    participantCount, // Verificăm și varianta din DTO-ul de backend
    maxCapacity,
    onEdit,    
    onDelete   
}) => {
    const navigate = useNavigate();

    // --- LOGICA ACTUALIZARE LOCURI ---
    // Verificăm care dintre câmpuri este populat de la părinte/API
    const displayOccupied = occupiedSeats ?? participantCount ?? 0;
    // ---------------------------------

    const categoryStyles = {
        ACADEMIC: { bg: '#eff6ff', color: '#3b82f6' },
        SOCIAL: { bg: '#fff7ed', color: '#f97316' },
        SPORT: { bg: '#f0fdf4', color: '#16a34a' },
        VOLUNTEERING: { bg: '#fff1f2', color: '#e11d48' },
        CAREER: { bg: '#faf5ff', color: '#9333ea' },
        OTHER: { bg: '#f3f4f6', color: '#6b7280' }
    };
    
    const currentStyle = categoryStyles[category?.toUpperCase()] || categoryStyles.OTHER;
    const d = new Date(date);
    const formattedDate = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

    const handleClick = () => { if (id) navigate(`/event_detalii/${id}`); };

    const safeMaxCapacity = maxCapacity && maxCapacity > 0 ? maxCapacity : 1; 
    // Folosim displayOccupied pentru progres
    const progressPercentage = Math.min((displayOccupied / safeMaxCapacity) * 100, 100);

    return (
        <div className="ec-container" onClick={handleClick} style={{borderRadius:'20px'}}>
            <div className="ec-media">
                <img 
                    src={imageUrl || DefaultImage} 
                    alt={title} 
                    className="ec-img" 
                    onError={(e) => {e.target.src = DefaultImage}} 
                />
                
                <div 
                    className="ec-badge-category" 
                    style={{ backgroundColor: currentStyle.bg, color: currentStyle.color}}
                >
                    {category || 'Event'}
                </div>

                {(onEdit || onDelete) && (
                    <div className="ec-admin-overlay" onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                            <button className="ec-admin-btn edit" onClick={onEdit} title="Editează">
                                <Pencil size={16} />
                            </button>
                        )}
                        {onDelete && (
                            <button className="ec-admin-btn delete" onClick={() => onDelete(id)} title="Șterge">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            <div className="ec-body">
                <h2 className="ec-title">{title || "Titlu Eveniment"}</h2>
                
                <p className="ec-description">
                    {description 
                        ? (description.length > 120 ? description.substring(0, 120) + "..." : description)
                        : "Fără descriere disponibilă."}
                </p>

                <div className="ec-info-list">
                    <div className="ec-info-item">
                        <div className="ec-icon-circle blue-light">
                            <Calendar size={16} color="#4a90e2" />
                        </div>
                        <span>{formattedDate}</span>
                    </div>
                    
                    <div className="ec-info-item">
                        <div className="ec-icon-circle red-light">
                            <Clock size={16} color="#ff6b6b" />
                        </div>
                        <span>{formattedTime}</span>
                    </div>
                    
                    <div className="ec-info-item">
                        <div className="ec-icon-circle blue-light">
                            <MapPin size={16} color="#4a90e2" />
                        </div>
                        <span>{location || 'Online'}</span>
                    </div>
                </div>

                <div className="ec-capacity-section">
                    <div className="ec-capacity-header">
                        <span className="ec-capacity-label">LOCURI OCUPATE</span>
                        <span className="ec-capacity-value">
                            {/* Afișăm valoarea calculată */}
                            {displayOccupied} / {maxCapacity || '∞'} 
                        </span>
                    </div>
                    <div className="ec-progress-bar">
                        <div 
                            className="ec-progress-fill" 
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <button className="ec-details-btn">
                    VEZI DETALII <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default EventCard;