import { create } from 'zustand';

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  reviews: Record<string, Review[]>;
  addReview: (review: Review) => void;
  updateReview: (review: Review) => void;
  deleteReview: (reviewId: string, courseId: string) => void;
  getReviewsByCourse: (courseId: string) => Review[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: {},
  addReview: (review) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [review.courseId]: [
          ...(state.reviews[review.courseId] || []),
          review,
        ],
      },
    })),
  updateReview: (review) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [review.courseId]: state.reviews[review.courseId].map((r) =>
          r.id === review.id ? review : r
        ),
      },
    })),
  deleteReview: (reviewId, courseId) =>
    set((state) => ({
      reviews: {
        ...state.reviews,
        [courseId]: state.reviews[courseId].filter((r) => r.id !== reviewId),
      },
    })),
  getReviewsByCourse: (courseId) => get().reviews[courseId] || [],
}));