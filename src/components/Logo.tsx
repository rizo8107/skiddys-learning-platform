import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="w-8 h-8 text-blue-500" />
      <span className="text-xl font-bold text-white">LearnFlow</span>
    </div>
  );
};
