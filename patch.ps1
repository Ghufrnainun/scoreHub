$src = "d:\VsCode\Scoreboard\app\match\[id]\control\page.tsx"
$dst = "d:\VsCode\Scoreboard\app\referee\match\[id]\page.tsx"
$content = Get-Content $src -Raw

$content = $content -replace "export default function ControlPage\(\) \{", "export default function RefereeMatchPage() {"
$content = $content -replace "import \{ useParams, useSearchParams \}", "import { useParams }"
$content = $content -replace "import \{ useMatch \} from '@\/hooks\/use-match';", "import { useMatch } from '@/hooks/use-match';
import { loadRefereeSession } from '@/lib/auth';"
$content = $content -replace "const searchParams = useSearchParams\(\);", "const [token, setToken] = useState<string | undefined>(undefined);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const session = loadRefereeSession(matchId);
    setToken(session?.token);
    setSessionReady(true);
  }, [matchId]);"
$content = $content -replace "const role = \(searchParams\.get\('role'\) \|\| 'admin'\) as MatchRole;", "const role = 'referee' as MatchRole;"
$content = $content -replace "const pin = searchParams\.get\('pin'\) \|\| undefined;", ""
$content = $content -replace "const token = searchParams\.get\('token'\) \|\| undefined;", ""

$unauth = "  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center">
        <div className="text-sm font-mono text-black/60">
          Menyiapkan sesi wasit...
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] px-4 py-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-black/50 font-bold">
            Sesi Wasit Tidak Ditemukan
          </p>
          <h1 className="mt-3 text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase">
            Masuk Terlebih Dahulu
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Sesi wasit tidak ditemukan. Masuk lewat halaman join menggunakan
            display code + PIN.
          </p>
          <Link href="/referee/join" className="inline-block mt-6">
            <Button className="rounded-full bg-[#111827] hover:bg-black text-white text-xs uppercase tracking-widest font-bold">
              Ke Halaman Masuk Wasit
            </Button>
          </Link>
        </div>
      </div>
    );
  }"

$content = $content -replace "  if \(isLoading \|\| !match\)", "$unauth

  if (isLoading || !match)"
$content = $content -replace "<Link href="/admin" className="group flex items-center gap-2">", "<div className="group flex items-center gap-2">"
$content = $content -replace "<\/Link>
.*<div className="h-6 w-px", "</div>
          <div className="h-6 w-px"

Set-Content -Path $dst -Value $content
