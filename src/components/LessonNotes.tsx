import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonNoteService } from '../lib/pocketbase';
import { LessonNote } from '../lib/pocketbase';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import { ClientResponseError } from 'pocketbase';

interface LessonNotesProps {
  lessonId: string;
}

export const LessonNotes: React.FC<LessonNotesProps> = ({ lessonId }) => {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const queryClient = useQueryClient();

  // Fetch notes with optimized refetch behavior
  const { data: notes = [], isLoading, error: queryError } = useQuery({
    queryKey: ['lessonNotes', lessonId],
    queryFn: () => lessonNoteService.getAll(lessonId),
    enabled: !!lessonId,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchInterval: false, // Disable automatic refetching
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: false, // Don't retry on error
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const result = await lessonNoteService.create({ lesson: lessonId, content });
      return result;
    },
    onSuccess: (newNote) => {
      // Optimistically update the cache immediately
      queryClient.setQueryData(['lessonNotes', lessonId], (old: LessonNote[] = []) => {
        return [newNote, ...old];
      });
    },
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const result = await lessonNoteService.update(id, { content });
      return result;
    },
    onSuccess: (updatedNote) => {
      // Optimistically update the cache immediately
      queryClient.setQueryData(['lessonNotes', lessonId], (old: LessonNote[] = []) => {
        return old.map(note => note.id === updatedNote.id ? updatedNote : note);
      });
      setEditingNote(null);
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await lessonNoteService.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistically update the cache immediately
      queryClient.setQueryData(['lessonNotes', lessonId], (old: LessonNote[] = []) => {
        return old.filter(note => note.id !== deletedId);
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      createMutation.mutate(newNote.trim());
    }
  };

  const handleUpdate = (note: LessonNote) => {
    if (editContent.trim() !== note.content) {
      updateMutation.mutate({ id: note.id, content: editContent.trim() });
    } else {
      setEditingNote(null);
    }
  };

  const startEditing = (note: LessonNote) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  // Error handling
  const getErrorMessage = (error: unknown) => {
    if (error instanceof ClientResponseError) {
      if (error.status === 403) {
        return "You don't have permission to perform this action. Please make sure you're logged in.";
      }
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  if (queryError) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Lesson Notes</h2>
        <div className="text-red-400 bg-red-400/10 rounded-lg p-4">
          <p>{getErrorMessage(queryError)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Lesson Notes</h2>

      {/* Add new note */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            className="flex-1 bg-gray-700 text-white rounded-lg p-3 min-h-[100px] resize-none"
          />
          <button
            type="submit"
            disabled={!newNote.trim() || createMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </form>

      {/* Notes list */}
      {isLoading ? (
        <div className="text-gray-400 text-center py-4">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No notes yet. Add one above!</div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-lg p-3 min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdate(note)}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors"
                      title="Save"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-gray-400 text-sm">
                      {note.expand?.user?.username || 'Anonymous'} •{' '}
                      {new Date(note.created).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(note.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{note.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
