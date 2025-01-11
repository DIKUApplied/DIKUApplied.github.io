import React, { useState } from 'react';
import { X, Upload, Lock } from 'lucide-react';

export default function ProjectUploadForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    creatorName: '',
    creatorEmail: '',
    githubLink: '',
    projectImage: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (inputPassword) => {
    return inputPassword === 'firstdikuapplied';
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePassword(password)) {
      setIsPasswordValid(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData({ ...formData, projectImage: file });
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please upload an image file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would implement the actual submission logic
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({
      title: '',
      creatorName: '',
      creatorEmail: '',
      githubLink: '',
      projectImage: null
    });
    setIsOpen(false);
    setIsPasswordValid(false);
    setPassword('');
    setPreviewUrl('');
  };

  return (
    <div>
      {/* Upload Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
      >
        <Upload size={20} />
        Upload Project
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold">Upload Your Project</h2>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsPasswordValid(false);
                  setPassword('');
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!isPasswordValid ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Lock size={20} />
                    <span>This form is password protected</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.creatorName}
                      onChange={(e) => setFormData({...formData, creatorName: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creator Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.creatorEmail}
                      onChange={(e) => setFormData({...formData, creatorEmail: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Link
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.githubLink}
                      onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter GitHub repository URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <div className="mb-4">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="mx-auto h-48 w-auto object-contain"
                            />
                          </div>
                        ) : (
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload Project
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}