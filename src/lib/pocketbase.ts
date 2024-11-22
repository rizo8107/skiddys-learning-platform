import PocketBase, { Record, ClientResponseError } from 'pocketbase';

export const pb = new PocketBase('https://content.skiddytamil.in');

// Collection Types
export interface User extends Record {
    name: string;
    username: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    email?: string;
}

export interface Course extends Record {
    course_title: string;
    description: string;
    thumbnail?: string;
    instructor: string;
    duration?: string;
    level?: string;
    prerequisites?: string[];
    skills?: string[];
    expand?: {
        instructor?: User;
    };
}

export interface LessonResource extends Record {
    lesson: string;
    resource_title: string;
    resource_file: string;
    resource_type: 'document' | 'video' | 'exercise' | 'other';
    resource_description?: string;
}

export interface Lesson extends Record {
    lessons_title: string;
    description?: string;
    course: string;
    videoUrl: string;
    order: number;
    completed?: boolean;
    duration?: string;
    objectives?: string[];
    expand?: {
        resources?: LessonResource[];
    };
}

export interface Review {
    id: string;
    course: string;
    user: string;
    rating: number;
    comment: string;
    created: string;
    updated: string;
    expand?: {
        user: {
            username: string;
            id: string;
        };
    };
}

export interface Enrollment extends Record {
    user: string;
    course: string;
    progress: number;
    completedLessons?: string[];
}

export interface Settings extends Record {
    // Add settings properties here
}

// Error Handling
const handlePocketbaseError = (error: unknown) => {
    if (error instanceof ClientResponseError) {
        // Handle specific PocketBase errors
        switch (error.status) {
            case 400:
                throw new Error('Invalid request. Please check your input.');
            case 401:
                throw new Error('Please log in to access this resource.');
            case 403:
                throw new Error('You do not have permission to access this resource.');
            case 404:
                throw new Error('The requested resource was not found.');
            case 429:
                throw new Error('Too many requests. Please try again later.');
            default:
                throw new Error('An unexpected error occurred.');
        }
    }
    throw error;
};

// Course Services
export const courseService = {
    async getAll(): Promise<Course[]> {
        try {
            let records;
            
            if (isAdmin()) {
                // Admin sees all courses
                records = await pb.collection('courses').getFullList({
                    sort: '-created',
                    expand: 'instructor'
                });
            } else {
                // Regular users only see courses they have access to
                const userId = pb.authStore.model?.id;
                if (!userId) return [];

                const user = await pb.collection('users').getOne(userId);
                const accessibleCourseIds = user.course_access || [];

                if (accessibleCourseIds.length === 0) return [];

                // Only fetch courses that are both enabled and in the user's course_access array
                records = await pb.collection('courses').getFullList({
                    filter: `id ?= "${accessibleCourseIds.join('" || id ?= "')}" && enabled = true`,
                    sort: '-created',
                    expand: 'instructor'
                });
            }

            // Process thumbnails for each course
            return records.map(record => ({
                ...record,
                thumbnail: record.thumbnail 
                  ? pb.files.getUrl(record, record.thumbnail, { thumb: '100x100' })
                  : null
            }));
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    },

    async getOne(id: string): Promise<Course | null> {
        try {
            const record = await pb.collection('courses').getOne(id, {
                expand: 'instructor'
            });
            return {
                ...record,
                thumbnail: record.thumbnail 
                    ? pb.files.getUrl(record, record.thumbnail, { thumb: '100x100' })
                    : null
            };
        } catch (error) {
            console.error('Error fetching course:', error);
            return null;
        }
    },

    async create(data: Partial<Course>): Promise<Course> {
        try {
            const record = await pb.collection('courses').create(data);
            return record as Course;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    },

    async update(id: string, data: Partial<Course>): Promise<Course> {
        try {
            const record = await pb.collection('courses').update(id, data);
            return record as Course;
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection('courses').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    },
};

// Lesson Services
export const lessonService = {
    async getAll(courseId: string): Promise<Lesson[]> {
        try {
            const records = await pb.collection('lessons').getList(1, 100, {
                filter: `course = "${courseId}"`,
                sort: 'order',
                expand: 'course',
            });
            return records.items as Lesson[];
        } catch (error) {
            console.error('Error fetching lessons:', error);
            return [];
        }
    },

    async getOne(id: string): Promise<Lesson | null> {
        try {
            const record = await pb.collection('lessons').getOne(id, {
                expand: 'course',
            });
            return record as Lesson;
        } catch (error) {
            console.error('Error fetching lesson:', error);
            return null;
        }
    },

    async create(data: Partial<Lesson>): Promise<Lesson> {
        try {
            const record = await pb.collection('lessons').create(data);
            return record as Lesson;
        } catch (error) {
            console.error('Error creating lesson:', error);
            throw error;
        }
    },

    async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
        try {
            const record = await pb.collection('lessons').update(id, data);
            return record as Lesson;
        } catch (error) {
            console.error('Error updating lesson:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection('lessons').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting lesson:', error);
            throw error;
        }
    },
};

// Lesson Resource Services
export const lessonResourceService = {
    async getAll(lessonId: string): Promise<LessonResource[]> {
        if (!lessonId) {
            console.error('No lesson ID provided to getAll');
            return [];
        }

        try {
            console.log('Fetching resources for lesson:', lessonId);
            
            // First verify the lesson exists
            const lessonExists = await pb.collection('lessons').getOne(lessonId).catch(() => null);
            if (!lessonExists) {
                console.error('Lesson not found:', lessonId);
                return [];
            }

            const records = await pb.collection('lesson_resources').getFullList({
                filter: `lesson = "${lessonId}"`,
                sort: 'created',
            });

            console.log('Fetched resources:', records);
            
            // Validate the records structure
            const validRecords = records.map(record => {
                if (!record.resource_file || !record.resource_title) {
                    console.warn('Invalid resource record:', record);
                }
                return record;
            });

            return validRecords as LessonResource[];
        } catch (error) {
            console.error('Error fetching resources:', error);
            if (error instanceof ClientResponseError) {
                console.error('PocketBase error details:', {
                    status: error.status,
                    data: error.data,
                    message: error.message
                });
            }
            throw new Error('Failed to fetch lesson resources: ' + (error as Error).message);
        }
    },

    async create(data: { 
        lesson: string;
        resource_title: string;
        resource_file: File;
        resource_type: LessonResource['resource_type'];
        resource_description?: string;
    }): Promise<LessonResource> {
        try {
            const formData = new FormData();
            formData.append('lesson', data.lesson);
            formData.append('resource_title', data.resource_title);
            formData.append('resource_file', data.resource_file);
            formData.append('resource_type', data.resource_type);
            if (data.resource_description) {
                formData.append('resource_description', data.resource_description);
            }

            const record = await pb.collection('lesson_resources').create(formData);
            return record as LessonResource;
        } catch (error) {
            handlePocketbaseError(error);
            throw error;
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection('lesson_resources').delete(id);
            return true;
        } catch (error) {
            handlePocketbaseError(error);
            return false;
        }
    },

    getFileUrl(record: LessonResource): string {
        if (!record?.id || !record.resource_file) {
            console.error('Invalid resource record for file URL:', record);
            return '';
        }

        try {
            const baseUrl = pb.baseUrl;
            const collectionId = 'lesson_resources';
            const recordId = record.id;
            const fileName = record.resource_file;

            // Construct the file URL
            const fileUrl = `${baseUrl}/api/files/${collectionId}/${recordId}/${fileName}`;
            console.log('Generated file URL:', fileUrl);
            
            // Verify the URL is valid
            try {
                new URL(fileUrl);
            } catch (e) {
                console.error('Generated invalid URL:', fileUrl);
                return '';
            }

            return fileUrl;
        } catch (error) {
            console.error('Error generating file URL:', error);
            return '';
        }
    }
};

// Review Services
export const reviewService = {
    async getAll(courseId: string): Promise<Review[]> {
        try {
            const records = await pb.collection('reviews').getList(1, 50, {
                filter: `course = "${courseId}"`,
                sort: '-created',
                expand: 'user',
            });
            return records.items as Review[];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    async create(data: { course: string; rating: number; comment: string }): Promise<Review> {
        if (!pb.authStore.isValid) {
            throw new Error('You must be logged in to create a review');
        }

        try {
            const record = await pb.collection('reviews').create({
                ...data,
                user: pb.authStore.model?.id,
            });
            return record as Review;
        } catch (error) {
            console.error('Error creating review:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to create review');
        }
    },

    async update(id: string, data: { rating: number; comment: string }): Promise<Review> {
        if (!pb.authStore.isValid) {
            throw new Error('You must be logged in to update a review');
        }

        try {
            const record = await pb.collection('reviews').update(id, {
                rating: data.rating,
                comment: data.comment,
            });
            return record as Review;
        } catch (error) {
            console.error('Error updating review:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to update review');
        }
    },

    async delete(id: string): Promise<boolean> {
        if (!pb.authStore.isValid) {
            throw new Error('You must be logged in to delete a review');
        }

        try {
            await pb.collection('reviews').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to delete review');
        }
    },
};

// Enrollment Services
export const enrollmentService = {
    getAll: async (userId?: string) => {
        try {
            const filter = userId ? `user = "${userId}"` : '';
            return await pb.collection('enrollments').getFullList<Enrollment>({ filter });
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            throw handlePocketbaseError(error);
        }
    },

    getById: async (id: string) => {
        try {
            return await pb.collection('enrollments').getOne<Enrollment>(id);
        } catch (error) {
            console.error('Error fetching enrollment:', error);
            throw handlePocketbaseError(error);
        }
    },

    create: async (data: Partial<Enrollment>) => {
        try {
            return await pb.collection('enrollments').create<Enrollment>(data);
        } catch (error) {
            console.error('Error creating enrollment:', error);
            throw handlePocketbaseError(error);
        }
    },

    update: async (id: string, data: Partial<Enrollment>) => {
        try {
            return await pb.collection('enrollments').update<Enrollment>(id, data);
        } catch (error) {
            console.error('Error updating enrollment:', error);
            throw handlePocketbaseError(error);
        }
    },

    delete: async (id: string) => {
        try {
            return await pb.collection('enrollments').delete(id);
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            throw handlePocketbaseError(error);
        }
    },

    updateProgress: async (id: string, progress: number, completedLessons?: string[]) => {
        try {
            return await pb.collection('enrollments').update<Enrollment>(id, {
                progress,
                completedLessons,
            });
        } catch (error) {
            console.error('Error updating enrollment progress:', error);
            throw handlePocketbaseError(error);
        }
    },
};

// Settings Service
export const settingsService = {
    async get(): Promise<Settings | null> {
        try {
            const records = await pb.collection('settings').getList(1, 1);
            return records.items[0] as Settings;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    async update(id: string, data: FormData): Promise<Settings> {
        try {
            const record = await pb.collection('settings').update(id, data);
            return record as Settings;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    },
};

// Authentication
export const register = async (
    email: string,
    password: string,
    name: string,
    role: User['role'] = 'student'
) => {
    try {
        const user = await pb.collection('users').create({
            email,
            password,
            passwordConfirm: password,
            name,
            role,
        });
        await pb.collection('users').authWithPassword(email, password);
        return user;
    } catch (error) {
        console.error('Error registering user:', error);
        throw handlePocketbaseError(error);
    }
};

export const login = async (email: string, password: string) => {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        
        if (!pb.authStore.isValid) {
            throw new Error('Authentication failed');
        }
        
        return authData;
    } catch (error) {
        console.error('Error logging in:', error);
        throw handlePocketbaseError(error);
    }
};

export const logout = () => {
    pb.authStore.clear();
};

// Auth Store Helpers
export function getCurrentUser(): User | null {
    if (!pb.authStore.isValid) {
        return null;
    }
    return pb.authStore.model as User;
}

export function getFileUrl(record: { id: string; collectionId: string; [key: string]: any }, filename: string): string {
    return `https://content.skiddytamil.in/api/files/${record.collectionId}/${record.id}/${filename}`;
}

export const isAuthenticated = () => {
    return pb.authStore.isValid;
};

export const isInstructor = () => {
    const user = getCurrentUser();
    return user?.role === 'instructor';
};

export const isAdmin = () => {
    const user = getCurrentUser();
    return user?.role === 'admin';
};

export const isStudent = () => {
    const user = getCurrentUser();
    return user?.role === 'student';
};
