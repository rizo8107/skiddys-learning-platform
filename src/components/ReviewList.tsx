import React from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, Review, getCurrentUser } from '../lib/pocketbase';

interface ReviewListProps {
  courseId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ courseId }) => {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => reviewService.getAll(courseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: { course: string; rating: number; comment: string }) =>
      reviewService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
      setComment('');
      setRating(5);
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : 'Failed to create review');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating: number; comment: string } }) =>
      reviewService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
      setIsEditing(false);
      setEditingReview(null);
      setComment('');
      setRating(5);
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : 'Failed to update review');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : 'Failed to delete review');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to create a review');
      return;
    }

    if (isEditing && editingReview) {
      updateMutation.mutate({
        id: editingReview.id,
        data: {
          rating,
          comment,
        },
      });
    } else {
      createMutation.mutate({
        course: courseId,
        rating,
        comment,
      });
    }
  };

  const handleEdit = (review: Review) => {
    if (!currentUser) {
      alert('You must be logged in to edit a review');
      return;
    }
    setIsEditing(true);
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = (reviewId: string) => {
    if (!currentUser) {
      alert('You must be logged in to delete a review');
      return;
    }
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(reviewId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Course Reviews</h2>
        <div className="text-center text-gray-400">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Course Reviews</h2>

      {/* Review Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Update Review' : 'Submit Review'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingReview(null);
                setComment('');
                setRating(5);
              }}
              className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <div className="mb-8 text-center text-gray-400">
          Please log in to leave a review
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="flex">{renderStars(review.rating)}</div>
                <div className="flex flex-col">
                  <span className="text-blue-400 font-medium">
                    {review.expand?.user?.username || 'Anonymous'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(review.created).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {currentUser?.id === review.user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-white mt-2">{review.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-400">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};
