import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService } from '../lib/pocketbase';
import type { SiteSettings as SiteSettingsType } from '../lib/pocketbase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useToast } from './ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChromePicker } from 'react-color';

export const SiteSettings: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('general');
    const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

    // Fetch current settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['siteSettings'],
        queryFn: () => siteSettingsService.get(),
    });

    // Form state
    const [formData, setFormData] = useState<Partial<SiteSettingsType>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Update form data when settings are loaded
    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (!settings?.id) throw new Error('No settings ID found');
            return siteSettingsService.update(settings.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
            toast({
                title: 'Settings Updated',
                description: 'Your site settings have been successfully updated.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: 'Failed to update settings. ' + error.message,
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = new FormData();
        
        // Add all form fields
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'social_links' || key === 'theme_colors') {
                data.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null && key !== 'logo_url') {
                data.append(key, value.toString());
            }
        });

        // Add logo file if selected
        if (logoFile) {
            data.append('site_logo', logoFile);
        }

        updateMutation.mutate(data);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [platform]: value,
            },
        }));
    };

    const handleColorChange = (color: string, type: string) => {
        setFormData(prev => ({
            ...prev,
            theme_colors: {
                ...prev.theme_colors,
                [type]: color,
            },
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    if (isLoading) {
        return <div>Loading settings...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>
                        Manage your site's appearance and functionality
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="appearance">Appearance</TabsTrigger>
                            <TabsTrigger value="social">Social Media</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4">
                            <div>
                                <Label htmlFor="site_name">Site Name</Label>
                                <Input
                                    id="site_name"
                                    name="site_name"
                                    value={formData.site_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="site_description">Site Description</Label>
                                <Textarea
                                    id="site_description"
                                    name="site_description"
                                    value={formData.site_description || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact_email">Contact Email</Label>
                                <Input
                                    id="contact_email"
                                    name="contact_email"
                                    type="email"
                                    value={formData.contact_email || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="footer_text">Footer Text</Label>
                                <Input
                                    id="footer_text"
                                    name="footer_text"
                                    value={formData.footer_text || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="appearance" className="space-y-4">
                            <div>
                                <Label htmlFor="site_logo">Site Logo</Label>
                                <Input
                                    id="site_logo"
                                    name="site_logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                                {(formData.logo_url || settings?.logo_url) && (
                                    <img
                                        src={formData.logo_url || settings?.logo_url}
                                        alt="Site Logo"
                                        className="mt-2 h-20 object-contain"
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label>Theme Colors</Label>
                                {['primary', 'secondary', 'accent', 'background'].map((colorType) => (
                                    <div key={colorType} className="flex items-center space-x-2">
                                        <Label htmlFor={colorType}>{colorType.charAt(0).toUpperCase() + colorType.slice(1)}</Label>
                                        <div
                                            className="w-10 h-10 rounded cursor-pointer border"
                                            style={{
                                                backgroundColor: formData.theme_colors?.[colorType as keyof typeof formData.theme_colors] || '#ffffff'
                                            }}
                                            onClick={() => setColorPickerOpen(colorType)}
                                        />
                                        {colorPickerOpen === colorType && (
                                            <div className="absolute z-10">
                                                <div
                                                    className="fixed inset-0"
                                                    onClick={() => setColorPickerOpen(null)}
                                                />
                                                <ChromePicker
                                                    color={formData.theme_colors?.[colorType as keyof typeof formData.theme_colors] || '#ffffff'}
                                                    onChange={(color) => handleColorChange(color.hex, colorType)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="social" className="space-y-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                                <div key={platform}>
                                    <Label htmlFor={platform}>
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
                                    </Label>
                                    <Input
                                        id={platform}
                                        value={formData.social_links?.[platform as keyof typeof formData.social_links] || ''}
                                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                                        placeholder={`Enter your ${platform} URL`}
                                    />
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="maintenance_mode"
                                    checked={formData.maintenance_mode || false}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, maintenance_mode: checked }))
                                    }
                                />
                                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="w-full"
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
};
