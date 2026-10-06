import React from 'react';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';
import { useClub } from '../../context/ClubContext';

export const Footer: React.FC = () => {
  const { settings } = useClub();

  return (
    <footer className="bg-white dark:bg-black text-gray-600 dark:text-[#C5CCE0] border-t border-gray-200 dark:border-gray-800 relative overflow-hidden pt-12 pb-6">
      {/* Enhanced background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7C3AED]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-[#6366F1]/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-center gap-8 lg:gap-16 pb-12 border-b border-gray-200 dark:border-gray-800/40 max-w-5xl mx-auto">
          {/* Col 1: Club Identity & Mission */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3.5">
              <div className="mt-2 sm:mt-0">
                <h3 className="font-heading font-bold text-gray-900 dark:text-[#F7F7FB] text-lg sm:text-xl tracking-tight leading-tight">
                  {settings.club_name || 'Gomegram Swapnosiri Tarun Sangha'}
                </h3>
                <p className="text-sm font-bangla font-bold text-[#A855F7] mt-0.5 tracking-wide">
                  গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ
                </p>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-gray-800/60 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-[0_0_20px_rgba(105,105,105,0.4)] hover:-translate-y-1 group hover:bg-gray-50/80 dark:hover:bg-black/60 transition-all duration-500 w-full max-w-md md:h-[220px] flex flex-col justify-center relative overflow-hidden mx-auto md:mx-0">
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#7C3AED]/5 to-transparent rounded-tr-full pointer-events-none" />
              <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-[#C5CCE0] leading-relaxed relative z-10 font-medium">
                {settings.club_description || 'A dedicated youth welfare organization in Gome Gram committed to cultural traditions, community unity, education, sports, and humanitarian support.'}
              </p>
            </div>

            <div className="pt-2 hidden md:flex flex-col items-center md:items-start w-full max-w-md mx-auto md:mx-0">
              <p className="text-xs font-bold text-[#8C7568] tracking-[0.2em] mb-3 uppercase">Follow Us</p>
              <div className="flex items-center gap-3">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-[#C5CCE0] hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[#1877F2]/25"
                    aria-label="Facebook Page"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Contact */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <div className="h-12 flex items-center">
              <h4 className="font-heading font-bold text-gray-900 dark:text-[#F7F7FB] text-sm uppercase tracking-[0.15em] flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#F0D675] shadow-[0_0_8px_#6366F1]"></span>
                Contact Information
              </h4>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-gray-800/60 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-[0_0_20px_rgba(105,105,105,0.4)] hover:-translate-y-1 space-y-4 relative overflow-hidden group hover:bg-gray-50/80 dark:hover:bg-black/60 transition-all duration-500 w-full max-w-md md:h-[220px] flex flex-col justify-center mx-auto md:mx-0">
              {/* Decorative accent inside card */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#7C3AED]/5 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center sm:items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#6366F1]/10 border border-[#7C3AED]/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#7C3AED]/20 transition-all duration-300">
                  <MapPin className="w-4 h-4 text-[#6366F1]" />
                </div>
                <span className="text-[13px] sm:text-[14px] text-gray-600 dark:text-[#C5CCE0] leading-relaxed pt-1 sm:pt-1.5 font-medium text-left">{settings.club_address || 'Gome Gram, Jadabpur, Dhamrai, Dhaka, Bangladesh'}</span>
              </div>
              
              <div className="flex items-center sm:items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#6366F1]/10 border border-[#7C3AED]/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#7C3AED]/20 transition-all duration-300">
                  <Phone className="w-4 h-4 text-[#6366F1]" />
                </div>
                <a href={`tel:${settings.club_phone}`} className="text-[13px] sm:text-[14px] text-gray-600 dark:text-[#C5CCE0] font-medium pt-1 sm:pt-1.5 hover:text-[#D4AF37] transition-colors text-left">
                  {settings.club_phone || '+880 1712-345678'}
                </a>
              </div>
              
              <div className="flex items-center sm:items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#6366F1]/10 border border-[#7C3AED]/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#7C3AED]/20 transition-all duration-300">
                  <Mail className="w-4 h-4 text-[#6366F1]" />
                </div>
                <a href={`mailto:${settings.club_email}`} className="text-[13px] sm:text-[14px] text-gray-600 dark:text-[#C5CCE0] font-medium pt-1 sm:pt-1.5 hover:text-[#D4AF37] transition-colors text-left">
                  {settings.club_email || 'contact@swapnosiri.org'}
                </a>
              </div>
            </div>

            {/* Mobile-only Follow Us (appears below Contact Info on small screens) */}
            <div className="pt-4 flex md:hidden flex-col items-center w-full max-w-md mx-auto mt-6">
              <p className="text-xs font-bold text-[#8C7568] tracking-[0.2em] mb-3 uppercase">Follow Us</p>
              <div className="flex items-center justify-center gap-3">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-[#C5CCE0] hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[#1877F2]/25"
                    aria-label="Facebook Page"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

 
      </div>
    </footer>
  );
};
