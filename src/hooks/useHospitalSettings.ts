import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HospitalSettings {
  id: string;
  hospital_name: string;
  logo_url: string | null;
  updated_at: string;
}

const SETTINGS_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hospital-settings`;

export function useHospitalSettings() {
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(SETTINGS_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get' }),
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: { hospitalName?: string; logoUrl?: string }) => {
    try {
      const response = await fetch(SETTINGS_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...updates }),
      });
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('hospital-logos')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: urlData } = supabase.storage
        .from('hospital-logos')
        .getPublicUrl(fileName);

      await updateSettings({ logoUrl: urlData.publicUrl });
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, updateSettings, uploadLogo, refetch: fetchSettings };
}