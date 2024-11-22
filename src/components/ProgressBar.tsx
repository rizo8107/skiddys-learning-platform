import React from 'react';
import { Trophy, FileText, Award } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const milestones = [
    { icon: Trophy, label: 'Complete a Class', threshold: 33 },
    { icon: FileText, label: 'Submit a Project', threshold: 66 },
    { icon: Award, label: 'Earn a Certificate', threshold: 100 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Your Progress</h3>
        <span className="text-blue-600 font-medium">{progress}%</span>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          {milestones.map(({ icon: Icon, label, threshold }) => (
            <div
              key={label}
              className={`flex flex-col items-center ${
                progress >= threshold ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};