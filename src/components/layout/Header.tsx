import React, { useState } from 'react';
import { BellIcon, SearchIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { User } from '../../types';
interface HeaderProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  sidebarCollapsed: boolean;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  currentUser: User;
}
export function Header({
  onNavigate,
  onLogout,
  sidebarCollapsed,
  userProfile,
  currentUser
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return <header className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 transition-all duration-300 shadow-sm ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-azure transition-colors duration-200" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure focus:shadow-md focus:shadow-green-100/50 hover:border-gray-400 transition-all duration-200" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={() => onNavigate('notifications')} className="relative p-2 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5 rounded-lg transition-all duration-200 group">
          <BellIcon className="w-5 h-5 text-gray-700 group-hover:text-azure group-hover:scale-110 transition-all duration-200" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-3 p-2 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5 rounded-lg transition-all duration-200 group">
            {userProfile.profileImage ? <img src={userProfile.profileImage} alt={userProfile.firstName} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-azure/30 transition-all duration-200" /> : <div className="w-8 h-8 bg-azure rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-200">
                <UserIcon className="w-5 h-5 text-white" />
              </div>}
            <div className="text-left">
              <p className="text-sm font-semibold text-dark-gray group-hover:text-azure transition-colors duration-200">
                {userProfile.firstName} {userProfile.lastName}
              </p>
            </div>
          </button>
          {showUserMenu && <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg shadow-gray-300/50 border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => {
              onNavigate('my-account');
              setShowUserMenu(false);
            }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1 transition-all duration-200">
                  My Account
                </button>
                {currentUser.role !== 'Approver' && currentUser.role !== 'Staff' && currentUser.role !== 'Store Manager' && (
                  <button onClick={() => {
              onNavigate('system-setup');
              setShowUserMenu(false);
            }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1 transition-all duration-200">
                  System Setup
                </button>
                )}
                <div className="border-t border-gray-200 my-1" />
                <button onClick={() => {
              onLogout();
              setShowUserMenu(false);
            }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:translate-x-1 flex items-center gap-2 transition-all duration-200 group">
                  <LogOutIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Logout
                </button>
              </div>
            </>}
        </div>
      </div>
    </header>;
}
