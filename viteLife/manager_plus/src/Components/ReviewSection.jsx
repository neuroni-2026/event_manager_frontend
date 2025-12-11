import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ReviewSection.css'; 

const ReviewSection = ({ eventId, userRole }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);


  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/event/${eventId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Eroare la incarcarea recenziilor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        eventId: eventId,
        rating: newRating,
        comment: newComment
      });

 
      setNewComment('');
      setNewRating(5);
      await fetchReviews();
      alert("Recenzie adăugată!");

    } catch (error) {
      console.error("Eroare la adaugare review:", error);
      alert(error.response?.data?.message || "Eroare la trimitere.");
    } finally {
      setSubmitting(false);
    }
  };

 
  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <span 
          key={index} 
          className={`star ${starValue <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && setNewRating(starValue)}
        >
          ★
        </span>
      );
    });
  };

  return (
    <div className="review-section">
      <h3>Recenzii ({reviews.length})</h3>

 
      {userRole === 'STUDENT' && (
        <div className="add-review-box">
          <h4>Spune-ți părerea</h4>
          <form onSubmit={handleSubmit}>
            <div className="rating-select">
              <label>Nota ta:</label>
              <div className="stars-input">
                {renderStars(newRating, true)}
              </div>
            </div>
            <textarea 
              placeholder="Scrie o recenzie despre acest eveniment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows="3"
            />
            <button type="submit" className="submit-review-btn" disabled={submitting}>
              {submitting ? 'Se trimite...' : 'Posteaza Recenzia'}
            </button>
          </form>
        </div>
      )}


      <div className="reviews-list">
        {loading ? (
          <p>Se incarca recenziile...</p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">Fii primul care lasa o recenzie!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
              
                <span className="reviewer-name">{review.studentName || "Student"}</span>
                <span className="review-date">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <p className="review-text">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;