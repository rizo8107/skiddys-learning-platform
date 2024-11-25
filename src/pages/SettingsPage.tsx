import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, isAdmin, settingsService } from '../lib/pocketbase';
import { Upload, Loader2, Settings as SettingsIcon, Layout, Users, Mail, Phone } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Settings {
  id: string;
  site_logo: string;
  site_name: string;
  login_background: string;
  login_title: string;
  login_subtitle: string;
  contact_email: string;
  contact_phone: string;
  primary_color: string;
  favicon: string;
  meta_description: string;
  meta_keywords: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loginBgFile, setLoginBgFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    site_name: '',
    login_title: '',
    login_subtitle: '',
    contact_email: '',
    contact_phone: '',
    primary_color: '#4F46E5',
    meta_description: '',
    meta_keywords: '',
  });

  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          site_name: data.site_name || '',
          login_title: data.login_title || 'Welcome Back',
          login_subtitle: data.login_subtitle || 'Sign in to continue learning',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          primary_color: data.primary_color || '#4F46E5',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
        });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    if (logoFile) formDataToSend.append('site_logo', logoFile);
    if (faviconFile) formDataToSend.append('favicon', faviconFile);
    if (loginBgFile) formDataToSend.append('login_background', loginBgFile);

    updateMutation.mutate(formDataToSend);
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

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Layout },
    { id: 'login', label: 'Login Page', icon: Users },
    { id: 'contact', label: 'Contact Info', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Site Settings</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-xl">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`${
                    activeTab === id
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  } flex items-center px-3 py-4 border-b-2 font-medium text-sm`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {activeTab === 'general' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={formData.site_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    placeholder="Separate keywords with commas"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            {activeTab === 'appearance' && (
              <>
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
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 text-white rounded-lg tracking-wide uppercase border border-gray-600 cursor-pointer hover:bg-gray-600">
                      <Upload className="w-8 h-8" />
                      <span className="mt-2 text-base">
                        {logoFile ? logoFile.name : 'Select Logo'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLogoFile)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Favicon
                  </label>
                  {settings?.favicon && !faviconFile && (
                    <div className="mb-4">
                      <img
                        src={pb.files.getUrl(settings, settings.favicon)}
                        alt="Current Favicon"
                        className="h-8 object-contain bg-gray-700 rounded-lg p-2"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 text-white rounded-lg tracking-wide uppercase border border-gray-600 cursor-pointer hover:bg-gray-600">
                      <Upload className="w-8 h-8" />
                      <span className="mt-2 text-base">
                        {faviconFile ? faviconFile.name : 'Select Favicon'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setFaviconFile)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                    className="h-10 w-20"
                  />
                </div>
              </>
            )}

            {activeTab === 'login' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Login Page Title
                  </label>
                  <input
                    type="text"
                    name="login_title"
                    value={formData.login_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Login Page Subtitle
                  </label>
                  <input
                    type="text"
                    name="login_subtitle"
                    value={formData.login_subtitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Login Background Image
                  </label>
                  {settings?.login_background && !loginBgFile && (
                    <div className="mb-4">
                      <img
                        src={pb.files.getUrl(settings, settings.login_background)}
                        alt="Current Background"
                        className="h-32 w-full object-cover bg-gray-700 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 text-white rounded-lg tracking-wide uppercase border border-gray-600 cursor-pointer hover:bg-gray-600">
                      <Upload className="w-8 h-8" />
                      <span className="mt-2 text-base">
                        {loginBgFile ? loginBgFile.name : 'Select Background Image'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLoginBgFile)}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'contact' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-700">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
