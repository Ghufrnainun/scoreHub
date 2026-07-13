import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan Operasional | ScoreHub',
  description:
    'Panduan operasional ScoreHub untuk menyiapkan match, mengatur akses wasit, menayangkan skor, dan menangani masalah umum di venue.',
};

const quickStats = [
  { label: 'Update Skor', value: '< 1 detik' },
  { label: 'Riwayat Undo', value: '50 aksi' },
  { label: 'Koneksi Venue', value: 'LAN / WiFi' },
];

const quickStartSteps = [
  {
    title: 'Masuk ke admin',
    description:
      'Buka dashboard admin dengan PIN admin. Dari sana kamu bisa membuat match baru atau membuka match aktif.',
    action: 'Buka /admin',
  },
  {
    title: 'Buat dan lengkapi match',
    description:
      'Isi nama turnamen, format pertandingan, pemain atau roster, template display, kode tampilan, dan PIN wasit.',
    action: 'Klik Buat Pertandingan',
  },
  {
    title: 'Bagikan akses petugas',
    description:
      'Salin link kontrol wasit atau kirim kode tampilan + PIN. Simpan PIN di kanal internal panitia.',
    action: 'Pakai Share Center',
  },
  {
    title: 'Tayangkan ke layar venue',
    description:
      'Buka link display atau masukkan 6 karakter kode tampilan di portal display. Layar ini read-only.',
    action: 'Buka /display',
  },
];

const roleGuides = [
  {
    role: 'Admin / Operator',
    objective: 'Menyiapkan match, layar utama, dan akses petugas sebelum pertandingan dimulai.',
    tasks: [
      'Login ke dashboard admin, lalu buat match dari tombol Buat Pertandingan.',
      'Pilih template display yang paling terbaca untuk jarak penonton.',
      'Catat Kode Tampilan untuk layar dan halaman join wasit.',
      'Bagikan link kontrol wasit dari dialog sukses atau Share Center.',
    ],
    cta: { href: '/admin', label: 'Ke Dashboard Admin' },
  },
  {
    role: 'Wasit',
    objective: 'Menginput reli dengan cepat tanpa menghitung skor manual.',
    tasks: [
      'Masuk lewat link kontrol wasit, atau isi Kode Tampilan dan PIN di halaman join.',
      'Tap tim yang memenangkan reli: Home atau Away.',
      'Cek indikator servis setelah poin masuk.',
      'Gunakan Undo segera kalau terjadi salah tap; aksi berisiko akan meminta konfirmasi.',
    ],
    cta: { href: '/referee/join', label: 'Masuk Sebagai Wasit' },
  },
  {
    role: 'Display / Penonton',
    objective: 'Menampilkan skor realtime di layar besar tanpa membuka akses kontrol.',
    tasks: [
      'Buka link display atau masukkan Kode Tampilan di portal display.',
      'Aktifkan fullscreen browser di TV atau videotron.',
      'Pastikan perangkat tetap tersambung ke jaringan venue.',
      'Biarkan halaman display terbuka sampai match selesai.',
    ],
    cta: { href: '/', label: 'Kembali ke Beranda' },
  },
];

const matchFlow = [
  {
    phase: 'Pra-Match',
    points: [
      'Cek ulang nama pemain atau tim sebelum match dibuat.',
      'Pastikan Kode Tampilan dan PIN wasit hanya diterima petugas yang bertugas.',
      'Buka display lebih awal dan pastikan match yang tampil sesuai lapangan.',
    ],
  },
  {
    phase: 'Saat Match Berjalan',
    points: [
      'Input berdasarkan pemenang reli agar skor, set, dan servis tetap sinkron.',
      'Pantau indikator servis setelah reli penting atau setelah Undo.',
      'Koreksi salah input secepat mungkin agar riwayat tetap mudah diaudit.',
    ],
  },
  {
    phase: 'Akhir Match',
    points: [
      'Cocokkan skor akhir dengan hasil lapangan sebelum layar ditutup.',
      'Simpan Match ID atau Kode Tampilan kalau hasil perlu dicek ulang.',
      'Siapkan match berikutnya dari dashboard admin agar transisi lapangan cepat.',
    ],
  },
];

const troubleshooting = [
  {
    issue: 'Skor di display tidak berubah',
    fix: 'Pastikan wasit dan layar membuka pertandingan yang sama. Cocokkan Kode Tampilan di dashboard, halaman join, dan display.',
  },
  {
    issue: 'Wasit gagal masuk',
    fix: 'Periksa ulang Kode Tampilan dan PIN. Ketik manual bila hasil salin-tempel membawa spasi atau karakter tambahan.',
  },
  {
    issue: 'Input poin salah',
    fix: 'Tekan Undo segera. ScoreHub menyimpan hingga 50 aksi terakhir untuk koreksi cepat.',
  },
  {
    issue: 'Tampilan TV kurang optimal',
    fix: 'Aktifkan fullscreen browser, naikkan brightness layar, dan matikan sleep mode selama pertandingan berjalan.',
  },
];

const faqs = [
  {
    q: 'Apakah ScoreHub bisa dipakai tanpa internet?',
    a: 'Bisa untuk kebutuhan venue lokal selama perangkat kontrol dan display saling terhubung melalui LAN atau WiFi yang sama.',
  },
  {
    q: 'Siapa yang boleh mengubah skor?',
    a: 'Admin dan Wasit. Halaman display bersifat read-only, jadi aman dibuka di layar penonton.',
  },
  {
    q: 'Apa bedanya Match ID dan Kode Tampilan?',
    a: 'Match ID dipakai sistem untuk kontrol internal. Kode Tampilan adalah 6 karakter yang dibagikan ke wasit dan layar display.',
  },
  {
    q: 'Apakah pergantian set otomatis?',
    a: 'Ya. Untuk badminton, ScoreHub mengikuti aturan 21 poin, win by 2, cap 30, dan best of 3.',
  },
  {
    q: 'Kalau koneksi putus sebentar, apakah skor hilang?',
    a: 'Tidak. State match disimpan dan akan tersinkron lagi saat perangkat kembali terhubung.',
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
                Panduan Venue
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
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
              Panduan Lapangan
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-black/65 md:text-lg">
              Satu halaman untuk menjalankan ScoreHub di venue: siapkan match, hubungkan wasit, tayangkan skor, lalu tangani masalah umum tanpa mengganggu ritme pertandingan.
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
                Solusi Saat Live
              </a>
            </div>
          </div>

          <aside className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-black/50">Langsung ke bagian</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {[
                { href: '#quick-start', label: 'Mulai dalam 2 Menit' },
                { href: '#role-guide', label: 'Panduan per Peran' },
                { href: '#flow-guide', label: 'Alur Pertandingan' },
                { href: '#troubleshooting', label: 'Solusi Cepat' },
                { href: '#faq', label: 'Pertanyaan Umum' },
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
            title="Mulai Cepat"
            description="Pakai urutan ini saat setup match pertama atau saat venue butuh transisi cepat."
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
            kicker="Tim Lapangan"
            title="Panduan per Peran"
            description="Setiap petugas punya fokus berbeda. Bagikan bagian ini agar semua orang tahu apa yang perlu dijaga."
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
            kicker="Operasional Match"
            title="Alur Pertandingan"
            description="Ritme kerja dari sebelum match, saat skor berjalan, sampai hasil akhir dikunci."
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
            kicker="Saat Live"
            title="Solusi Cepat"
            description="Masalah yang paling sering muncul di venue, plus tindakan pertama yang bisa langsung dicoba."
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
            title="Pertanyaan Umum"
            description="Jawaban singkat untuk hal yang biasanya ditanyakan operator, wasit, dan panitia."
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
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Siap Dipakai</p>
          <h2 className="mt-3 font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-[0.06em] md:text-5xl">
            Buat Match Pertama
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Mulai dari dashboard admin untuk membuat match. Bagikan halaman ini ke operator dan wasit agar semua petugas memakai alur yang sama.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
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
