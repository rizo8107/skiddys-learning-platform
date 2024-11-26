import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '../lib/pocketbase';
import type { SiteSettings } from '../lib/pocketbase';

export function useSiteSettings() {
    const { data: settings, isLoading, error } = useQuery<SiteSettings>({
        queryKey: ['siteSettings'],
        queryFn: () => siteSettingsService.get(),
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    });

    return {
        settings,
        isLoading,
        error,
        siteSettingsService,
    };
}
