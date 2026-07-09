'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation } from 'convex/react'; 
import { api } from '@/convex/_generated/api'; 
import { 
  Loader2, 
  Trash2, 
  MonitorPlay, 
  UploadCloud, 
  Sparkles, 
  Database, 
  AlertCircle, 
  PlusCircle, 
  Plus, 
  ChevronDown,
  CheckCircle2,
  Image as ImageIcon, 
  Video as VideoIcon 
} from 'lucide-react'; 
import { loadValidAdminSession } from '@/lib/admin-session'; 
import { cn } from '@/lib/utils'; 
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const updateAdsBroadcast = useMutation(api.matches.updateAdsBroadcast);

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

  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setNewItemName(file.name.split('.')[0]);
    setNewItemUrl('');
    
    // Auto-detect type
    if (file.type.startsWith('video/')) {
      setNewItemType('video');
    } else {
      setNewItemType('image');
    }

    // Generate preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl('');
    }
  };

  const isFileSizeValid = (file: File) => {
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 15 * 1024 * 1024;
    if (file.type.startsWith('video/')) {
      return file.size <= MAX_VIDEO_SIZE;
    }
    return file.size <= MAX_IMAGE_SIZE;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAdd = async () => { 
    if ((!newItemUrl && !selectedFile) || !newItemName) return; 
    setIsSubmitting(true); 
    setFeedback(null);
    try { 
      let finalUrl = newItemUrl; 
      let storageId = undefined; 

      if (selectedFile) {
        // Validasi ukuran file: Maksimal 5MB untuk gambar, 15MB untuk video
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const MAX_VIDEO_SIZE = 15 * 1024 * 1024;

        if (newItemType === 'image' && selectedFile.size > MAX_IMAGE_SIZE) {
          throw new Error('Ukuran gambar melebihi batas maksimal (5MB).');
        }
        if (newItemType === 'video' && selectedFile.size > MAX_VIDEO_SIZE) {
          throw new Error('Ukuran video melebihi batas maksimal (15MB).');
        }

        const postUrl = await generateUploadUrl({ adminSessionToken });
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
        adminSessionToken,
      });
      setNewItemUrl(''); 
      setNewItemName(''); 
      setSelectedFile(null); 
      setFilePreviewUrl('');
      setFeedback({
        type: 'success',
        message: 'Media berhasil ditambahkan ke library.',
      });
    } catch (e: any) { 
      console.error(e); 
      const msg =
        e?.data && typeof e.data === 'string'
          ? e.data
          : e?.message && typeof e.message === 'string' && !e.message.includes('Server Error')
            ? e.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal mengunggah media. Silakan coba lagi.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    } finally { 
      setIsSubmitting(false); 
    } 
  }; 

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeAsset({ id: deleteTarget.id as any, adminSessionToken });
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
      if (selectedMatchId === 'ALL') {
        await updateAdsBroadcast({
          adminSessionToken,
          active: true,
          assetId,
        });
      } else {
        await updateAds({ 
          matchId: selectedMatchId, 
          role: 'admin', 
          adminSessionToken, 
          active: true, 
          assetId: assetId, 
        });
      }
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
      if (selectedMatchId === 'ALL') {
        await updateAdsBroadcast({
          adminSessionToken,
          active: false,
          assetId: undefined,
        });
      } else {
        await updateAds({ 
          matchId: selectedMatchId, 
          role: 'admin', 
          adminSessionToken, 
          active: false, 
          assetId: undefined, 
        });
      }
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

  const isAssetActive = (assetId: string) => {
    if (!selectedMatchId) return false;
    if (selectedMatchId === 'ALL') {
      const activeMatches = authorizedMatches?.filter((m: any) => m.status !== 'finished') || [];
      if (activeMatches.length === 0) return false;
      return activeMatches.every((m: any) => m.ads?.active && m.ads?.currentAssetId === assetId);
    } else {
      const match = authorizedMatches?.find((m: any) => m.matchId === selectedMatchId);
      return !!(match?.ads?.active && match?.ads?.currentAssetId === assetId);
    }
  };

  return ( 
    <div className="space-y-7 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-1">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-primary" />
            Media & Iklan
          </h1> 
          <p className="text-sm text-muted-foreground mt-1 font-medium leading-relaxed">
            Kelola dan siarkan media jeda pertandingan secara langsung ke display lapangan. 
          </p> 
        </div> 

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-auto">
          <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-3"> 
            Match Tujuan: 
          </span> 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 px-3 gap-2 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl w-full sm:w-auto justify-between">
                {selectedMatchId === '' ? (
                  <span className="text-slate-400 dark:text-slate-500">-- Pilih Match Aktif --</span>
                ) : selectedMatchId === 'ALL' ? (
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Semua Lapangan (Siaran)
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    {selectedMatchId} ({authorizedMatches?.find((m: any) => m.matchId === selectedMatchId)?.category || 'Pertandingan'})
                  </span>
                )}
                <ChevronDown className="w-4 h-4 opacity-55" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[260px] p-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
              <DropdownMenuItem 
                onClick={() => setSelectedMatchId('')}
                className="rounded-lg py-2 cursor-pointer font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                -- Pilih Match Aktif --
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedMatchId('ALL')}
                className="rounded-lg py-2 cursor-pointer font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Semua Lapangan (Siaran)
              </DropdownMenuItem>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Daftar Pertandingan
              </div>
              {authorizedMatches && authorizedMatches.length > 0 ? (
                authorizedMatches.map((m: any, i: number) => {
                  const isLive = m.status === 'live' || m.status === 'active';
                  return (
                    <DropdownMenuItem
                      key={m._id || i}
                      onClick={() => setSelectedMatchId(m.matchId)}
                      className={cn(
                        "rounded-lg py-2 cursor-pointer flex items-center justify-between",
                        selectedMatchId === m.matchId ? "bg-slate-100 dark:bg-slate-800 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        )} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{m.matchId}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        {m.category || 'Pertandingan'}
                      </span>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                  Tidak ada match aktif
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedMatchId && ( 
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearDisplay}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-10 rounded-xl font-bold px-3 transition-all w-full sm:w-auto"
            > 
              Bersihkan Display 
            </Button> 
          )} 
        </div> 
      </div> 

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col justify-center min-h-[92px]">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Aset</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">{assets?.length || 0}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col justify-center min-h-[92px]">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sedang Tayang</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 leading-none">
            {authorizedMatches ? authorizedMatches.filter((m: any) => m.ads?.active).length : 0}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col justify-center min-h-[92px]">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Penyimpanan</p>
          <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 flex flex-col justify-center leading-normal">
            <span>{assets ? `${assets.filter((a: any) => a.type === 'image').length} Gambar` : '0 Gambar'}</span>
            <span>{assets ? `${assets.filter((a: any) => a.type === 'video').length} Video` : '0 Video'}</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col justify-center min-h-[92px]">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Match Aktif</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">
            {authorizedMatches ? authorizedMatches.filter((m: any) => m.status !== 'finished').length : 0}
          </p>
        </div>
      </div>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 shadow-xs transition-all ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      {!selectedMatchId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/30 dark:bg-amber-950/15 p-4 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-wide">Match Tujuan Belum Dipilih</h4>
            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
              Silakan pilih <strong>Match Tujuan</strong> pada selektor di pojok kanan atas terlebih dahulu untuk mengaktifkan tombol penyiaran media ke layar display masing-masing lapangan.
            </p>
          </div>
        </div>
      ) : null}

      {/* Add New Asset Card */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Tambah Aset Baru
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Unggah gambar atau video iklan untuk ditayangkan.</p>
          </div>

          {/* Tab buttons */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('file');
                setNewItemUrl('');
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none",
                activeTab === 'file'
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              )}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              onClick={() => {
                setActiveTab('url');
                setSelectedFile(null);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none",
                activeTab === 'url'
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Link URL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Nama Aset
              </label>
              <Input
                placeholder="Contoh: Banner Sponsor Utama"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Tipe Media
              </label>
              <select
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus-visible:ring-primary/20 cursor-pointer font-semibold text-slate-800 dark:text-slate-200"
                value={newItemType}
                onChange={(e) =>
                  setNewItemType(e.target.value as 'image' | 'video')
                }
              >
                <option value="image">Image (JPG, PNG, GIF, WebP)</option>
                <option value="video">Video (MP4, WebM)</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-8 h-full flex flex-col justify-end">
            {activeTab === 'file' ? (
              <div className="space-y-3 w-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  Unggah Berkas
                </label>
                
                {/* Drag and Drop Zone */}
                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative group h-40 min-h-[160px]",
                      isDragging
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20"
                    )}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                      accept="image/*,video/*"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Seret & taruh berkas di sini, atau klik untuk memilih
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Maksimal 5MB untuk Gambar, 15MB untuk Video
                    </p>
                  </div>
                ) : (
                  /* File selected preview box */
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between gap-4 h-40 min-h-[160px]">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center border border-black/5 relative">
                        {newItemType === 'image' && filePreviewUrl ? (
                          <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : newItemType === 'video' ? (
                          <VideoIcon className="w-8 h-8 text-primary" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <div className="truncate space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className={cn(
                            "font-bold uppercase text-[9px] px-1.5 py-0.5 rounded-md",
                            isFileSizeValid(selectedFile)
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          )}>
                            {isFileSizeValid(selectedFile) ? 'Ukuran Aman' : 'Terlalu Besar'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl('');
                      }}
                      className="rounded-xl font-bold border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 h-9"
                    >
                      Ganti File
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  Alamat URL Media
                </label>
                <div className="relative flex items-center">
                  <Input
                    placeholder="https://images.unsplash.com/... atau link media eksternal"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 pl-4 pr-12 w-full"
                  />
                  <div className="absolute right-4 text-slate-400">
                    {newItemType === 'video' ? <VideoIcon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-950/30 dark:bg-blue-950/10 p-3 text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                  Catatan URL Eksternal: Pastikan link yang disalin langsung menunjuk ke file media (.png, .jpg, .mp4, dll.) dan dapat diakses publik oleh browser.
                </div>
              </div>
            )}
            
            {/* Submit button bar */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAdd}
                disabled={
                  isSubmitting ||
                  (!newItemUrl && !selectedFile) ||
                  !newItemName ||
                  !!(selectedFile && !isFileSizeValid(selectedFile))
                }
                className="h-11 px-6 rounded-xl font-bold gap-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Simpan Aset ke Library
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Library Section */}
      <div className="space-y-4 pt-4"> 
        <div className="flex justify-between items-center">
          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Perpustakaan Media ({assets?.length || 0})
          </h3> 
        </div>

        {!assets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden animate-pulse">
                <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/30 rounded-3xl py-16 px-4 text-center shadow-sm">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada aset media</p>
            <p className="text-xs text-muted-foreground mt-1">Unggah file atau masukkan link URL untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset: any) => {
              const displayUrl = asset.url;

              return (
                <Card
                  key={asset._id}
                  className={cn(
                    "overflow-hidden group relative transition-all duration-300 rounded-2xl bg-white dark:bg-slate-900 border hover:-translate-y-1",
                    isAssetActive(asset._id)
                      ? "ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-lg shadow-emerald-500/10 border-transparent"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md"
                  )}
                >
                  <div className="relative w-full aspect-video bg-slate-50 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center">
                    {/* Blinking badge for active ad */}
                    {isAssetActive(asset._id) && (
                      <div className="absolute top-3 right-3 z-20 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-black/10 animate-pulse select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        Sedang Tayang
                      </div>
                    )}
                    
                    {/* Media content */}
                    {asset.type === 'image' ? (
                      <img
                        src={displayUrl}
                        alt={asset.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        src={displayUrl}
                        className="absolute inset-0 w-full h-full object-contain"
                        controls
                        preload="metadata"
                      />
                    )}

                    {/* Interactive overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10 p-4">
                      <p className="text-white text-xs font-bold truncate max-w-full mb-1 select-none">
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {isAssetActive(asset._id) ? (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={handleClearDisplay} 
                            aria-label={`Hentikan tayangan ${asset.name}`}
                            className="font-bold shadow-lg rounded-xl h-9 px-4"
                          > 
                            <span className="w-2 h-2 rounded-full bg-white mr-2 animate-ping" />
                            Hentikan Tayangan 
                          </Button> 
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => handlePushToDisplay(asset._id)} 
                            disabled={!selectedMatchId} 
                            aria-label={`Tayangkan ${asset.name} ke display`}
                            className="font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-9 px-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          > 
                            <MonitorPlay className="w-4 h-4 mr-2" /> 
                            Tayangkan 
                          </Button> 
                        )}
                        
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={isAssetActive(asset._id)}
                          aria-label={`Hapus aset ${asset.name}`}
                          onClick={() =>
                            setDeleteTarget({ id: asset._id, name: asset.name })
                          } 
                          className={cn(
                            "rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow-lg",
                            isAssetActive(asset._id) && "bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed hover:bg-slate-800"
                          )}
                          title={isAssetActive(asset._id) ? "Media sedang ditayangkan, tidak bisa dihapus" : "Hapus Media"}
                        > 
                          <Trash2 className="w-4 h-4" /> 
                        </Button> 
                      </div>
                    </div>
                  </div>

                  {/* Card footer details */}
                  <div className="p-4 space-y-2 select-none">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {asset.name}
                      </span>
                      <span className={cn(
                        "text-[9px] uppercase font-black px-2 py-0.5 rounded-md flex-shrink-0 tracking-wider",
                        asset.type === 'video' 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" 
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      )}>
                        {asset.type}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold pt-1 border-t border-black/5 dark:border-white/5">
                      <span className="flex items-center gap-1 font-bold">
                        {asset.storageId ? (
                          <>
                            <Database className="w-3.5 h-3.5 text-slate-400" />
                            Cloud Storage
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                            External Link
                          </>
                        )}
                      </span>
                      <span>{formatDate(asset.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )} 
      </div> 

      {/* Delete Confirmation Alert */}
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

