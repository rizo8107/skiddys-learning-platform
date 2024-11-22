import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'John Doe',
    rating: 5,
    date: '2 days ago',
    comment: 'Excellent course! The content is well-structured and easy to follow.'
  },
  {
    id: '2',
    author: 'Jane Smith',
    rating: 4.5,
    date: '1 week ago',
    comment: 'Very informative and practical. Would recommend to others.'
  }
];

export const CourseReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      author: 'You', // In a real app, this would come from user authentication
      rating,
      date: 'Just now',
      comment: comment.trim()
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setComment('');
  };

  const renderStars = (value: number, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? hoveredRating || rating : value;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            onMouseEnter={() => setHoveredRating(i)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(i)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                i <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-400'
              }`}
            />
          </button>
        );
      } else {
        if (i <= fullStars) {
          stars.push(
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          );
        } else if (i === Math.ceil(displayRating) && hasHalfStar) {
          stars.push(
            <StarHalf key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          );
        } else {
          stars.push(
            <Star key={i} className="w-4 h-4 text-gray-400" />
          );
        }
      }
    }

    return stars;
  };

  const getAverageRating = () => {
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Course Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {renderStars(parseFloat(getAverageRating()))}
          </div>
          <span className="text-gray-400">({getAverageRating()})</span>
        </div>
      </div>
      
      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
            {renderStars(rating, true)}
          </div>
          {rating > 0 && (
            <span className="text-sm text-gray-400">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </span>
          )}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this course..."
          className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={rating === 0 || !comment.trim()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </form>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-medium">{review.author}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className="text-sm text-gray-400">{review.date}</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
