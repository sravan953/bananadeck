import React, { useState } from 'react';

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    onFilesSelected(files);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
      <input
        type="file"
        multiple
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {selectedFiles.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Selected files:</p>
          <ul className="text-sm">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};