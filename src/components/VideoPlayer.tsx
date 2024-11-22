import React from 'react';

interface VideoPlayerProps {
  lessons_title: string;
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessons_title, videoUrl }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-video">
        <iframe
          title={lessons_title}
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};