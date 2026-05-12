'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation } from 'convex/react'; 
import { api } from '@/convex/_generated/api'; 
import { Loader2, Trash2, MonitorPlay } from 'lucide-react'; 
import { loadValidAdminSession } from '@/lib/admin-session'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function MediaManager() {
  const assets = useQuery(api.media.list);
  const createAsset = useMutation(api.media.create);
  const removeAsset = useMutation(api.media.remove);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);

  const [adminSessionToken, setAdminSessionToken] = useState('');
  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
  }, []);

  const authorizedMatches = useQuery(
    api.matches.listAdmin,
    adminSessionToken ? { adminSessionToken } : 'skip',
  );
  const updateAds = useMutation(api.matches.updateAds);

  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'image' | 'video'>('image'); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [selectedMatchId, setSelectedMatchId] = useState<string>(''); 
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setNewItemName(e.target.files[0].name.split('.')[0]);
      setNewItemUrl('');
    }
  };

  const handleAdd = async () => { 
    if ((!newItemUrl && !selectedFile) || !newItemName) return; 
    setIsSubmitting(true); 
    setFeedback(null);
    try { 
      let finalUrl = newItemUrl; 
      let storageId = undefined; 

      if (selectedFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile,
        });
        const { storageId: uploadedStorageId } = await result.json();
        storageId = uploadedStorageId;
        finalUrl = `STORAGE:${uploadedStorageId}`;
      }

      await createAsset({
        name: newItemName,
        url: finalUrl,
        type: newItemType,
        storageId,
      });
      setNewItemUrl(''); 
      setNewItemName(''); 
      setSelectedFile(null); 
      setFeedback({
        type: 'success',
        message: 'Media berhasil ditambahkan ke library.',
      });
    } catch (e) { 
      console.error(e); 
      setFeedback({
        type: 'error',
        message: 'Gagal mengunggah media. Silakan coba lagi.',
      });
    } finally { 
      setIsSubmitting(false); 
    } 
  }; 

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeAsset({ id: deleteTarget.id as any });
      setFeedback({
        type: 'success',
        message: `Media '${deleteTarget.name}' berhasil dihapus.`,
      });
    } catch (e) {
      console.error(e);
      setFeedback({
        type: 'error',
        message: 'Gagal menghapus media. Silakan coba lagi.',
      });
    } finally {
      setDeleteTarget(null);
    }
  }; 

  const handlePushToDisplay = async (assetId: string) => { 
    if (!selectedMatchId) { 
      setFeedback({
        type: 'error',
        message: 'Pilih match tujuan terlebih dahulu.',
      });
      return; 
    } 
    try {
      await updateAds({ 
        matchId: selectedMatchId, 
        role: 'admin', 
        adminSessionToken, 
        active: true, 
        assetId: assetId, 
      });
      setFeedback({
        type: 'success',
        message: 'Media berhasil ditayangkan ke display.',
      });
    } catch (e) {
      console.error(e);
      setFeedback({
        type: 'error',
        message: 'Gagal menayangkan media ke display.',
      });
    }
  }; 

  const handleClearDisplay = async () => { 
    if (!selectedMatchId) return; 
    try {
      await updateAds({ 
        matchId: selectedMatchId, 
        role: 'admin', 
        adminSessionToken, 
        active: false, 
        assetId: undefined, 
      });
      setFeedback({
        type: 'success',
        message: 'Media pada display berhasil dibersihkan.',
      });
    } catch (e) {
      console.error(e);
      setFeedback({
        type: 'error',
        message: 'Gagal membersihkan media pada display.',
      });
    }
  }; 

  return ( 
    <div className="space-y-8 max-w-6xl mx-auto"> 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> 
        <div> 
          <h1 className="text-2xl font-bold tracking-tight">Media Aset</h1> 
          <p className="text-muted-foreground"> 
            Kelola gambar dan video untuk jeda pertandingan. 
          </p> 
        </div> 

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-xs font-bold uppercase text-muted-foreground ml-2"> 
            Match Tujuan: 
          </span> 
          <select
            className="h-8 text-sm border-none bg-transparent focus:ring-0 cursor-pointer min-w-[200px]"
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
          >
            <option value="">-- Pilih Match Aktif --</option> 
            {authorizedMatches?.map((m: any, i: number) => ( 
              <option key={m._id || i} value={m.matchId}> 
                {m.matchId} ({m.category || 'Pertandingan'}) 
              </option> 
            ))} 
          </select> 
          {selectedMatchId && ( 
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDisplay}
              className="text-red-500 hover:text-red-700 h-8"
            > 
              Bersihkan Display 
            </Button> 
          )} 
        </div> 
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
        <h3 className="font-bold mb-4">Tambah Aset Baru</h3> 
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_auto] gap-4 items-end"> 
          <div className="space-y-2"> 
            <label className="text-xs font-bold text-muted-foreground uppercase"> 
              Nama Aset 
            </label> 
            <Input 
              placeholder="Contoh: Banner Sponsor" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
            /> 
          </div> 

          <div className="space-y-2"> 
            <label className="text-xs font-bold text-muted-foreground uppercase"> 
              Sumber (File atau URL) 
            </label> 
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                />
                <div className="h-10 w-full border border-input rounded-md px-3 py-2 text-sm text-muted-foreground flex items-center truncate">
                  {selectedFile 
                    ? selectedFile.name 
                    : newItemUrl 
                      ? 'Menggunakan URL...' 
                      : 'Klik untuk upload atau tempel URL ->'} 
                </div> 
              </div> 
              {!selectedFile && (
                <Input
                  placeholder="https://..."
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  className="w-1/2"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase"> 
              Tipe 
            </label> 
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newItemType}
              onChange={(e) =>
                setNewItemType(e.target.value as 'image' | 'video')
              }
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <Button 
            onClick={handleAdd} 
            disabled={isSubmitting || (!newItemUrl && !selectedFile)} 
          > 
            {isSubmitting ? ( 
              <Loader2 className="w-4 h-4 animate-spin" /> 
            ) : ( 
              'Tambah Aset' 
            )} 
          </Button> 
        </div> 
      </Card> 

      <div className="space-y-4"> 
        <h3 className="font-bold text-lg">Perpustakaan ({assets?.length || 0})</h3> 
        {!assets ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset: any) => {
              const displayUrl = asset.storageId
                ? `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${asset.storageId}`
                : asset.url;

              return (
                <Card
                  key={asset._id}
                  className="overflow-hidden group relative"
                >
                  <div className="aspect-video bg-black/10 relative flex items-center justify-center">
                    {asset.type === 'image' ? (
                      <img
                        src={displayUrl}
                        alt={asset.name}
                        width={1920}
                        height={1080}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={displayUrl}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handlePushToDisplay(asset._id)} 
                        disabled={!selectedMatchId} 
                        aria-label={`Tayangkan ${asset.name} ke display`}
                      > 
                        <MonitorPlay className="w-4 h-4 mr-2" /> 
                        Tayang ke Display 
                      </Button> 
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        aria-label={`Hapus aset ${asset.name}`}
                        onClick={() =>
                          setDeleteTarget({ id: asset._id, name: asset.name })
                        } 
                      > 
                        <Trash2 className="w-4 h-4" /> 
                      </Button> 
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold truncate">{asset.name}</span>
                      <span className="text-xs uppercase font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                        {asset.type}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )} 
      </div> 

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Media?</AlertDialogTitle>
            <AlertDialogDescription>
              Aset
              {' '}
              <strong>{deleteTarget?.name || '-'}</strong>
              {' '}
              akan dihapus permanen dari library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div> 
  ); 
} 

