import React from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { useReviewStore } from '../../store/reviewStore';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  courseId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ courseId }) => {
  const reviews = useReviewStore((state) => state.getReviewsByCourse(courseId));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Course Reviews ({reviews.length})
          </h3>
          <div className="mt-1 flex items-center">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`w-5 h-5 ${
                    value <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-700">
              {averageRating.toFixed(1)} out of 5
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-start space-x-4">
              <img
                src={`https://i.pravatar.cc/40?u=${review.userId}`}
                alt="Reviewer"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      User {review.userId.slice(0, 8)}
                    </h4>
                    <div className="mt-1 flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`w-4 h-4 ${
                            value <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-700">{review.content}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful
                  </button>
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};