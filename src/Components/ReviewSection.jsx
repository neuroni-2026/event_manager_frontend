import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ReviewSection.css'; 
import { toast } from 'react-hot-toast';
import Circle from '../Icons/circle.png'; 


const ReviewSection = ({ eventId, userRole }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [hoverRating, setHoverRating] = useState(0); 
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchReviews = async () => {
            if (!eventId) return;
            try {
                const res = await api.get(`/reviews/event/${eventId}`);
                console.log("DEBUG - Date primite de la server:", res.data); 
                setReviews(res.data);
            } catch (error) {
                console.error("Eroare incarcare recenzii", error);
            }
        };
        fetchReviews();
    }, [eventId]);

  
    const getReviewerName = (review) => {
 
        if (review.reviewer) {
            const { firstName, lastName } = review.reviewer;
            if (firstName || lastName) {
                return `${firstName || ''} ${lastName || ''}`.trim();
            }
        }

      
        if (review.userName) return review.userName;

       
        if (review.studentName) return review.studentName;
        
        
        if (review.firstName) return `${review.firstName} ${review.lastName || ''}`;

        return "Student USV"; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (userRole !== 'STUDENT') {
            toast.error("Doar studenții pot lăsa recenzii.");
            return;
        }
        if (newReview.rating === 0) {
            toast.error("Te rog selectează un rating.");
            return;
        }

        try {
            setLoading(true);

            
            const payload = {
                eventId: parseInt(eventId), 
                rating: newReview.rating,
                comment: newReview.comment
            };

            await api.post('/reviews', payload);
            
       
    
            const userStr = localStorage.getItem('user');
            let currentUser = { firstName: 'Eu', lastName: '' };
            if (userStr) {
                currentUser = JSON.parse(userStr);
            }

            const optimisticReview = {
                id: Date.now(), 
                studentName: `${currentUser.firstName} ${currentUser.lastName}`, 
                firstName: currentUser.firstName, 
                lastName: currentUser.lastName,
                rating: newReview.rating,
                comment: newReview.comment,
                createdAt: new Date().toISOString()
            };

            setReviews([...reviews, optimisticReview]);
            setNewReview({ rating: 0, comment: '' });
            toast.success("Recenzie adăugată!");

        } catch (error) {
            console.error("Eroare postare:", error);
           
            if (error.response) {
                if (error.response.status === 400 || error.response.status === 409) {
                    toast.error("Ai lăsat deja o recenzie la acest eveniment!");
                } else if (error.response.status === 401) {
                    toast.error("Sesiune expirată. Reloghează-te.");
                } else {
                    toast.error(`Eroare: ${error.response.data.message || 'Nu s-a putut trimite.'}`);
                }
            } else {
                toast.error("Eroare de rețea.");
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const isFilled = interactive 
                ? starValue <= (hoverRating || newReview.rating)
                : starValue <= rating;
            
            return (
                <span
                    key={index}
                    className={`star ${isFilled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={() => interactive && setNewReview({ ...newReview, rating: starValue })}
                    onMouseEnter={() => interactive && setHoverRating(starValue)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                >
                    ★
                </span>
            );
        });
    };

    const formatDate = (isoDate) => {
        if(!isoDate) return 'Acum';
        return new Date(isoDate).toLocaleDateString('ro-RO'); 
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    return (
        <div className="reviews-section-container" style={{panding:"0px", border:"1px solid rgba(192, 192, 192, 1)"}}>
            
        
            {userRole === 'STUDENT' && (
                <div className="review-form-card">
                    <h3 className="section-title" style={{fontWeight:"700"}}>Adaugă recenzia ta</h3>
                    
                    <div className="form-group">
                        <label className="form-label" style={{fontSize:"16px", fontWeight:"700"}}>Rating</label>
                        <div className="stars-input">
                            {renderStars(newReview.rating, true)}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{fontSize:"16px"}}>Recenzia ta</label>
                        <textarea style={{border:"2px solid black"}}
                            className="review-textarea"
                            placeholder="Împărtășește experiența ta..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            rows="4"
                        />
                    </div>

                    <button 
                        className="submit-review-btn" 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Se trimite...' : 'Trimite recenzia'}
                    </button>
                </div>
            )}

           
            <div className="reviews-list-card">
                <div className="reviews-header">
                    <h3 className="section-title" style={{fontSize:"18px", margin:"0"}}>Recenzii</h3>
                    <div className="rating-summary">
                        <span className="star-icon-yellow">★</span>
                        <span className="avg-score">{averageRating}</span>
                        <span className="total-reviews">({reviews.length} recenzii)</span>
                    </div>
                </div>

                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id || Math.random()} className="review-item">
                                <div className="review-avatar">
                                    <img src={Circle} alt="User" />
                                </div>
                                <div className="review-content">
                                    <div className="review-top-row">
                                        <h4 className="reviewer-name">
                                            
                                            {getReviewerName(review)}
                                        </h4>
                                        <span className="review-date">
                                            {formatDate(review.createdAt || review.date)}
                                        </span>
                                    </div>
                                    <div className="review-stars-static">
                                        {renderStars(review.rating, false)}
                                    </div>
                                    <p className="review-text">{review.comment || review.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews-text">Nu există recenzii încă. Fii primul!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;