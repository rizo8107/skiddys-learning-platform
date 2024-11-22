import React from 'react';
import { Book, FileText, MessageSquare, Star, FileTerminal } from 'lucide-react';

interface CourseTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'About', icon: Book },
    { id: 'Projects & Resources', icon: FileTerminal },
    { id: 'Reviews', icon: Star },
    { id: 'Discussions', icon: MessageSquare },
    { id: 'Transcripts', icon: FileText },
  ];

  return (
    <div className="flex items-center gap-6">
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition ${
            activeTab === id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span>{id}</span>
        </button>
      ))}
    </div>
  );
};