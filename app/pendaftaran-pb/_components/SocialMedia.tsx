import React from 'react';
import { Facebook, Instagram, Mail, MessageCircle, Music2, Twitter, Youtube } from 'lucide-react';

// Kontak & sosial media resmi PB UNDIP.
// Dipakai di halaman pendaftaran (sidebar desktop + bawah form pada mobile).
export const PB_CONTACTS = {
  email: 'pb_undip@live.undip.ac.id',
  whatsapp: '6285325535155',
  facebook: 'https://www.facebook.com/profile.php?id=61586511525691',
  instagram: 'https://www.instagram.com/pb_undip/',
  tiktok: 'https://www.tiktok.com/@pb_undip?lang=id-ID',
  youtube: 'https://www.youtube.com/@PB_UNDIP',
  x: 'https://x.com/pb_undip',
  threads: 'https://threads.com/pb_undip',
};

export default function SocialMedia({ showEmail = true }: { showEmail?: boolean }) {
  const links = [
    { label: 'Facebook', href: PB_CONTACTS.facebook, Icon: Facebook },
    { label: 'Instagram', href: PB_CONTACTS.instagram, Icon: Instagram },
    { label: 'TikTok', href: PB_CONTACTS.tiktok, Icon: Music2 },
    { label: 'YouTube', href: PB_CONTACTS.youtube, Icon: Youtube },
    { label: 'X', href: PB_CONTACTS.x, Icon: Twitter },
    { label: 'Threads', href: PB_CONTACTS.threads, Icon: MessageCircle },
  ];

  return (
    <div className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Sosial Media
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-foreground hover:text-background transition-all duration-200"
          >
            <Icon size={13} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
      {showEmail && (
        <a
          href={`mailto:${PB_CONTACTS.email}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <Mail size={13} aria-hidden="true" />
          <span>{PB_CONTACTS.email}</span>
        </a>
      )}
    </div>
  );
}