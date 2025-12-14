import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, CheckCircle, Clock } from 'lucide-react';
import { aiKnowledgeService } from '../services/aiKnowledge';

const FileUpload = ({ userId, courseId, onFileUploaded }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        setUploading(true);

        for (const file of Array.from(files)) {
            try {
                setUploadProgress(`Reading ${file.name}...`);

                // Read the actual file content
                const content = await aiKnowledgeService.readFileContent(file);

                setUploadProgress(`Processing ${file.name} for AI training...`);

                // Upload with content for RAG
                const fileData = aiKnowledgeService.uploadFile(userId, file, courseId, content);

                // Notify parent
                onFileUploaded({
                    ...fileData,
                    contentPreview: content.slice(0, 200) + (content.length > 200 ? '...' : '')
                });

            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                setUploadProgress(`Error processing ${file.name}`);
            }
        }

        setUploadProgress('');
        setUploading(false);
    };

    return (
        <div className="space-y-4">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                    }`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.docx,.doc"
                    onChange={handleChange}
                />

                <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        PDF, TXT, DOCX files supported
                    </p>
                </label>
            </div>

            {uploading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center"
                >
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 animate-spin" />
                    <p className="text-blue-900 dark:text-blue-300">Processing your files for AI training...</p>
                </motion.div>
            )}
        </div>
    );
};

export default FileUpload;
