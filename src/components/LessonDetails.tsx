import React from 'react';
import { FileDown, Book, Clock, Target, Link2, ExternalLink } from 'lucide-react';
import type { Lesson, LessonResource } from '../lib/pocketbase';
import { lessonResourceService } from '../lib/pocketbase';
import { useQuery } from '@tanstack/react-query';
import { LessonNotes } from './LessonNotes';

interface LessonDetailsProps {
  lesson: Lesson | null;
}

export const LessonDetails: React.FC<LessonDetailsProps> = ({ lesson }) => {
  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['lessonResources', lesson?.id],
    queryFn: async () => {
      if (!lesson?.id) {
        console.log('No lesson ID provided');
        return [];
      }
      try {
        const result = await lessonResourceService.getAll(lesson.id);
        console.log('Resources fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching resources:', err);
        throw err;
      }
    },
    enabled: !!lesson?.id,
  });

  console.log('Current lesson:', lesson);
  console.log('Resources state:', { isLoading, error, resources });

  const handleDownload = async (resource: LessonResource) => {
    try {
      const url = lessonResourceService.getFileUrl(resource);
      console.log('Downloading from URL:', url);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = resource.resource_title || 'download';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (!lesson) {
    return null;
  }

  const {
    description,
    duration,
    objectives = [],
  } = lesson;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Lesson Details</h2>

      {/* Lesson Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">About This Lesson</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Lesson Info */}
      {duration && (
        <div className="flex items-start gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">Duration</h4>
            <p className="text-white">{duration}</p>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {objectives?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Learning Objectives</h3>
          </div>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileDown className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Resources</h3>
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-center py-4">Loading resources...</p>
        ) : error ? (
          <div className="text-red-400 text-center py-4">
            <p>Error loading resources</p>
            <p className="text-sm mt-1">{(error as Error)?.message || 'Unknown error'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources && resources.length > 0 ? (
              resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg group hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      {resource.resource_type === 'document' && <Book className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'video' && <Play className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'exercise' && <PenTool className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'link' && <Link2 className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'article' && <FileText className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'code' && <Code2 className="w-4 h-4 text-blue-400" />}
                      {resource.resource_type === 'other' && <File className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{resource.resource_title}</h4>
                      <p className="text-sm text-gray-400 capitalize">{resource.resource_type}</p>
                      {resource.resource_description && (
                        <p className="text-sm text-gray-400">{resource.resource_description}</p>
                      )}
                    </div>
                  </div>
                  {resource.resource_link ? (
                    <a
                      href={resource.resource_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded-lg transition-all"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded-lg transition-all"
                      title="Download Resource"
                    >
                      <FileDown className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No resources available for this lesson.</p>
            )}
          </div>
        )}
      </div>

      {/* Lesson Notes */}
      {lesson && <LessonNotes lessonId={lesson.id} />}
    </div>
  );
};
