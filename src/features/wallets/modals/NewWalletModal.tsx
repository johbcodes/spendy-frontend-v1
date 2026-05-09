import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { User, Wallet } from '../../../types';
interface NewWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Partial<Wallet>) => void;
  events: any[];
  currentUser: User;
}
export function NewWalletModal({
  isOpen,
  onClose,
  onSuccess,
  events,
  currentUser
}: NewWalletModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    linkedEvent: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const walletData = {
      ...formData,
      type: 'SYSTEM',
      balance: 0, // New wallets start with 0 balance
      status: 'Active',
      currency: 'KES', // Always use Kenyan Shilling
      createdAt: new Date().toISOString()
    } as Partial<Wallet>;

    onSuccess(walletData);
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="New Wallet" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Wallet Name" value={formData.name} onChange={e => setFormData({
        ...formData,
        name: e.target.value
      })} required />

        <Select
          label="Linked Event"
          options={[{
            value: '',
            label: 'None'
          }, ...events.map(e => ({
            value: e.id,
            label: e.name
          }))]}
          value={formData.linkedEvent}
          onChange={e => setFormData({
            ...formData,
            linkedEvent: e.target.value
          })}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Wallet</Button>
        </div>
      </form>
    </Modal>;
}
