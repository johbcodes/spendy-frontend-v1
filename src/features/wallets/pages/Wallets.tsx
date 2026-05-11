import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Wallet, User } from '../../../types';
import {
  WalletIcon,
  ArrowRightLeftIcon,
  TrendingUpIcon,
  EyeIcon,
  TrashIcon,
  CreditCardIcon,
  SmartphoneIcon,
  BuildingIcon,
  UserIcon,
  ZapIcon,
} from 'lucide-react';
import { canDeleteWallet, getWalletDisplayName, getWalletDisplayType, getVisibleWallets } from '../rules';

interface WalletsProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenModal: (modal: string, data?: any) => void;
  wallets: Wallet[];
  onDeleteWallet: (walletId: string) => void;
  currentUser: User;
  users: User[];
}

const WALLET_TYPE_ICONS: Record<string, React.ElementType> = {
  Main: WalletIcon,
  Operations: ZapIcon,
  Events: BuildingIcon,
  Activation: SmartphoneIcon,
  Personal: UserIcon,
};

const WALLET_TYPE_COLORS: Record<string, string> = {
  Main: 'bg-azure text-white',
  Operations: 'bg-emerald-600 text-white',
  Events: 'bg-emerald-700 text-white',
  Activation: 'bg-orange-500 text-white',
  Personal: 'bg-zinc-600 text-white',
};

export function Wallets({ onNavigate, onOpenModal, wallets, onDeleteWallet, users, currentUser }: WalletsProps) {
  const visibleWallets = getVisibleWallets(
    Array.isArray(wallets) ? wallets : (wallets as any)?.data ?? [],
    currentUser,
  );

  const isStaff = currentUser.role === 'Staff';

  const mainWallet = visibleWallets.find(w => w.type === 'Main');
  const subWallets = visibleWallets.filter(w => w.type !== 'Main');

  const mpesaAccountRef = currentUser.spendyAccountNumber;
  const paybillNumber = currentUser.spendyPaybillNumber || '247247';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Wallets</h1>
          <p className="text-gray-600 mt-1">Manage your company funds and accounts</p>
        </div>
        {!isStaff && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenModal('wallet-transfer')}>
              <ArrowRightLeftIcon className="w-4 h-4" /> Transfer Funds
            </Button>
          </div>
        )}
      </div>

      {/* Main Wallet Hero */}
      {mainWallet ? (
        <div className="relative overflow-hidden rounded-3xl bg-azure p-8 text-white shadow-2xl border border-white/10 group">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-azure-light/20 blur-3xl" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <WalletIcon className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium opacity-80">Main Wallet</span>
                  <Badge variant="success" className="bg-white bg-opacity-20 text-white border-0 text-xs">
                    {mainWallet.status}
                  </Badge>
                </div>
                <p className="text-5xl font-bold tracking-tight">
                  KES {mainWallet.balance.toLocaleString()}
                </p>
                <p className="text-sm opacity-70 mt-1">{mainWallet.currency ?? 'KES'} · Available Balance</p>
              </div>
              {!isStaff && (
                <Button
                  variant="primary"
                  onClick={() => onOpenModal('fund-wallet')}
                  className="font-bold shadow-lg h-12"
                >
                  <TrendingUpIcon className="w-4 h-4" /> Top Up via M-Pesa
                </Button>
              )}
            </div>

            {/* M-Pesa paybill info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white border-opacity-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-70 font-medium uppercase tracking-wide">Paybill Number</p>
                  <p className="text-xl font-bold">{paybillNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                  <SmartphoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-70 font-medium uppercase tracking-wide">Account Number</p>
                  <p className="text-xl font-bold">{mpesaAccountRef ?? '—'}</p>
                </div>
              </div>
            </div>

            {mpesaAccountRef && (
              <p className="text-xs opacity-60 mt-3">
                To top up: Go to M-Pesa → Lipa na M-Pesa → Paybill → Enter {paybillNumber} → Account: {mpesaAccountRef}
              </p>
            )}
          </div>

          <div className="absolute bottom-6 right-8">
            <Button
              variant="glass"
              size="sm"
              onClick={() => onNavigate('wallet-detail', mainWallet.id)}
            >
              <EyeIcon className="w-4 h-4" /> View Transactions
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          <WalletIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No main wallet found</p>
        </Card>
      )}

      {/* Sub-accounts */}
      {subWallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-gray">Sub-Accounts</h2>
            <p className="text-sm text-gray-500">Funded via internal transfer from Main Wallet</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subWallets.map(wallet => {
              const IconComponent = WALLET_TYPE_ICONS[wallet.type] ?? WalletIcon;
              const colorClass = WALLET_TYPE_COLORS[wallet.type] ?? 'bg-gray-600 text-white';

              return (
                <Card key={wallet.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-dark-gray text-sm leading-tight">
                            {getWalletDisplayName(wallet, users)}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">{getWalletDisplayType(wallet, users)}</p>
                        </div>
                      </div>
                      <Badge variant={wallet.status === 'Active' ? 'success' : 'warning'} className="text-xs">
                        {wallet.status}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                      <p className="text-2xl font-bold text-dark-gray">
                        KES {wallet.balance.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 !bg-azure !text-white !shadow-none hover:!bg-azure/90"
                        onClick={() => onNavigate('wallet-detail', wallet.id)}
                      >
                        <EyeIcon className="w-3.5 h-3.5" /> View
                      </Button>
                      {!isStaff && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="!bg-primary/10 !text-azure !shadow-none hover:!bg-primary/20"
                          onClick={() => onOpenModal('wallet-transfer')}
                          title="Transfer funds from Main Wallet"
                        >
                          <ArrowRightLeftIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDeleteWallet(wallet, users) && !isStaff && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onDeleteWallet(wallet.id)}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
