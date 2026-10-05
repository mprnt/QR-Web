'use client';

import { useEffect, useState } from 'react';
import { Kiosk, listKiosks } from '@/lib/api/client';

interface KioskSelectorProps {
  onSelect: (kiosk: Kiosk) => void;
  isLoading?: boolean;
}

export function KioskSelector({ onSelect, isLoading }: KioskSelectorProps) {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchKiosks = async () => {
      try {
        setLoading(true);
        const data = await listKiosks();
        setKiosks(data);
        if (data.length > 0) {
          setSelectedId(data[0].kioskId);
        }
      } catch (err: any) {
        console.error('Failed to load kiosks:', err);
        setError(err.message || 'Failed to load kiosks');
      } finally {
        setLoading(false);
      }
    };

    fetchKiosks();
  }, []);

  const handleSelect = () => {
    if (selectedId) {
      const selected = kiosks.find(k => k.kioskId === selectedId);
      if (selected) {
        onSelect(selected);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 border-success/20';
      case 'maintenance':
        return 'bg-warning/10 border-warning/20';
      case 'offline':
        return 'bg-error/10 border-error/20';
      default:
        return 'bg-surface-secondary border-border';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">Active</span>;
      case 'maintenance':
        return <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">Maintenance</span>;
      case 'offline':
        return <span className="px-2 py-1 bg-error/20 text-error text-xs rounded-full">Offline</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
            <svg className="w-6 h-6 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-text-muted">Loading kiosks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error/20 rounded-lg p-4">
        <p className="text-error text-sm">{error}</p>
      </div>
    );
  }

  if (kiosks.length === 0) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <p className="text-warning text-sm">No kiosks available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {kiosks.map((kiosk) => (
          <button
            key={kiosk.kioskId}
            onClick={() => setSelectedId(kiosk.kioskId)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedId === kiosk.kioskId
                ? 'border-primary bg-primary/5'
                : 'border-border bg-surface-secondary hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-text">{kiosk.name}</h3>
                <p className="text-sm text-text-muted">{kiosk.location}</p>
              </div>
              {getStatusBadge(kiosk.status)}
            </div>

            {kiosk.capabilities && (
              <div className="flex flex-wrap gap-2 mt-3">
                {kiosk.capabilities.supportsColor && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Color</span>
                )}
                {kiosk.capabilities.supportsDoubleSided && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Double-sided</span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleSelect}
        disabled={!selectedId || isLoading}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Start Printing'}
      </button>
    </div>
  );
}
