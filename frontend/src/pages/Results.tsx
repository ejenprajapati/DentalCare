import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Results: React.FC = () => {
  const [results, setResults] = useState<any>(null);
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
  
  if (!results) {
    return <div className="loading">Loading results...</div>;
  }
  
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
            <img src={results.originalImage} alt="Original Image" />
          </div>
          <div className="image-box">
            <h3>Analyzed Image</h3>
            <img src={results.analyzedImage} alt="Analyzed Image" />
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-box">
            <h3>Teeth Detected</h3>
            <p className="stat-value">{results.teethCount}</p>
          </div>
          
          <div className="stat-box">
            <h3>Caries Detected</h3>
            <p className="stat-value">{results.cariesCount}</p>
            <p className="stat-percentage">
              ({results.cariesPercentage.toFixed(1)}% of teeth)
            </p>
          </div>
          
          <div className="stat-box">
            <h3>Cracks Detected</h3>
            <p className="stat-value">{results.crackCount}</p>
            <p className="stat-percentage">
              ({results.crackPercentage.toFixed(1)}% of teeth)
            </p>
          </div>
        </div>
        
        <div className="legend">
          <div className="legend-item">
            <div className="color-box" style={{backgroundColor: "#00FF00"}}></div>
            <p>Tooth</p>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{backgroundColor: "#FF0000"}}></div>
            <p>Caries (Cavity)</p>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{backgroundColor: "#FFA500"}}></div>
            <p>Crack</p>
          </div>
        </div>
        
        <div className="recommendation-box">
          <h3>Analysis Summary</h3>
          <p>
            Based on our AI analysis, we have detected {results.teethCount} teeth in your X-ray.
            {results.cariesCount > 0 && ` There are ${results.cariesCount} potential cavities that may require attention.`}
            {results.crackCount > 0 && ` Additionally, ${results.crackCount} potential cracks were identified.`}
            {results.cariesCount === 0 && results.crackCount === 0 ? 
              ' No dental issues were detected in this X-ray.' : 
              ' We recommend scheduling an appointment with your dentist to discuss these findings.'}
          </p>
        </div>
        
        <button className="btn back-btn" onClick={handleBack}>
          Back to Upload
        </button>
      </div>
    </div>
  );
};

export default Results;