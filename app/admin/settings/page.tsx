'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loadValidAdminSession } from '@/lib/admin-session';

export default function SettingsPage() { 
  const [adminSessionToken, setAdminSessionToken] = useState(''); 
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
  }, []);

  const existingColor = useQuery(api.settings.get, { key: 'primaryColor' });
  const updateSetting = useMutation(api.settings.update);

  const [primaryColor, setPrimaryColor] = useState('#fbbf24');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingColor) {
      setPrimaryColor(existingColor);
    }
  }, [existingColor]);

  const handleSave = async () => { 
    setIsSaving(true); 
    setFeedback(null);
    try { 
      await updateSetting({ 
        key: 'primaryColor', 
        value: primaryColor, 
        adminSessionToken, 
      }); 
      setFeedback({
        type: 'success',
        message: 'Pengaturan berhasil disimpan.',
      });
    } catch (e) { 
      console.error(e); 
      setFeedback({
        type: 'error',
        message: 'Gagal menyimpan pengaturan. Silakan coba lagi.',
      });
    } finally { 
      setIsSaving(false); 
    } 
  }; 

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div> 
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1> 
        <p className="text-muted-foreground"> 
          Atur pengaturan global dan nilai bawaan aplikasi. 
        </p> 
      </div> 

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <Card className="p-6"> 
        <h3 className="font-bold text-lg mb-4">Nilai Bawaan Display</h3> 
        <div className="space-y-4 max-w-md"> 
          <div className="space-y-2"> 
            <Label htmlFor="primary-color">Warna Utama</Label> 
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground"> 
              Dipakai untuk aksen, sorotan, dan state aktif pada scoreboard. 
            </p> 
          </div> 

          <div className="pt-4"> 
            <Button onClick={handleSave} disabled={isSaving}> 
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'} 
            </Button> 
          </div> 
        </div> 
      </Card> 

      <Card className="p-6"> 
        <h3 className="font-bold text-lg mb-4">Informasi Sistem</h3> 
        <div className="text-sm text-muted-foreground space-y-2"> 
          <div className="flex justify-between border-b pb-2"> 
            <span>Versi</span> 
            <span className="font-mono">v1.0.0-beta</span> 
          </div> 
          <div className="flex justify-between border-b pb-2"> 
            <span>Lingkungan</span> 
            <span className="font-mono">Production (Convex)</span> 
          </div> 
          <div className="flex justify-between py-2"> 
            <span>Status</span> 
            <span className="text-emerald-500 font-bold flex items-center gap-1"> 
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
              Operasional 
            </span> 
          </div> 
        </div> 
      </Card> 
    </div>
  );
}

