import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import type { Wallet } from '../../../types';

interface EditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet;
  onSuccess: (updatedWallet: Wallet) => void;
}

export function EditWalletModal({
  isOpen,
  onClose,
  wallet,
  onSuccess
}: EditWalletModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    linkedEvent: ''
  });

  useEffect(() => {
    if (wallet && isOpen) {
      setFormData({
        name: wallet.name,
        linkedEvent: wallet.linkedEvent || ''
      });
    }
  }, [wallet, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet || !formData.name.trim()) {
      return;
    }

    const updatedWallet: Wallet = {
      ...wallet,
      name: formData.name,
      linkedEvent: formData.linkedEvent || undefined
    };

    onSuccess(updatedWallet);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Wallet" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Wallet Name"
          value={formData.name}
          onChange={(e) => setFormData({
            ...formData,
            name: e.target.value
          })}
          required
        />

        <Input
          label="Linked Event (Optional)"
          value={formData.linkedEvent}
          onChange={(e) => setFormData({
            ...formData,
            linkedEvent: e.target.value
          })}
          placeholder="Enter linked event name"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Wallet</Button>
        </div>
      </form>
    </Modal>
  );
}
