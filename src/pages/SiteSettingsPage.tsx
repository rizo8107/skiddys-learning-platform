import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, getCurrentUser } from '../lib/pocketbase';
import { SiteSettings } from '../components/SiteSettings';

export function SiteSettingsPage() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    useEffect(() => {
        console.log('Current user:', currentUser);
        console.log('User role:', currentUser?.role);
        console.log('Is admin?', isAdmin());

        // Redirect non-admin users
        if (!isAdmin()) {
            console.log('Redirecting non-admin user to home');
            navigate('/');
        }
    }, [navigate, currentUser]);

    // Don't render anything for non-admin users
    if (!isAdmin()) {
        console.log('Not rendering for non-admin user');
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Site Settings</h1>
                <p className="mt-2 text-gray-400">
                    Customize your site's appearance and functionality
                </p>
            </div>
            <SiteSettings />
        </div>
    );
}
