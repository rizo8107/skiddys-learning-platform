import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { useReviewStore, Review } from '../../store/reviewStore';
import { useUserStore } from '../../store/userStore';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10, 'Review must be at least 10 characters'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  courseId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ courseId, onSuccess }) => {
  const { currentUser } = useUserStore();
  const { addReview } = useReviewStore();
  const [hoveredRating, setHoveredRating] = React.useState(0);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: '',
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    if (!currentUser) return;

    const review: Review = {
      id: crypto.randomUUID(),
      courseId,
      userId: currentUser.id,
      rating: data.rating,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addReview(review);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('rating', value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  value <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Review
        </label>
        <textarea
          id="content"
          rows={4}
          {...register('content')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};