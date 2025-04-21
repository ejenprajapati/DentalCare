import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AnalysisResults {
  originalImage: string;
  analyzedImage: string;
  totalConditionsDetected: number;
  calculusCount: number;
  cariesCount: number;
  gingivitisCount: number;
  hypodontiaCount: number;
  toothDiscolationCount: number;
  ulcerCount: number;
  analysisId?: number; // Optional field for database reference
}

const Results: React.FC = () => {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Retrieve analysis results from sessionStorage
    const savedResults = sessionStorage.getItem('analysisResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    } else {
      // If no results are found, redirect back to upload page
      navigate('/ai-checkup');
    }
  }, [navigate]);
  
  const handleBack = () => {
    navigate('/ai-checkup');
  };
  
  const viewHistory = () => {
    navigate('/analysis-history');
  };
  
  if (!results) {
    return <div className="loading">Loading results...</div>;
  }

  // Define color mapping for different conditions
  const conditionColors = {
    calculus: "#FFD700", // Gold
    caries: "#FF0000", // Red
    gingivitis: "#FF69B4", // Hot pink
    hypodontia: "#800080", // Purple
    toothDiscolation: "#A0522D", // Brown
    ulcer: "#FFA500" // Orange
  };
  
  // Check if images are base64 or URLs and handle accordingly
  const originalImgSrc = results.originalImage.startsWith('data:') 
    ? results.originalImage 
    : `http://127.0.0.1:8000${results.originalImage}`;
    
  const analyzedImgSrc = results.analyzedImage.startsWith('data:') 
    ? results.analyzedImage 
    : `http://127.0.0.1:8000${results.analyzedImage}`;
  
  return (
    <div className="container">
      <div className="logo-container">
        <div className="left-logo">
          <img src="/logo.png" alt="Dental Care Logo" className="logo" />
          <h2>DENTAL CARE</h2>
        </div>
      </div>
      
      <h1 className="page-title">Analysis Results</h1>
      
      <div className="results-container">
        <div className="image-comparison">
          <div className="image-box">
            <h3>Original Image</h3>
            <img src={originalImgSrc} alt="Original Image" />
          </div>
          <div className="image-box">
            <h3>Analyzed Image</h3>
            <img src={analyzedImgSrc} alt="Analyzed Image" />
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-box">
            <h3>Total Conditions Detected</h3>
            <p className="stat-value">{results.totalConditionsDetected}</p>
          </div>
          
          {results.calculusCount > 0 && (
            <div className="stat-box">
              <h3>Calculus</h3>
              <p className="stat-value">{results.calculusCount}</p>
            </div>
          )}
          
          {results.cariesCount > 0 && (
            <div className="stat-box">
              <h3>Caries</h3>
              <p className="stat-value">{results.cariesCount}</p>
            </div>
          )}

          {results.gingivitisCount > 0 && (
            <div className="stat-box">
              <h3>Gingivitis</h3>
              <p className="stat-value">{results.gingivitisCount}</p>
            </div>
          )}

          {results.hypodontiaCount > 0 && (
            <div className="stat-box">
              <h3>Hypodontia</h3>
              <p className="stat-value">{results.hypodontiaCount}</p>
            </div>
          )}

          {results.toothDiscolationCount > 0 && (
            <div className="stat-box">
              <h3>Tooth Dislocation</h3>
              <p className="stat-value">{results.toothDiscolationCount}</p>
            </div>
          )}

          {results.ulcerCount > 0 && (
            <div className="stat-box">
              <h3>Ulcer</h3>
              <p className="stat-value">{results.ulcerCount}</p>
            </div>
          )}
        </div>
        
        <div className="legend">
          {results.calculusCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.calculus}}></div>
              <p>Calculus</p>
            </div>
          )}
          
          {results.cariesCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.caries}}></div>
              <p>Caries</p>
            </div>
          )}
          
          {results.gingivitisCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.gingivitis}}></div>
              <p>Gingivitis</p>
            </div>
          )}
          
          {results.hypodontiaCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.hypodontia}}></div>
              <p>Hypodontia</p>
            </div>
          )}
          
          {results.toothDiscolationCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.toothDiscolation}}></div>
              <p>Tooth Dislocation</p>
            </div>
          )}
          
          {results.ulcerCount > 0 && (
            <div className="legend-item">
              <div className="color-box" style={{backgroundColor: conditionColors.ulcer}}></div>
              <p>Ulcer</p>
            </div>
          )}
        </div>
        
        <div className="recommendation-box">
          <h3>Analysis Summary</h3>
          <p>
            Based on our AI analysis of your dental image:
            {results.calculusCount > 0 && ` We found ${results.calculusCount} areas with calculus.`}
            {results.cariesCount > 0 && ` There are ${results.cariesCount} potential cavities that may require attention.`}
            {results.gingivitisCount > 0 && ` We detected ${results.gingivitisCount} areas showing signs of gingivitis.`}
            {results.hypodontiaCount > 0 && ` The analysis shows ${results.hypodontiaCount} potential cases of hypodontia.`}
            {results.toothDiscolationCount > 0 && ` There are ${results.toothDiscolationCount} teeth showing dislocation.`}
            {results.ulcerCount > 0 && ` We identified ${results.ulcerCount} potential ulcers.`}
            {(results.calculusCount === 0 && 
              results.cariesCount === 0 && 
              results.gingivitisCount === 0 && 
              results.hypodontiaCount === 0 && 
              results.toothDiscolationCount === 0 && 
              results.ulcerCount === 0)
              ? ' No dental issues were detected in this image.' 
              : ' We recommend scheduling an appointment with your dentist to discuss these findings.'}
          </p>
        </div>
        
        <div className="action-buttons">
          <button className="btn back-btn" onClick={handleBack}>
            Back to Upload
          </button>
          <button className="btn history-btn" onClick={viewHistory}>
            View Analysis History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;