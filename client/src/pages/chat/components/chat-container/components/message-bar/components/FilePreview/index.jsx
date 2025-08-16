import { X, RefreshCw, File, Image, FileText, Music, Video } from 'lucide-react';

const FilePreview = ({ file, onCancel, onChangeFile }) => {

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image size={24} />;
    if (fileType.startsWith('video/')) return <Video size={24} />;
    if (fileType.startsWith('audio/')) return <Music size={24} />;
    if (fileType.includes('text') || fileType.includes('document')) return <FileText size={24} />;
    return <File size={24} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop();
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.slice(0, maxLength - extension.length - 4) + '...';
    return `${truncated}.${extension}`;
  };

  return (
    <div className="flex flex-1 bg-[#2a2b33] rounded-md items-center gap-4 p-4">
      {/* File Icon */}
      <div className="text-blue-400 flex-shrink-0">
        {getFileIcon(file.type)}
      </div>

      {/* File Details */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">
          {truncateFileName(file.name)}
        </div>
        <div className="text-neutral-400 text-xs">
          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Change File Button */}
        <button
          onClick={onChangeFile}
          className="text-neutral-500 hover:text-blue-400 focus:text-blue-400 duration-300 transition-all p-1 rounded"
          title="Change file"
        >
          <RefreshCw size={18} />
        </button>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="text-neutral-500 hover:text-red-400 focus:text-red-400 duration-300 transition-all p-1 rounded"
          title="Remove file"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default FilePreview;