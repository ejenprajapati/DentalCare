import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import uploadLogo from '../assets/upload-logo.png';

const AICheckup: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageType, setImageType] = useState<'normal' | 'xray'>('normal');
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    // Trigger file input click
    document.getElementById('file-upload')?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please upload an image first');
      return;
    }

    setIsLoading(true);

    // Create form data
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('image_type', imageType);  // Add image type to the form data

    // Get auth token from localStorage or sessionStorage
    const token = localStorage.getItem('access'); 
    
    try {
      // Post to the API with authentication token
      const response = await axios.post('http://127.0.0.1:8000/api/analyze-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Add JWT token for authentication
        }
      });

      // Store the results in sessionStorage
      sessionStorage.setItem('analysisResults', JSON.stringify(response.data));

      // Navigate to results page
      navigate('/results');
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Check if it's an authentication error
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert('Please log in to use the AI Checkup feature.');
        navigate('/login'); // Redirect to login page
      } else {
        alert('An error occurred while analyzing the image. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">AI Checkup</h1>

      <div className="image-type-selector">
        <div className="radio-group">
          <label className={`radio-label ${imageType === 'normal' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="imageType"
              value="normal"
              checked={imageType === 'normal'}
              onChange={() => setImageType('normal')}
            />
            <span className="radio-custom"></span>
            Normal Image
          </label>
          <label className={`radio-label ${imageType === 'xray' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="imageType"
              value="xray"
              checked={imageType === 'xray'}
              onChange={() => setImageType('xray')}
            />
            <span className="radio-custom"></span>
            X-ray Image
          </label>
        </div>
      </div>

      <div className="upload-container">
        <div className="image-preview">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" />
          ) : (
            <div className="upload-placeholder">
              <img src={uploadLogo} alt="Upload" />
              <h3>CHOOSE IMAGE</h3>
            </div>
          )}
        </div>

        <p className="image-type">
          {imageType === 'normal' ? 'Dental Image' : 'X-ray Image'}
        </p>

        <div className="button-group">
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="btn upload-btn" onClick={handleUpload}>
            Upload
          </button>
          <button
            className="btn analyze-btn"
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICheckup;