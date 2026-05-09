import React, { useState } from 'react';
import { Button } from './Button';
import { DownloadIcon, ChevronDownIcon } from 'lucide-react';
interface ExportButtonProps {
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}
export function ExportButton({
  onExport,
  size = 'sm'
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="relative">
      <Button variant="secondary" size={size} onClick={() => setIsOpen(!isOpen)} className="group">
        <DownloadIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
        Export
        <ChevronDownIcon className={`w-3 h-3 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg shadow-gray-300/50 border border-gray-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={() => {
          onExport('csv');
          setIsOpen(false);
        }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1 transition-all duration-200">
              Export as CSV
            </button>
            <button onClick={() => {
          onExport('pdf');
          setIsOpen(false);
        }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1 transition-all duration-200">
              Export as PDF
            </button>
            <button onClick={() => {
          onExport('excel');
          setIsOpen(false);
        }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-azure hover:translate-x-1 transition-all duration-200">
              Export as Excel
            </button>
          </div>
        </>}
    </div>;
}