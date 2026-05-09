import React, { useState } from 'react';
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (id: string) => void;
}
export function Tabs({
  tabs,
  defaultTab,
  onTabChange
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const handleClick = (id: string) => {
    setActiveTab(id);
    if (onTabChange) onTabChange(id);
  };
  return <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => <button key={tab.id} onClick={() => handleClick(tab.id)} className={`py-3 px-1 text-sm font-medium border-b-2 transition-all duration-200 hover:-translate-y-0.5 ${activeTab === tab.id ? 'border-primary text-azure shadow-sm' : 'border-transparent text-gray-500 hover:text-azure hover:border-gray-300'}`}>
              {tab.label}
            </button>)}
        </nav>
      </div>
      <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeTab}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>;
}