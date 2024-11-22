import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, isAdmin, settingsService } from '../lib/pocketbase';
import { Upload, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Settings {
  id: string;
  site_logo: string;
  site_name: string;
}

const SettingsPage: React.FC = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [siteName, setSiteName] = useState('');
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
    onSuccess: (data) => {
      if (data?.site_name) {
        setSiteName(data.site_name);
      }
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!settings?.id) throw new Error('No settings found');
      return await settingsService.update(settings.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('Settings updated successfully!');
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : 'Failed to update settings');
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('site_name', siteName);
    
    if (logoFile) {
      formData.append('site_logo', logoFile);
    }

    updateMutation.mutate(formData);
  };

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Site Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site Logo
          </label>
          {settings?.site_logo && !logoFile && (
            <div className="mb-4">
              <img
                src={pb.files.getUrl(settings, settings.site_logo)}
                alt="Current Logo"
                className="h-16 object-contain bg-gray-700 rounded-lg p-2"
              />
            </div>
          )}
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 text-white rounded-lg tracking-wide uppercase border border-gray-600 cursor-pointer hover:bg-gray-600 hover:border-gray-500">
              <Upload className="w-8 h-8" />
              <span className="mt-2 text-base">
                {logoFile ? logoFile.name : 'Select Logo'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Settings'
          )}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
