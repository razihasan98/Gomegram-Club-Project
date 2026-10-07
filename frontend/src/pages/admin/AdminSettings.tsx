import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Save,
  Sparkles,
  Lock,
  Mail,
  Cloud
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { refreshSettings } = useClub();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [settingsForm, setSettingsForm] = useState({
    club_name: 'Gomegram Swapnosiri Tarun Sangha',
    club_bangla_name: 'Youth & Socio-Cultural Club',
    club_tagline: 'Unity • Culture • Community Welfare',
    club_tagline_en: 'Unity, Culture & Community Welfare',
    established_year: '2021',
    registration_no: 'REG-GS-2021-092',
    club_phone: '+880 1712-345678',
    club_email: 'contact@swapnosiri.org',
    club_address: 'Gomegram, Singair, Manikganj, Dhaka, Bangladesh',
    club_description: 'Gomegram Swapnosiri Tarun Sangha is a youth socio-cultural organization dedicated to community empowerment, cultural preservation, blood donation, and social harmony.',
    facebook_url: 'https://facebook.com/gomegramswapnosiri',
    youtube_url: 'https://youtube.com/@gomegramswapnosiri',
    hide_public_phone: '0',
    hide_public_email: '0',
    hide_public_address: '0',
    hide_public_financials: '0',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    cloudinary_upload_preset: '',
  });

  const [accountForm, setAccountForm] = useState({
    email: user?.email || 'admin@swapnosiri.org',
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [savingAccount, setSavingAccount] = useState<boolean>(false);

  const [gdriveForm, setGdriveForm] = useState({
    client_id: '',
    client_secret: '',
    folder_id: '',
  });
  const [savingGdrive, setSavingGdrive] = useState<boolean>(false);
  const [connectingGdrive, setConnectingGdrive] = useState<boolean>(false);

  useEffect(() => {
    if (user?.email) {
      setAccountForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data?.settings) {
          setSettingsForm((prev) => ({ ...prev, ...res.data.settings }));
        }

        // Fetch GDrive config
        const gdriveRes = await api.get('/admin/settings/gdrive');
        if (gdriveRes.data) {
          setGdriveForm({
            client_id: gdriveRes.data.client_id || '',
            client_secret: gdriveRes.data.client_secret || '',
            folder_id: gdriveRes.data.folder_id || '',
          });
        }
      } catch {
        error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  // Handle Google Drive OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const gdrive_status = searchParams.get('gdrive_status');
    const message = searchParams.get('message');

    if (code) {
      const saveCode = async () => {
        try {
          const res = await api.post('/admin/settings/gdrive/save-code', { code });
          success(res.data?.message || 'Google Drive connected successfully!');
        } catch (err: any) {
          error(err.response?.data?.error || 'Failed to connect Google Drive');
        } finally {
          navigate('/admin/settings', { replace: true });
        }
      };
      saveCode();
    } else if (gdrive_status === 'error') {
      error(message || 'Failed to connect Google Drive');
      navigate('/admin/settings', { replace: true });
    } else if (gdrive_status === 'success') {
      success('Google Drive connected successfully!');
      navigate('/admin/settings', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.post('/admin/settings', settingsForm);
      await refreshSettings();
      success('Club configuration and settings saved.');
    } catch {
      error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountForm.password && accountForm.password !== accountForm.password_confirmation) {
      error('New password and confirmation do not match.');
      return;
    }

    setSavingAccount(true);
    try {
      const res = await api.put('/admin/change-password', accountForm);
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      success('Admin credentials (email / password) updated successfully.');
      setAccountForm((prev) => ({
        ...prev,
        current_password: '',
        password: '',
        password_confirmation: '',
      }));
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update credentials. Please check current password.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveGdrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGdrive(true);
    try {
      await api.post('/admin/settings/gdrive', gdriveForm);
      success('Google Drive configuration saved.');
    } catch {
      error('Failed to update Google Drive configuration');
    } finally {
      setSavingGdrive(false);
    }
  };

  const handleConnectGdrive = async () => {
    if (!gdriveForm.client_id || !gdriveForm.client_secret) {
      error('Please save Client ID and Secret first before connecting.');
      return;
    }
    setConnectingGdrive(true);
    try {
      const res = await api.get('/admin/settings/gdrive/auth-url', {
        params: {
          client_id: gdriveForm.client_id,
          client_secret: gdriveForm.client_secret
        }
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to generate connection link');
      setConnectingGdrive(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-10 text-gray-900 dark:text-[#F7F7FB]">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
          Club Settings & Admin Security
        </h1>
        <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
          Configure organization identity, contact info, privacy rules, and admin credentials.
        </p>
      </div>

      {/* 1. General Club Information */}
      <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Club Profile & Public Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Club Name (English)
            </label>
            <input
              type="text"
              required
              value={settingsForm.club_name}
              onChange={(e) => setSettingsForm({ ...settingsForm, club_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Subtitle / Category
            </label>
            <input
              type="text"
              value={settingsForm.club_bangla_name}
              onChange={(e) => setSettingsForm({ ...settingsForm, club_bangla_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>


        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Official Helpline Phone
            </label>
            <input
              type="text"
              value={settingsForm.club_phone}
              onChange={(e) => setSettingsForm({ ...settingsForm, club_phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Official Contact Email
            </label>
            <input
              type="email"
              value={settingsForm.club_email}
              onChange={(e) => setSettingsForm({ ...settingsForm, club_email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
            Official Club Address
          </label>
          <input
            type="text"
            value={settingsForm.club_address}
            onChange={(e) => setSettingsForm({ ...settingsForm, club_address: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Facebook Page URL
            </label>
            <input
              type="url"
              value={settingsForm.facebook_url}
              onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

        </div>

        {/* Privacy Toggles */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="font-heading font-semibold text-xs text-gray-900 dark:text-[#F7F7FB]">
              Public Website Privacy Controls
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-[#C5CCE0]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.hide_public_phone === '1'}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, hide_public_phone: e.target.checked ? '1' : '0' })
                }
                className="rounded bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-[#7C3AED] focus:ring-0"
              />
              <span>Hide member phone numbers publicly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.hide_public_email === '1'}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, hide_public_email: e.target.checked ? '1' : '0' })
                }
                className="rounded bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-[#7C3AED] focus:ring-0"
              />
              <span>Hide member emails publicly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.hide_public_address === '1'}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, hide_public_address: e.target.checked ? '1' : '0' })
                }
                className="rounded bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-[#7C3AED] focus:ring-0"
              />
              <span>Hide member addresses publicly</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.hide_public_financials === '1'}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, hide_public_financials: e.target.checked ? '1' : '0' })
                }
                className="rounded bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-[#7C3AED] focus:ring-0"
              />
              <span>Hide member dues balances publicly</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] font-semibold text-xs shadow-lg shadow-slate-900/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Cloudinary Cloud Storage (Permanent CDN Storage) */}
      <div className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Cloudinary Cloud Storage (Permanent Image CDN)</h3>
              <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">
                Store all photos permanently in the cloud. Photos will never disappear on server restarts or redeployments.
              </p>
            </div>
          </div>
          {settingsForm.cloudinary_cloud_name && (
            <span className="px-3 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Cloudinary Configured
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Cloudinary Cloud Name *
            </label>
            <input
              type="text"
              value={settingsForm.cloudinary_cloud_name || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, cloudinary_cloud_name: e.target.value })}
              placeholder="e.g. dxyz1234"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
            <p className="text-[10px] text-gray-500 mt-1">Found on your Cloudinary dashboard.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Upload Preset (Recommended for Unsigned Upload)
            </label>
            <input
              type="text"
              value={settingsForm.cloudinary_upload_preset || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, cloudinary_upload_preset: e.target.value })}
              placeholder="e.g. gomegram_preset"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
            <p className="text-[10px] text-gray-500 mt-1">From Cloudinary Settings &gt; Upload &gt; Upload Presets.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              API Key (Optional / For Signed Uploads)
            </label>
            <input
              type="text"
              value={settingsForm.cloudinary_api_key || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, cloudinary_api_key: e.target.value })}
              placeholder="e.g. 123456789012345"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              API Secret (Optional / For Signed Uploads)
            </label>
            <input
              type="password"
              value={settingsForm.cloudinary_api_secret || ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, cloudinary_api_secret: e.target.value })}
              placeholder="e.g. abcd_123456789"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving...' : 'Save Cloudinary Config'}</span>
          </button>
        </div>
      </div>

      {/* Google Drive Configuration */}
      <form onSubmit={handleSaveGdrive} className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0F9D58]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 3.5L1.15 15l3.43 6l6.55-11.5M9.73 3.5l-3.43 6l9.7 16.5h6.85M13.73 15l-3.42-6H3.45l3.44 6" />
            </svg>
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Google Drive Integration</h3>
              <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Connect your Google Drive to store uploaded images automatically.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectGdrive}
            disabled={connectingGdrive}
            className="px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <span>{connectingGdrive ? 'Redirecting...' : 'Connect Google Drive'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Hidden Client ID and Secret fields to keep UI clean while retaining functionality */}
          <div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                Google OAuth Client ID *
              </label>
              <input
                type="text"
                required
                value={gdriveForm.client_id}
                onChange={(e) => setGdriveForm({ ...gdriveForm, client_id: e.target.value })}
                placeholder="e.g. 626620751613-xxxx.apps.googleusercontent.com"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                Google OAuth Client Secret *
              </label>
              <input
                type="password"
                required
                value={gdriveForm.client_secret}
                onChange={(e) => setGdriveForm({ ...gdriveForm, client_secret: e.target.value })}
                placeholder="e.g. GOCSPX-xxxx"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Destination Folder ID *
            </label>
            <input
              type="text"
              required
              value={gdriveForm.folder_id}
              onChange={(e) => setGdriveForm({ ...gdriveForm, folder_id: e.target.value })}
              placeholder="e.g. 1p0-Nt-HFAvXCZ9DM8c6vsB0YOUhlfol4"
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              You can find this ID in the URL of your Google Drive folder.
            </p>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingGdrive}
            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] font-semibold text-xs border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4 text-[#4285F4]" />
            <span>{savingGdrive ? 'Saving...' : 'Save Drive Config'}</span>
          </button>
        </div>
      </form>

      {/* 2. Admin Email & Password Change */}
      <form onSubmit={handleAccountSubmit} className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Change Admin Email & Password</h3>
              <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Update your admin login email address and account password.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Admin Login Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                placeholder="Enter email"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Current Password (to verify changes) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={accountForm.current_password}
                onChange={(e) => setAccountForm({ ...accountForm, current_password: e.target.value })}
                placeholder="Enter current password"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              New Password (Optional)
            </label>
            <input
              type="password"
              minLength={6}
              placeholder="Leave blank if keeping current password"
              value={accountForm.password}
              onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              minLength={6}
              placeholder="Repeat new password"
              value={accountForm.password_confirmation}
              onChange={(e) => setAccountForm({ ...accountForm, password_confirmation: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingAccount}
            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] font-semibold text-xs border border-gray-200 dark:border-gray-800 flex items-center gap-2 shadow"
          >
            <Lock className="w-4 h-4 text-[#D4AF37]" />
            <span>{savingAccount ? 'Updating Credentials...' : 'Save Admin Credentials'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
