import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import api from '../services/api';
import './ReviewsModal.css';

const ReviewsModal = ({ event, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Endpoint pentru a lua recenziile evenimentului
        const response = await api.get(`/reviews/event/${event.id}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Eroare la încărcarea recenziilor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (event?.id) fetchReviews();
  }, [event.id]);

  return (
    <div className="rm-overlay">
      <div className="rm-modal">
        {/* Header Modal */}
        <div className="rm-header">
          <div className="rm-header-info">
            <h2>Feedback Studenți</h2>
            <p>Recenzii primite la eveniment</p>
          </div>
          <button className="rm-close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="rm-body">
          {loading ? (
            <div className="rm-loader">Se încarcă recenziile...</div>
          ) : reviews.length > 0 ? (
            <div className="rm-reviews-list">
              {reviews.map((rev) => (
                <div key={rev.id} className="rm-review-card">
                  <div className="rm-review-top">
                    <span className="rm-reviewer">{rev.userName}</span>
                    <div className="rm-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < rev.rating ? "#eab308" : "none"} 
                          color={i < rev.rating ? "#eab308" : "#cbd5e1"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="rm-comment">{rev.comment}</p>
                  <span className="rm-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            /* --- EMPTY STATE (Conform image_8c2c23.png) --- */
            <div className="rm-empty-container">
              <div className="rm-empty-card">
                <div className="rm-star-circle">
                  <Star size={40} fill="#eab308" color="#eab308" />
                </div>
                <h3>Nicio recenzie încă</h3>
                <p>Feedback-ul studenților va apărea aici după eveniment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;