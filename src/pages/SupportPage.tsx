import React, { useState } from 'react';
import { pb } from '../lib/pocketbase';
import { Send, Loader2 } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      await pb.collection('support_tickets').create({
        subject,
        message,
        email,
        status: 'new',
        user: pb.authStore.model?.id
      });
      
      setStatus('success');
      setSubject('');
      setMessage('');
      setEmail('');
    } catch (error) {
      console.error('Support submission error:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Support & Feedback</h1>
          <p className="mt-2 text-lg text-gray-400">
            We're here to help! Send us your questions or feedback.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'success' && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <p className="text-sm text-green-400 text-center">
                  Thank you for your feedback! We'll get back to you soon.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-sm text-red-400 text-center">
                  Something went wrong. Please try again later.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 
                         rounded-lg text-gray-200 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 
                         rounded-lg text-gray-200 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-900/50 border border-gray-700 
                         rounded-lg text-gray-200 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 
                         bg-indigo-600 text-white text-lg font-medium rounded-lg
                         hover:bg-indigo-700 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
