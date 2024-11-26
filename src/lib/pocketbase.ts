import PocketBase, { Record, ClientResponseError } from 'pocketbase';

const baseUrl = import.meta.env.VITE_API_URL || 'https://skiddy-pocketbase.9dto0s.easypanel.host/';
export const pb = new PocketBase(baseUrl);

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
    resource_file?: string;
    resource_link?: string;
    resource_type: 'document' | 'video' | 'exercise' | 'link' | 'article' | 'code' | 'other';
    resource_description?: string;
    url?: string; // The full URL for the resource (file or link)
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

export interface SiteSettings extends Record {
    site_name: string;
    site_description?: string;
    site_logo?: string;
    contact_email?: string;
    social_links?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };
    footer_text?: string;
    theme_colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
    };
    maintenance_mode?: boolean;
    logo_url?: string;
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
            if (!pb.authStore.isValid) {
                return [];
            }
            const records = await pb
                .collection('courses')
                .getFullList<Course>({
                    sort: '-created',
                    expand: 'instructor',
                });
            return records;
        } catch (error) {
            if ((error as ClientResponseError).status === 403) {
                return [];
            }
            throw error;
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
        try {
            const records = await pb.collection('lesson_resources').getFullList({
                filter: `lesson = "${lessonId}"`,
                sort: 'created',
            });
            
            return records.map(record => ({
                ...record,
                url: record.resource_file 
                    ? pb.files.getUrl(record, record.resource_file)
                    : record.resource_link || ''
            })) as LessonResource[];
        } catch (error) {
            console.error('Error fetching lesson resources:', error);
            throw handlePocketbaseError(error);
        }
    },

    async create(data: FormData): Promise<LessonResource> {
        try {
            const record = await pb.collection('lesson_resources').create(data);
            return {
                ...record,
                url: record.resource_file 
                    ? pb.files.getUrl(record, record.resource_file)
                    : record.resource_link || ''
            } as LessonResource;
        } catch (error) {
            console.error('Error creating lesson resource:', error);
            throw handlePocketbaseError(error);
        }
    },

    async update(id: string, data: FormData): Promise<LessonResource> {
        try {
            const record = await pb.collection('lesson_resources').update(id, data);
            return {
                ...record,
                url: record.resource_file 
                    ? pb.files.getUrl(record, record.resource_file)
                    : record.resource_link || ''
            } as LessonResource;
        } catch (error) {
            console.error('Error updating lesson resource:', error);
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
            if (!pb.authStore.isValid) {
                return null;
            }
            const record = await pb.collection('settings').getFirstListItem('');
            return record as Settings;
        } catch (error) {
            if ((error as ClientResponseError).status === 403) {
                return null;
            }
            throw error;
        }
    },

    async update(id: string, data: FormData): Promise<Settings> {
        try {
            const record = await pb.collection('settings').update(id, data);
            return record as Settings;
        } catch (error) {
            handlePocketbaseError(error);
            throw error;
        }
    },
};

// Site Settings Service
class SiteSettingsService {
    private settingsCache: SiteSettings | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async get(): Promise<SiteSettings> {
        try {
            // Check cache first
            const now = Date.now();
            if (this.settingsCache && now < this.cacheExpiry) {
                return this.settingsCache;
            }

            // Fetch first record from site_settings
            const records = await pb.collection('site_settings').getList(1, 1, {
                sort: '-created',
            });

            if (records.items.length === 0) {
                // Create default settings if none exist
                const defaultSettings = {
                    site_name: 'My Learning Platform',
                    site_description: 'A platform for online learning',
                    footer_text: ' ' + new Date().getFullYear() + ' My Learning Platform',
                    maintenance_mode: false,
                    theme_colors: {
                        primary: '#3b82f6',
                        secondary: '#1e40af',
                        accent: '#60a5fa',
                        background: '#ffffff'
                    }
                };

                const record = await pb.collection('site_settings').create(defaultSettings);
                const settings = record as SiteSettings;

                // Add logo URL if exists
                if (settings.site_logo) {
                    settings.logo_url = pb.files.getUrl(record, settings.site_logo);
                }

                // Update cache
                this.settingsCache = settings;
                this.cacheExpiry = now + this.CACHE_DURATION;

                return settings;
            }

            const settings = records.items[0] as SiteSettings;

            // Add logo URL if exists
            if (settings.site_logo) {
                settings.logo_url = pb.files.getUrl(records.items[0], settings.site_logo);
            }

            // Update cache
            this.settingsCache = settings;
            this.cacheExpiry = now + this.CACHE_DURATION;

            return settings;
        } catch (error) {
            console.error('Error fetching site settings:', error);
            throw handlePocketbaseError(error);
        }
    }

    async update(id: string, data: FormData): Promise<SiteSettings> {
        try {
            const record = await pb.collection('site_settings').update(id, data);
            const settings = record as SiteSettings;

            // Add logo URL if exists
            if (settings.site_logo) {
                settings.logo_url = pb.files.getUrl(record, settings.site_logo);
            }

            // Clear cache to force refresh
            this.settingsCache = null;
            this.cacheExpiry = 0;

            return settings;
        } catch (error) {
            console.error('Error updating site settings:', error);
            throw handlePocketbaseError(error);
        }
    }

    clearCache(): void {
        this.settingsCache = null;
        this.cacheExpiry = 0;
    }
}

export const siteSettingsService = new SiteSettingsService();

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
    return `https://skiddy-pocketbase.9dto0s.easypanel.host/api/files/${record.collectionId}/${record.id}/${filename}`;
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
