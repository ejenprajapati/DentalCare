import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ResultsPage.css';

interface AnalysisResults {
  originalImage: string;
  analyzedImage: string;
  totalConditionsDetected: number;
  imageType: 'normal' | 'xray';
  // Normal dental image counts
  calculusCount: number;
  cariesCount: number;
  gingivitisCount: number;
  hypodontiaCount: number;
  toothDiscolationCount: number;
  ulcerCount: number;
  // X-ray image counts
  cavityCount: number;
  fillingsCount: number;
  impactedToothCount: number;
  implantCount: number;
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

  // Define color mapping based on image type
  let conditionColors: Record<string, string>;
  
  if (results.imageType === 'xray') {
    conditionColors = {
      cavity: "#FF0000", // Red
      fillings: "#0000FF", // Blue
      impacted_tooth: "#00FF00", // Green
      implant: "#800080" // Purple
    };
  } else {
    conditionColors = {
      calculus: "#FFD700", // Gold
      caries: "#FF0000", // Red
      gingivitis: "#FF69B4", // Hot pink
      hypodontia: "#800080", // Purple
      toothDiscolation: "#A0522D", // Brown
      ulcer: "#FFA500" // Orange
    };
  }
  

  const originalImgSrc = results.originalImage;
  const analyzedImgSrc = results.analyzedImage;
  
  return (
    <div className="container">
      <h1 className="page-title">Analysis Results</h1>
      
      <div className="results-layout">
      
        
        <div className="images-section">
          <div className="image-box">
            <h3>Original Image</h3>
            <img 
              src={originalImgSrc} 
              alt="Original Image" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder-dental.png";
                console.log('Original image failed to load:', originalImgSrc);
              }}
            />
          </div>
          
          <div className="image-box">
            <h3>Analyzed Image</h3>
            <img 
              src={analyzedImgSrc} 
              alt="Analyzed Image" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder-dental.png";
                console.log('Analyzed image failed to load:', analyzedImgSrc);
              }}
            />
          </div>
        </div>
        
        {/* Legend box based on image type */}
        {results.imageType === 'xray' ? (
          // X-ray legend
          (results.cavityCount > 0 || 
           results.fillingsCount > 0 || 
           results.impactedToothCount > 0 || 
           results.implantCount > 0) && (
            <div className="legend-container">
              <h3>Color Legend</h3>
              <div className="legend-items">
                {results.cavityCount > 0 && (
                  <div className="legend-item">
                    <div className="color-box" style={{backgroundColor: conditionColors.cavity}}></div>
                    <p>Cavity</p>
                  </div>
                )}
                
                {results.fillingsCount > 0 && (
                  <div className="legend-item">
                    <div className="color-box" style={{backgroundColor: conditionColors.fillings}}></div>
                    <p>Fillings</p>
                  </div>
                )}
                
                {results.impactedToothCount > 0 && (
                  <div className="legend-item">
                    <div className="color-box" style={{backgroundColor: conditionColors.impacted_tooth}}></div>
                    <p>Impacted Tooth</p>
                  </div>
                )}
                
                {results.implantCount > 0 && (
                  <div className="legend-item">
                    <div className="color-box" style={{backgroundColor: conditionColors.implant}}></div>
                    <p>Implant</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          // Normal dental image legend
          (results.calculusCount > 0 || 
           results.cariesCount > 0 || 
           results.gingivitisCount > 0 || 
           results.hypodontiaCount > 0 || 
           results.toothDiscolationCount > 0 || 
           results.ulcerCount > 0) && (
            <div className="legend-container">
              <h3>Color Legend</h3>
              <div className="legend-items">
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
            </div>
          )
        )}
        
        <div className="main-content">
          <div className="analysis-summary-container">
            <div className="recommendation-box">
              <h3>Analysis Summary</h3>
              {results.imageType === 'xray' ? (
                // X-ray analysis summary
                <p>
                  Based on our AI analysis of your dental X-ray:
                  {results.cavityCount > 0 && ` We found ${results.cavityCount} areas with cavities.`}
                  {results.fillingsCount > 0 && ` There are ${results.fillingsCount} dental fillings detected.`}
                  {results.impactedToothCount > 0 && ` We detected ${results.impactedToothCount} impacted teeth.`}
                  {results.implantCount > 0 && ` The analysis shows ${results.implantCount} dental implants.`}
                  {(results.cavityCount === 0 && 
                    results.fillingsCount === 0 && 
                    results.impactedToothCount === 0 && 
                    results.implantCount === 0)
                    ? ' No dental issues were detected in this X-ray image.' 
                    : ' We recommend scheduling an appointment with your dentist to discuss these findings.'}
                </p>
              ) : (
                // Normal dental image analysis summary
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
              )}
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-box total-stat">
              <h3>Total Conditions Detected</h3>
              <p className="stat-value">{results.totalConditionsDetected}</p>
            </div>
            
            <div className="condition-stats">
              {results.imageType === 'xray' ? (
                // X-ray condition stats
                <>
                  {results.cavityCount > 0 && (
                    <div className="stat-box">
                      <h3>Cavity</h3>
                      <p className="stat-value">{results.cavityCount}</p>
                    </div>
                  )}
                  
                  {results.fillingsCount > 0 && (
                    <div className="stat-box">
                      <h3>Fillings</h3>
                      <p className="stat-value">{results.fillingsCount}</p>
                    </div>
                  )}
                  
                  {results.impactedToothCount > 0 && (
                    <div className="stat-box">
                      <h3>Impacted Tooth</h3>
                      <p className="stat-value">{results.impactedToothCount}</p>
                    </div>
                  )}
                  {results.implantCount > 0 && (
                    <div className="stat-box">
                      <h3>Implant</h3>
                      <p className="stat-value">{results.implantCount}</p>
                    </div>
                  )}
                </>
              ) : (
                // Normal dental image condition stats
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="button-section">
          <button className="btn" onClick={handleBack}>
            New Analysis
          </button>
          <button className="btn" onClick={viewHistory}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;