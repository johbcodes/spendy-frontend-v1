import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import type { InventoryMovementDraft } from '../rules';

interface EditInventoryMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement?: InventoryMovementDraft;
  onSave: (id: string, data: Partial<InventoryMovementDraft>) => void;
}

export function EditInventoryMovementModal({ isOpen, onClose, movement, onSave }: EditInventoryMovementModalProps) {
  const [form, setForm] = useState<Partial<InventoryMovementDraft>>({});

  useEffect(() => {
    if (movement) setForm(movement);
  }, [movement]);

  if (!movement) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(movement.id, {
      ...form,
      quantity: Number(form.quantity || movement.quantity),
      balance: Number(form.balance || movement.balance),
      cost: Number(form.cost || movement.cost)
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Movement" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Type" value={form.type || movement.type} onChange={e => setForm({ ...form, type: e.target.value as any })} options={[{ value: 'Check Out', label: 'Check Out' }, { value: 'Check In', label: 'Check In' }]} />
        <Input label="Date" type="datetime-local" value={form.date || movement.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label="Quantity" type="number" value={(form.quantity ?? movement.quantity ?? 0).toString()} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
        <Input label="Event/Notes" value={form.event || movement.event || ''} onChange={e => setForm({ ...form, event: e.target.value })} />
        <Input label="Given By / Received By" value={form.givenBy || form.receivedBy || ''} onChange={e => setForm({ ...form, givenBy: e.target.value })} />
        <Input label="Cost" type="number" value={(form.cost ?? movement.cost ?? 0).toString()} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
