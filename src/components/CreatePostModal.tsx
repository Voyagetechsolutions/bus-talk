import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/api';
import { useAppStore } from '../hooks/useStore';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'news' | 'sighting';
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

// Convex site URL for serving images
const CONVEX_SITE_URL = 'https://adamant-ostrich-470.convex.site';

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, type }) => {
  const { user } = useAppStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useMutation(api.mutations.createPost as any);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl as any);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newMediaFiles: MediaFile[] = files
      .filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        return (isImage || isVideo) && file.size <= maxSize;
      })
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload a file to Convex storage and return the URL
  const uploadFile = async (file: File): Promise<{ url: string; storageId: string }> => {
    console.log('Starting file upload:', file.name, file.type);

    // Step 1: Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();
    console.log('Got upload URL:', uploadUrl);

    // Step 2: Upload file to the URL
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      console.error('Upload failed:', response.status, response.statusText);
      throw new Error('Failed to upload file');
    }

    // Step 3: Get the storage ID from response
    const result = await response.json();
    const storageId = result.storageId;
    console.log('Upload successful, storageId:', storageId);

    // Step 4: Construct the file URL using the HTTP endpoint
    const fileUrl = `${CONVEX_SITE_URL}/getImage?storageId=${storageId}`;
    console.log('File URL:', fileUrl);

    return { url: fileUrl, storageId };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError('You must be signed in to create posts');
      return;
    }

    if (type === 'news' && !user.spotter_status) {
      setError('Only verified spotters can create news posts');
      return;
    }

    if (!title.trim()) {
      setError('Please add a title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload media files to Convex storage
      const uploadedMedia: { url: string; type: 'image' | 'video'; storage_id?: string }[] = [];

      for (let i = 0; i < mediaFiles.length; i++) {
        const mf = mediaFiles[i];
        setUploadProgress(`Uploading ${mf.file.name} (${i + 1}/${mediaFiles.length})...`);

        try {
          const { url, storageId } = await uploadFile(mf.file);
          uploadedMedia.push({
            url,
            type: mf.type,
            storage_id: storageId,
          });
          console.log('Media uploaded:', { url, storageId, type: mf.type });
        } catch (uploadErr: any) {
          console.error('Upload error for file:', mf.file.name, uploadErr);
          setError(`Failed to upload ${mf.file.name}: ${uploadErr.message}`);
          setLoading(false);
          setUploadProgress('');
          return;
        }
      }

      setUploadProgress('Creating post...');
      console.log('Creating post with media:', uploadedMedia);

      await createPost({
        user_id: user.id,
        type,
        title: title.trim(),
        content: content.trim(),
        media: uploadedMedia,
      });

      console.log('Post created successfully!');

      // Reset form
      setTitle('');
      setContent('');
      setUploadProgress('');
      mediaFiles.forEach(mf => URL.revokeObjectURL(mf.preview));
      setMediaFiles([]);
      onClose();
    } catch (err: any) {
      console.error('Post creation error:', err);
      setError(err.message || 'Failed to create post');
    }
    setLoading(false);
    setUploadProgress('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {type === 'news' ? '📰 Create News' : '📸 Post Sighting'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <input
            type="text"
            placeholder={type === 'news' ? 'News headline...' : 'What did you spot?'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="modal-input"
            required
          />

          {/* Content */}
          <textarea
            placeholder={type === 'news' ? 'Share the news details...' : 'Describe your sighting...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="modal-textarea"
            rows={4}
          />

          {/* Media Upload */}
          <div className="media-upload">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
            >
              📷 Add Photos / Videos
            </button>

            <span className="upload-hint">Images up to 10MB, Videos up to 100MB</span>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="media-preview-grid">
              {mediaFiles.map((mf, index) => (
                <div key={index} className="media-preview-item">
                  {mf.type === 'video' ? (
                    <video src={mf.preview} className="preview-media" muted />
                  ) : (
                    <img src={mf.preview} alt="" className="preview-media" />
                  )}
                  <span className="media-type-badge">
                    {mf.type === 'video' ? '🎬' : '📷'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="remove-media-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <p className="modal-progress" style={{ color: '#14b8a6', fontSize: '0.875rem' }}>
              {uploadProgress}
            </p>
          )}

          {/* Error */}
          {error && <p className="modal-error">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;