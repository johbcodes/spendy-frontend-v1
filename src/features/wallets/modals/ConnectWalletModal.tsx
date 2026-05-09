import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Wallet } from '../../../types';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  eventId: string;
  eventName: string;
  onSuccess: (walletId: string) => void;
}

export function ConnectWalletModal({
  isOpen,
  onClose,
  wallets,
  eventId,
  eventName,
  onSuccess
}: ConnectWalletModalProps) {
  // Normalize wallets prop
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [selectedWalletId, setSelectedWalletId] = useState('');

  // Don't render if no eventId provided
  if (!eventId && isOpen) {
    console.error('ConnectWalletModal: eventId is required');
    return null;
  }

  // Filter out wallets already linked to this event
  const availableWallets = walletsArray.filter((w: Wallet) => w.linkedEvent !== eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletId) return;

    onSuccess(selectedWalletId);
    setSelectedWalletId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet to Event" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Event:</strong> {eventName}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Select an existing wallet to connect to this event
          </p>
        </div>

        <Select
          label="Select Wallet"
          value={selectedWalletId}
          onChange={(e) => setSelectedWalletId(e.target.value)}
          options={[
            { value: '', label: 'Choose a wallet...' },
            ...availableWallets.map((wallet: Wallet) => ({
              value: wallet.id,
              label: `${wallet.name} - KES ${wallet.balance.toLocaleString()} (${wallet.type})`
            }))
          ]}
          required
        />

        {availableWallets.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No available wallets to connect. All wallets are either already linked to this event or you need to create a new wallet first.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedWalletId}>
            Connect Wallet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
