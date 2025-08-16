import React, { useState } from 'react';
import { Folder, CircleArrowDown, Eye, Download, FileText, Image, Video, Music, Archive, FileCode } from 'lucide-react';
import { HOST } from "@/utils/constants";
import apiClient from '@/lib/api-client';

const FileDisplay = ({ message, renderFor, downloadFile, handleShowImage, }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileName = message.fileUrl.split('/').pop();
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  }

  const getFileIcon = (extension) => {
    const iconMap = {
      // Images
      jpg: Image, jpeg: Image, png: Image, gif: Image, webp: Image, svg: Image,
      // Videos
      mp4: Video, avi: Video, mov: Video, wmv: Video, flv: Video, webm: Video,
      // Audio
      mp3: Music, wav: Music, ogg: Music, m4a: Music, flac: Music,
      // Archives
      zip: Archive, rar: Archive, '7z': Archive, tar: Archive, gz: Archive,
      // Code
      js: FileCode, jsx: FileCode, ts: FileCode, tsx: FileCode, py: FileCode, java: FileCode, cpp: FileCode, html: FileCode, css: FileCode,
      // Documents
      pdf: FileText, doc: FileText, docx: FileText, txt: FileText, rtf: FileText, csv: FileText,
    };

    return iconMap[extension] || Folder;
  };

  const getFileTypeColor = (extension) => {
    const colorMap = {
      // Images - blue gradient
      jpg: 'from-blue-500 to-cyan-500', jpeg: 'from-blue-500 to-cyan-500', png: 'from-blue-500 to-cyan-500',
      gif: 'from-blue-500 to-cyan-500', webp: 'from-blue-500 to-cyan-500', svg: 'from-blue-500 to-cyan-500',
      // Videos - purple gradient
      mp4: 'from-purple-500 to-pink-500', avi: 'from-purple-500 to-pink-500', mov: 'from-purple-500 to-pink-500',
      // Audio - green gradient
      mp3: 'from-green-500 to-emerald-500', wav: 'from-green-500 to-emerald-500', ogg: 'from-green-500 to-emerald-500',
      // Archives - orange gradient
      zip: 'from-orange-500 to-red-500', rar: 'from-orange-500 to-red-500', '7z': 'from-orange-500 to-red-500',
      // Code - indigo gradient
      js: 'from-indigo-500 to-blue-500', jsx: 'from-indigo-500 to-blue-500', ts: 'from-indigo-500 to-blue-500',
      py: 'from-indigo-500 to-blue-500', java: 'from-indigo-500 to-blue-500',
      // Documents - gray gradient
      pdf: 'from-gray-600 to-gray-800', doc: 'from-gray-600 to-gray-800', txt: 'from-gray-600 to-gray-800',
    };

    return colorMap[extension] || 'from-slate-500 to-slate-700';
  };

  const isImage = checkIfImage(message.fileUrl);
  const FileIcon = getFileIcon(fileExtension);
  const gradientColors = getFileTypeColor(fileExtension);

  if (isImage) {
    return (
      <div className="group relative rounded-xl overflow-hidden
       transition-all duration-500 max-w-sm">
        <div className="relative">
          {
            !imageError && <img
              src={message.fileUrl}
              alt={fileName}
              className={`w-full h-auto max-h-80 object-cover transition-all 
              duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          }

          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 
            to-slate-200 animate-pulse flex items-center justify-center">
              <Image className="w-12 h-12 text-slate-400 animate-bounce" />
            </div>
          )}

          {imageError && (
            <div className="w-80 h-52 bg-gradient-to-br from-red-100 to-red-200 flex 
            items-center justify-center">
              <div className="text-center">
                <Image className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-600 text-sm">Failed to load image</p>
              </div>
            </div>
          )}

          {/* Overlay with actions */}
          {!imageError && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all
           duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3">
              <button
                onClick={() => handleShowImage(message.fileUrl)}
                className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full 
                shadow-lg transform hover:scale-110 transition-all duration-200"
                aria-label="View full image"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => downloadFile(message.fileUrl)}
                className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full 
                shadow-lg transform hover:scale-110 transition-all duration-200"
                aria-label="Download image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>}
        </div>

        {/* Image info bar */}
        {/* <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3">
          <p className="text-white font-medium text-sm truncate" title={fileName}>
            {fileName}
          </p>
        </div> */}
      </div>
    );
  }

  return (
    <div className={`group relative ${renderFor === 'sender' ? "bg-blue-500" : "bg-gray-200"} rounded-xl max-w-sm`}>
      {/* Main content area */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* File icon with animated gradient background */}
          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradientColors}`}>
            <FileIcon className="w-8 h-8 text-white" />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate"
              title={fileName}>
              {fileName}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${renderFor === 'sender' ? "bg-gray-200 text-gray-800" : "bg-gray-400 text-black"}`}>
                {fileExtension?.toUpperCase() || 'FILE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className={`${renderFor === 'sender' ? "bg-blue-500" : "bg-gray-200"}`}>
        <div className="p-2">
          <button
            onClick={() => downloadFile(message.fileUrl)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800
             to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-4 rounded-lg 
             font-medium transition-all duration-200 active:scale-95"
            aria-label={`Download ${fileName}`}
          >
            <Download className="w-5 h-5" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div >
  );
}

export default FileDisplay;