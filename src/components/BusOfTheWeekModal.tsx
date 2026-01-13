import React, { useState, useEffect } from 'react';

const BusOfTheWeekModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('busOfWeekSeen');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('busOfWeekSeen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-accent-yellow mb-2">🏆 Bus of the Week</h2>
            </div>
            
            <div className="mb-4">
              <img 
                src="/SE16.png" 
                alt="Bus of the Week" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="bg-red-600 text-white p-4 rounded-lg text-center">
              <p className="font-medium">
                Completed 4 trips and maintained an average user rating of 8.9 making the best bus this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusOfTheWeekModal;