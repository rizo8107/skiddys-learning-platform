import PocketBase, { Record, ClientResponseError } from 'pocketbase';

// Initialize PocketBase with proper base URL
const baseUrl = import.meta.env.VITE_API_URL || window.location.origin + '/api';
export const pb = new PocketBase(baseUrl);

// Try to restore auth state from localStorage
try {
    const storedAuth = localStorage.getItem('pocketbase_auth');
    if (storedAuth) {
        const { token, model } = JSON.parse(storedAuth);
        pb.authStore.save(token, model);
    }
} catch (error) {
    console.error('Error restoring auth state:', error);
    localStorage.removeItem('pocketbase_auth');
}

// Handle auth state changes
pb.authStore.onChange(() => {
    if (pb.authStore.isValid) {
        localStorage.setItem('pocketbase_auth', JSON.stringify({
            token: pb.authStore.token,
            model: pb.authStore.model
        }));
    } else {
        localStorage.removeItem('pocketbase_auth');
    }
});

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
    visibility: 'public' | 'private';
    expand?: {
        instructor?: User;
    };
}

export interface LessonResource extends Record {
    lesson: string;
    resource_title: string;
    resource_file?: string;
    resource_link?: string;
    resource_type: 'document' | 'video' | 'exercise' | 'link' | 'article' | 'code' | 'other';
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
    site_name: string;
    site_description: string;
    contact_email: string;
    social_links: {
        twitter?: string;
        github?: string;
        linkedin?: string;
    };
    site_logo?: string;
}

export interface LessonNote extends Record {
    lesson: string;
    user: string;
    content: string;
    created: string;
    updated: string;
    expand?: {
        user?: User;
    };
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
    async getCourses(filter = ''): Promise<Course[]> {
        try {
            const records = await pb.collection('courses').getFullList<Course>({
                filter,
                sort: '-created'
            });
            return records;
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    },

    async getCourse(id: string): Promise<Course | null> {
        try {
            return await pb.collection('courses').getOne<Course>(id);
        } catch (error) {
            console.error('Error fetching course:', error);
            return null;
        }
    },

    async createCourse(data: Partial<Course>): Promise<Course | null> {
        try {
            if (!pb.authStore.isValid) {
                throw new Error('Must be authenticated to create courses');
            }
            return await pb.collection('courses').create<Course>(data);
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    },

    async updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
        try {
            const course = await this.getCourse(id);
            if (!course) {
                throw new Error('Course not found');
            }
            
            if (!pb.authStore.isValid) {
                throw new Error('Must be authenticated to update courses');
            }

            const user = pb.authStore.model;
            if (!user?.admin && course.instructor !== user?.id) {
                throw new Error('Only course instructors or admins can update courses');
            }

            return await pb.collection('courses').update<Course>(id, data);
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    },

    async deleteCourse(id: string): Promise<boolean> {
        try {
            const course = await this.getCourse(id);
            if (!course) {
                throw new Error('Course not found');
            }

            if (!pb.authStore.isValid) {
                throw new Error('Must be authenticated to delete courses');
            }

            const user = pb.authStore.model;
            if (!user?.admin && course.instructor !== user?.id) {
                throw new Error('Only course instructors or admins can delete courses');
            }

            await pb.collection('courses').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }
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
        try {
            const records = await pb.collection('lesson_resources').getFullList({
                filter: `lesson = "${lessonId}"`,
                sort: 'created',
            });
            return records as LessonResource[];
        } catch (error) {
            console.error('Error fetching lesson resources:', error);
            throw handlePocketbaseError(error);
        }
    },

    async create(data: {
        lesson: string;
        resource_title: string;
        resource_file?: File;
        resource_link?: string;
        resource_type: LessonResource['resource_type'];
        resource_description?: string;
    }): Promise<LessonResource> {
        try {
            const formData = new FormData();
            formData.append('lesson', data.lesson);
            formData.append('resource_title', data.resource_title);
            formData.append('resource_type', data.resource_type);
            
            if (data.resource_description) {
                formData.append('resource_description', data.resource_description);
            }

            // Add either file or link
            if (data.resource_file) {
                formData.append('resource_file', data.resource_file);
            } else if (data.resource_link) {
                formData.append('resource_link', data.resource_link);
            }

            const record = await pb.collection('lesson_resources').create(formData);
            return record as LessonResource;
        } catch (error) {
            console.error('Error creating lesson resource:', error);
            throw handlePocketbaseError(error);
        }
    },

    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection('lesson_resources').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting lesson resource:', error);
            throw handlePocketbaseError(error);
        }
    },

    getFileUrl(record: LessonResource): string {
        try {
            if (record.resource_link) {
                return record.resource_link;
            }

            if (!record.resource_file) {
                return '';
            }

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

// Lesson Note Services
export const lessonNoteService = {
    async getAll(lessonId: string): Promise<LessonNote[]> {
        try {
            const result = await pb.collection('lesson_notes').getList(1, 50, {
                filter: `lesson = "${lessonId}"`,
                sort: '-created',
                expand: 'user',
            });
            return result.items as LessonNote[];
        } catch (error) {
            console.error('Error fetching lesson notes:', error);
            throw handlePocketbaseError(error);
        }
    },
    
    async create(data: { lesson: string; content: string }): Promise<LessonNote> {
        try {
            const user = pb.authStore.model?.id;
            if (!user) throw new Error('User not authenticated');
            
            const record = await pb.collection('lesson_notes').create({
                ...data,
                user,
            });

            // Fetch the complete record with expansions
            const completeRecord = await pb.collection('lesson_notes').getOne(record.id, {
                expand: 'user',
            });
            
            return completeRecord as LessonNote;
        } catch (error) {
            console.error('Error creating lesson note:', error);
            throw handlePocketbaseError(error);
        }
    },
    
    async update(id: string, data: { content: string }): Promise<LessonNote> {
        try {
            const record = await pb.collection('lesson_notes').update(id, data);
            
            // Fetch the complete record with expansions
            const completeRecord = await pb.collection('lesson_notes').getOne(record.id, {
                expand: 'user',
            });
            
            return completeRecord as LessonNote;
        } catch (error) {
            console.error('Error updating lesson note:', error);
            throw handlePocketbaseError(error);
        }
    },
    
    async delete(id: string): Promise<boolean> {
        try {
            await pb.collection('lesson_notes').delete(id);
            return true;
        } catch (error) {
            console.error('Error deleting lesson note:', error);
            throw handlePocketbaseError(error);
        }
    },
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
    async getSettings(): Promise<Settings | null> {
        try {
            const records = await pb.collection('settings').getFullList<Settings>();
            return records[0] || null;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return null;
        }
    },

    async createSettings(data: Partial<Settings>): Promise<Settings | null> {
        try {
            if (!pb.authStore.isValid || !pb.authStore.model?.admin) {
                throw new Error('Only admins can create settings');
            }
            return await pb.collection('settings').create<Settings>(data);
        } catch (error) {
            console.error('Error creating settings:', error);
            throw error;
        }
    },

    async updateSettings(id: string, data: Partial<Settings>): Promise<Settings | null> {
        try {
            if (!pb.authStore.isValid || !pb.authStore.model?.admin) {
                throw new Error('Only admins can update settings');
            }
            return await pb.collection('settings').update<Settings>(id, data);
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
};

// Authentication
export async function login(email: string, password: string) {
    try {
        // Clear any existing auth state
        pb.authStore.clear();
        
        // Attempt to authenticate
        const authData = await pb.collection('users').authWithPassword(email, password);
        
        // Verify authentication was successful
        if (!pb.authStore.isValid || !authData?.token || !authData?.record) {
            throw new Error('Authentication failed');
        }
        
        // Store auth data in localStorage for persistence
        localStorage.setItem('pocketbase_auth', JSON.stringify({
            token: authData.token,
            model: authData.record
        }));
        
        return authData;
    } catch (error: any) {
        // Clear auth store on error
        pb.authStore.clear();
        localStorage.removeItem('pocketbase_auth');
        
        if (error instanceof ClientResponseError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

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
    return `http://127.0.0.1:8090/api/files/${record.collectionId}/${record.id}/${filename}`;
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
