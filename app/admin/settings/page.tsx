'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ADMIN_AUTH_STORAGE_KEY } from '@/lib/auth';

export default function SettingsPage() {
  const [pin, setPin] = useState('');
  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setPin(p.pin);
      } catch {}
    }
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
    try {
      await updateSetting({
        key: 'primaryColor',
        value: primaryColor,
        adminPin: pin,
      });
      alert('Settings saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure global application settings and defaults.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Display Defaults</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
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
              Used for accents, highlights, and active states on the scoreboard.
            </p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">System Info</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span>Version</span>
            <span className="font-mono">v1.0.0-beta</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Environment</span>
            <span className="font-mono">Production (Convex)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Status</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Operational
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

