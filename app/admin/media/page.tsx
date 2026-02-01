'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string; // URL based for SaaS scalability
  name: string;
}

export default function MediaManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: '1',
      type: 'image',
      name: 'Sponsor Banner',
      url: 'https://via.placeholder.com/1920x1080?text=SPONSOR',
    },
    {
      id: '2',
      type: 'video',
      name: 'Intro Video',
      url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    },
  ]);

  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'image' | 'video'>('image');

  const handleAdd = () => {
    if (!newItemUrl || !newItemName) return;

    const newAsset: MediaAsset = {
      id: Date.now().toString(),
      type: newItemType,
      name: newItemName,
      url: newItemUrl,
    };

    setAssets([...assets, newAsset]);
    setNewItemUrl('');
    setNewItemName('');
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media Assets</h1>
        <p className="text-muted-foreground">
          Manage images and videos for match breaks.
        </p>
      </div>

      {/* Add New Asset */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Add New Asset</h3>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_auto] gap-4 items-end">
          <div className="space-y-2">
            <label
              htmlFor="asset-name"
              className="text-xs font-bold text-muted-foreground uppercase"
            >
              Asset Name
            </label>
            <Input
              id="asset-name"
              name="assetName"
              autoComplete="off"
              placeholder="Asset name (e.g. Nike Commercial)…"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="asset-url"
              className="text-xs font-bold text-muted-foreground uppercase"
            >
              URL
            </label>
            <Input
              id="asset-url"
              name="assetUrl"
              autoComplete="url"
              type="url"
              placeholder="https://example.com/asset…"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="asset-type"
              className="text-xs font-bold text-muted-foreground uppercase"
            >
              Type
            </label>
            <select
              id="asset-type"
              name="assetType"
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
          <Button onClick={handleAdd}>Add Asset</Button>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Library ({assets.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden group relative">
              <div className="aspect-video bg-black/10 relative flex items-center justify-center">
                {asset.type === 'image' ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(asset.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold truncate">{asset.name}</span>
                  <span className="text-[10px] uppercase font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    {asset.type}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate font-mono mt-1 opacity-50">
                  {asset.url}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
