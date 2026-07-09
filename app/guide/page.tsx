import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan Lengkap | ScoreHub',
  description:
    'Panduan lengkap penggunaan ScoreHub: setup pertandingan, kontrol wasit, tampilan display, troubleshooting, dan FAQ.',
};

const quickStats = [
  { label: 'Latensi Update', value: '< 1 detik' },
  { label: 'Undo Aman', value: 'Sampai 50 aksi' },
  { label: 'Mode Jaringan', value: 'LAN / WiFi Lokal' },
];

const quickStartSteps = [
  {
    title: 'Buka Pusat Kontrol',
    description:
      'Masuk ke halaman Match Builder untuk membuat pertandingan baru dan menyiapkan kebutuhan layar.',
    action: 'Buka /create',
  },
  {
    title: 'Isi Data Pertandingan',
    description:
      'Pilih olahraga, kategori (MS/WS/MD/WD/XD), nama pemain atau tim, lalu atur PIN wasit minimal 4 digit.',
    action: 'Klik Buat Pertandingan',
  },
  {
    title: 'Bagikan Akses Wasit',
    description:
      'Bagikan kode pertandingan dan PIN wasit. Wasit masuk lewat halaman join agar bisa input rally secara realtime.',
    action: 'Buka /referee/join',
  },
  {
    title: 'Tampilkan ke Penonton',
    description:
      'Buka halaman display di TV/videotron dengan kode pertandingan. Halaman display bersifat read-only.',
    action: 'Buka /display/[code]',
  },
];

const roleGuides = [
  {
    role: 'Admin / Operator',
    objective: 'Membuat match, menyiapkan layar, dan menjaga kelancaran pertandingan.',
    tasks: [
      'Buat match dari Pusat Kontrol dan simpan PIN wasit.',
      'Pilih template display sesuai venue (modern/classic/minimal/neon).',
      'Pastikan layar display aktif sebelum pertandingan dimulai.',
      'Bantu wasit kalau perlu reset atau perbaikan alur.',
    ],
    cta: { href: '/create', label: 'Ke Pusat Kontrol' },
  },
  {
    role: 'Wasit',
    objective: 'Mengontrol rally dengan input cepat dan minim kesalahan.',
    tasks: [
      'Masuk dengan kode match + PIN wasit.',
      'Tap pemenang rally (Home/Away), bukan input angka manual.',
      'Gunakan Undo jika terjadi salah input.',
      'Kelola timer jika dipakai dalam format pertandingan.',
    ],
    cta: { href: '/referee/join', label: 'Masuk Sebagai Wasit' },
  },
  {
    role: 'Display / Penonton',
    objective: 'Menampilkan skor realtime tanpa kontrol input.',
    tasks: [
      'Buka halaman display dengan kode pertandingan.',
      'Aktifkan fullscreen pada TV/videotron.',
      'Jaga koneksi jaringan agar update tetap stabil.',
      'Display tidak membutuhkan PIN dan tidak bisa mengubah skor.',
    ],
    cta: { href: '/', label: 'Kembali ke Beranda' },
  },
];

const matchFlow = [
  {
    phase: 'Pra-Match',
    points: [
      'Verifikasi nama pemain/tim dan kategori pertandingan.',
      'Cek PIN wasit sudah aman dan tidak dibagikan ke penonton.',
      'Uji display di layar utama sebelum game pertama dimulai.',
    ],
  },
  {
    phase: 'Saat Match Berjalan',
    points: [
      'Input berdasarkan pemenang rally agar serve dan set tetap sinkron.',
      'Pantau indikator serve untuk memastikan alur rally tepat.',
      'Gunakan Undo segera setelah salah input agar history tetap rapi.',
    ],
  },
  {
    phase: 'Akhir Match',
    points: [
      'Pastikan skor akhir sesuai hasil lapangan.',
      'Simpan kode match jika butuh referensi hasil.',
      'Siapkan match berikutnya dari Pusat Kontrol untuk percepat transisi.',
    ],
  },
];

const troubleshooting = [
  {
    issue: 'Skor di display tidak berubah',
    fix: 'Cek apakah wasit masuk ke kode match yang benar dan pastikan perangkat wasit + display berada di jaringan yang sama.',
  },
  {
    issue: 'Wasit gagal masuk',
    fix: 'Validasi kode pertandingan dan PIN. PIN bersifat case-sensitive angka, pastikan tidak ada salah ketik.',
  },
  {
    issue: 'Input poin salah',
    fix: 'Gunakan tombol Undo secepatnya untuk membatalkan aksi terakhir (hingga 50 riwayat).',
  },
  {
    issue: 'Tampilan TV kurang optimal',
    fix: 'Gunakan mode fullscreen browser dan nonaktifkan overlay atau sleep mode pada perangkat display.',
  },
];

const faqs = [
  {
    q: 'Apakah ScoreHub bisa dipakai tanpa internet?',
    a: 'Bisa. Untuk event lokal, cukup gunakan LAN atau WiFi lokal selama perangkat saling terhubung.',
  },
  {
    q: 'Siapa yang boleh mengubah skor?',
    a: 'Hanya Admin dan Wasit. Halaman display bersifat read-only.',
  },
  {
    q: 'Apakah pergantian set dan akhir match otomatis?',
    a: 'Ya. Badminton mengikuti rule bawaan: 21 poin, win by 2, cap 30, best of 3.',
  },
  {
    q: 'Kalau koneksi sempat putus, apakah state hilang?',
    a: 'Tidak. State pertandingan disimpan persistent dan akan tersinkron kembali saat koneksi pulih.',
  },
];

function SectionTitle({
  id,
  kicker,
  title,
  description,
}: {
  id: string;
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-black/45">
        {kicker}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.06em] text-black md:text-5xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm text-black/65 md:text-base">{description}</p>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#F8FAFC] text-[#111827] font-[family-name:var(--font-literata)]">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[500px] w-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_70%)] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-8%] h-[380px] w-[430px] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.08),transparent_70%)] blur-3xl opacity-60" />

      <header className="sticky top-0 z-30 h-16 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center transition-transform hover:scale-105"
            >
              <Image
                src="/logo-pb.png"
                alt="Scorehub logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </Link>
            <div>
              <p className="font-[family-name:var(--font-bebas)] text-sm leading-none uppercase tracking-[0.28em]">
                Scorehub
              </p>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-black/50">
                Complete Guide
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/create"
              className="hidden rounded-full border border-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black/70 transition-colors hover:border-black/40 hover:text-black sm:inline-flex"
            >
              Pusat Kontrol
            </Link>
            <Link
              href="/"
              className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-0.5"
            >
              Beranda
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 lg:px-8 lg:pt-16">
        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-100/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
              Panduan Operasional
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-bebas)] text-6xl uppercase leading-[0.88] tracking-[0.06em] text-balance text-black md:text-7xl">
              ScoreHub <br />
              End-to-End Guide
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/65 md:text-lg">
              Halaman ini jadi pusat panduan operasional ScoreHub: dari setup match, alur wasit, sampai troubleshooting cepat saat event sedang berjalan.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#quick-start"
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white transition-transform hover:-translate-y-0.5"
              >
                Mulai Cepat
              </a>
              <a
                href="#troubleshooting"
                className="inline-flex items-center rounded-full border border-black/15 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-black/70 transition-colors hover:border-black/40 hover:text-black"
              >
                Lihat Solusi Cepat
              </a>
            </div>
          </div>

          <aside className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-black/50">Navigasi Cepat</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                { href: '#quick-start', label: 'Quick Start 2 Menit' },
                { href: '#role-guide', label: 'Panduan per Role' },
                { href: '#flow-guide', label: 'Alur Pertandingan' },
                { href: '#troubleshooting', label: 'Troubleshooting' },
                { href: '#faq', label: 'FAQ' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-transparent px-3 py-2 text-black/75 transition-colors hover:border-black/10 hover:bg-black/[0.03] hover:text-black"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {quickStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-black/10 bg-white/95 px-5 py-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">{item.label}</p>
              <p className="mt-1 text-xl font-black uppercase tracking-wide">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 space-y-8" id="quick-start">
          <SectionTitle
            id="quick-start-title"
            kicker="2 Menit"
            title="Quick Start"
            description="Ikuti urutan ini untuk jalankan pertandingan pertama dengan cepat dan aman."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {quickStartSteps.map((step, index) => (
              <article key={step.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition-[border-color,transform] hover:-translate-y-1 hover:border-black/25">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-black text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black/55">
                    {step.action}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-8" id="role-guide">
          <SectionTitle
            id="role-guide-title"
            kicker="Role Based"
            title="Panduan per Peran"
            description="Beda role, beda fokus. Pakai checklist di bawah sesuai peran tim event kamu."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {roleGuides.map((guide) => (
              <article key={guide.role} className="flex min-h-80 flex-col rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm">
                <h3 className="font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-[0.06em] text-black">
                  {guide.role}
                </h3>
                <p className="mt-2 text-sm text-black/65">{guide.objective}</p>
                <ul className="mt-4 space-y-2 text-sm text-black/75">
                  {guide.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={guide.cta.href}
                  className="mt-auto inline-flex w-max rounded-full border border-black/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black/70 transition-colors hover:border-black/40 hover:text-black"
                >
                  {guide.cta.label}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-8" id="flow-guide">
          <SectionTitle
            id="flow-guide-title"
            kicker="Match Operations"
            title="Alur Pertandingan"
            description="Ritme operasional dari sebelum match, saat match, sampai penutupan."
          />

          <div className="space-y-4">
            {matchFlow.map((flow) => (
              <article key={flow.phase} className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm md:p-7">
                <h3 className="text-2xl font-bold text-black">{flow.phase}</h3>
                <ul className="mt-4 space-y-2 text-sm text-black/70 md:text-base">
                  {flow.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-black/55" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-8" id="troubleshooting">
          <SectionTitle
            id="troubleshooting-title"
            kicker="When Things Go Wrong"
            title="Troubleshooting Cepat"
            description="Masalah umum di venue dan solusi singkat yang bisa langsung dipraktikkan."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {troubleshooting.map((item) => (
              <article key={item.issue} className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black">{item.issue}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{item.fix}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-8" id="faq">
          <SectionTitle
            id="faq-title"
            kicker="FAQ"
            title="Pertanyaan yang Sering Muncul"
            description="Jawaban ringkas untuk pertanyaan operasional paling umum."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.q} className="rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-black/10 bg-black p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Siap Operasional</p>
          <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.06em] md:text-5xl">
            Jalankan Match Pertama Kamu
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Kalau kamu baru mulai, langsung ke Pusat Kontrol. Kalau tim butuh pemahaman cepat, share halaman guide ini ke operator dan wasit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex rounded-full bg-[#F59E0B] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-black transition-transform hover:-translate-y-0.5"
            >
              Buka Pusat Kontrol
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/85 transition-colors hover:border-white/45 hover:text-white"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
