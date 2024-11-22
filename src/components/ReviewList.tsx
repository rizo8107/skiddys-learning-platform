import React from 'react';
import { Star, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, Review, getCurrentUser, User, getFileUrl, pb } from '../lib/pocketbase';

interface ReviewListProps {
  courseId: string;
}

interface ReviewWithUser extends Review {
  expand?: {
    user: User;
  };
}

export const ReviewList: React.FC<ReviewListProps> = ({ courseId }) => {
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<ReviewWithUser | null>(null);
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

  const handleEdit = (review: ReviewWithUser) => {
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
            className="bg-gray-700 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start space-x-4">
              {review.expand?.user?.avatar ? (
                <img
                  src={pb.files.getUrl(review.expand.user, review.expand.user.avatar)}
                  alt={review.expand.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {review.expand?.user?.name || 'Anonymous'}
                    </h4>
                    <div className="mt-1 flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  {currentUser && review.user === currentUser.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-gray-300">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-400">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};
