import React, { useState } from 'react';

interface MediaCarouselProps {
  mediaUrls: string[];
  onMediaClick: (url: string) => void;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaUrls, onMediaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (mediaUrls.length === 0) return null;

  const getMediaUrl = (filename: string) => 
    `https://rwghpglhlzljqzbxajkc.supabase.co/storage/v1/object/public/media/${filename}`;

  const isVideo = (filename: string) => 
    filename.toLowerCase().includes('.mp4') || filename.toLowerCase().includes('.webm') || filename.toLowerCase().includes('.mov');

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  return (
    <div className="relative mb-4">
      <div className="w-full h-auto">
        {isVideo(mediaUrls[currentIndex]) ? (
          <video
            src={getMediaUrl(mediaUrls[currentIndex])}
            className="w-full h-auto object-cover cursor-pointer"
            controls
            onClick={() => onMediaClick(getMediaUrl(mediaUrls[currentIndex]))}
          />
        ) : (
          <img
            src={getMediaUrl(mediaUrls[currentIndex])}
            alt="Post media"
            className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onMediaClick(getMediaUrl(mediaUrls[currentIndex]))}
          />
        )}
      </div>

      {mediaUrls.length > 1 && (
        <>
          <button
            onClick={prevMedia}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
          >
            ‹
          </button>
          <button
            onClick={nextMedia}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
          >
            ›
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {mediaUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaCarousel;