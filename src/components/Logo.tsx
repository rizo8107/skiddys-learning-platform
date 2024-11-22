import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { pb, settingsService } from '../lib/pocketbase';

interface Settings {
  id: string;
  site_logo: string;
  site_name: string;
}

export function Logo() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <div className="flex items-center justify-center h-full">
      {settings?.site_logo ? (
        <img
          src={pb.files.getUrl(settings, settings.site_logo)}
          alt={settings.site_name}
          className="max-h-10 w-auto object-contain"
        />
      ) : (
        <GraduationCap className="w-6 h-6 text-blue-500" />
      )}
    </div>
  );
};
