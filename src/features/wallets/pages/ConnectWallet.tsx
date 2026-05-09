import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Wallet } from '../../../types';
import { ArrowLeftIcon, CheckCircleIcon } from 'lucide-react';

interface ConnectWalletPageProps {
  wallets: Wallet[];
  eventId: string;
  eventName: string;
  onNavigate: (page: string) => void;
  onConnect: (walletId: string) => void;
}

export function ConnectWalletPage({
  wallets,
  eventId,
  eventName,
  onNavigate,
  onConnect
}: ConnectWalletPageProps) {
  // Normalize wallets data - handle both array and API response object
  const walletsArray = Array.isArray(wallets) ? wallets : (wallets as any)?.data || [];

  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!eventId) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('events')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Event not found</p>
        </Card>
      </div>
    );
  }

  const availableWallets = walletsArray.filter(w => !w.linkedEvent || w.linkedEvent !== eventId);
  const selectedWallet = walletsArray.find(w => w.id === selectedWalletId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWalletId) return;

    setIsProcessing(true);
    setTimeout(() => {
      onConnect(selectedWalletId);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('event-detail');
      }, 1500);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => onNavigate('events')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Wallet Connected</h2>
          <p className="text-gray-600">
            The wallet has been successfully connected to "{eventName}".
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('events')} className="p-0">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-dark-gray">Connect Wallet to Event</h1>
          <p className="text-gray-600 mt-1">Link an existing wallet to "{eventName}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  <strong>Event:</strong> {eventName}
                </p>
                <p className="text-xs text-blue-600">
                  Select an existing wallet to connect to this event for payment and transaction tracking
                </p>
              </div>

              {/* Wallet Selection */}
              <div>
                <h3 className="text-lg font-semibold text-dark-gray mb-4">Select Wallet</h3>
                
                {availableWallets.length > 0 ? (
                  <Select
                    label="Available Wallets"
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    options={[
                      { value: '', label: 'Choose a wallet...' },
                      ...availableWallets.map(wallet => ({
                        value: wallet.id,
                        label: `${wallet.name} - KES ${wallet.balance.toLocaleString()}`
                      }))
                    ]}
                    required
                  />
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No available wallets to connect. All wallets are already linked to events or you need to create a new wallet.
                    </p>
                  </div>
                )}
              </div>

              {/* Wallet Preview */}
              {selectedWallet && (
                <Card className="p-4 bg-light-gray border border-gray-200">
                  <h4 className="font-semibold text-dark-gray mb-3">Wallet Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-dark-gray">{selectedWallet.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-dark-gray">{selectedWallet.type}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600 font-medium">Balance:</span>
                      <span className="font-bold text-azure">KES {selectedWallet.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${selectedWallet.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedWallet.status}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Info Box */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>✓ Note:</strong> Connected wallets can be used for event payments and transactions. You can still use the wallet for other purposes.
                </p>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <Card className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                    <p className="text-sm font-medium text-yellow-800">Connecting wallet...</p>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onNavigate('events')}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedWalletId || isProcessing}
                  className={(!selectedWalletId || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Connect Wallet
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar - All Wallets */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-dark-gray mb-4">All Wallets</h3>
            <div className="space-y-2">
              {walletsArray.length > 0 ? (
                walletsArray.map(wallet => (
                  <div
                    key={wallet.id}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedWalletId === wallet.id
                        ? 'bg-azure bg-opacity-10 border border-azure'
                        : wallet.linkedEvent === eventId
                        ? 'bg-gray-50 opacity-50 border border-gray-200'
                        : 'bg-light-gray border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (!wallet.linkedEvent || wallet.linkedEvent === eventId) {
                        setSelectedWalletId(wallet.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark-gray">{wallet.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          KES {wallet.balance.toLocaleString()}
                        </p>
                      </div>
                      {wallet.linkedEvent === eventId && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No wallets available</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
