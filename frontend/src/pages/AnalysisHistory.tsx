import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Disease {
  id: number;
  name: string;
  description: string;
}

interface Analysis {
  id: number;
  original_image: {
    id: number;
    image: string;
    image_url: string;
  };
  analyzed_image_url: string;
  created_at: string;
  diseases: Disease[];
  total_conditions: number;
  calculus_count: number;
  caries_count: number;
  gingivitis_count: number;
  hypodontia_count: number;
  tooth_discolation_count: number;
  ulcer_count: number;
}

const AnalysisHistory: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    // Function to fetch user's analysis history
    const fetchAnalysisHistory = async () => {
      try {
        const token = localStorage.getItem('access');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`${BASE_URL}/api/user/analyses/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Fetched analyses:', response.data);
        setAnalyses(response.data);
      } catch (error) {
        console.error('Error fetching analysis history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisHistory();
  }, [navigate]);

  // Inside the viewAnalysisDetails function in AnalysisHistory.tsx
const viewAnalysisDetails = (analysis: Analysis) => {
    try {
      console.log('Viewing analysis details for:', analysis.id);
      
      // Use the getImageUrl function to ensure URLs are properly formatted
      const analysisData = {
        originalImage: getImageUrl(analysis.original_image?.image_url || analysis.original_image?.image),
        analyzedImage: getImageUrl(analysis.analyzed_image_url),
        totalConditionsDetected: analysis.total_conditions,
        calculusCount: analysis.calculus_count,
        cariesCount: analysis.caries_count,
        gingivitisCount: analysis.gingivitis_count,
        hypodontiaCount: analysis.hypodontia_count,
        toothDiscolationCount: analysis.tooth_discolation_count,
        ulcerCount: analysis.ulcer_count,
        analysisId: analysis.id
      };
      
      console.log('Storing analysis data:', analysisData);
      sessionStorage.setItem('analysisResults', JSON.stringify(analysisData));
      navigate('/results');
    } catch (error) {
      console.error('Error navigating to results:', error);
      alert('There was an error viewing the analysis details. Please try again.');
    }
  };

  // Function to ensure image URLs display correctly
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) {
      return '/placeholder-dental.png';
    }
    
    // If it's already a full URL or data URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Otherwise, prepend the base URL
    return `${BASE_URL}${imagePath}`;
  };

  if (loading) {
    return <div className="loading">Loading analysis history...</div>;
  }

  return (
    <div className="container">
      <div className="logo-container">
        <div className="left-logo">
          <img src="/logo.png" alt="Dental Care Logo" className="logo" />
          <h2>DENTAL CARE</h2>
        </div>
      </div>

      <h1 className="page-title">Your Analysis History</h1>

      {analyses.length === 0 ? (
        <div className="no-records">
          <p>You haven't performed any dental analyses yet.</p>
          <button className="btn" onClick={() => navigate('/ai-checkup')}>
            Perform New Analysis
          </button>
        </div>
      ) : (
        <div className="analysis-list">
          {analyses.map((analysis) => (
            <div className="analysis-item" key={analysis.id}>
              <div className="analysis-thumbnail">
                <img 
                  src={getImageUrl(analysis.original_image?.image_url || analysis.original_image?.image)} 
                  alt="Dental scan" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-dental.png";
                    console.log('Image failed to load:', analysis.original_image?.image);
                  }}
                />
              </div>
              <div className="analysis-info">
                <h3>Analysis #{analysis.id}</h3>
                <p>Date: {new Date(analysis.created_at).toLocaleString()}</p>
                <p>Conditions detected: {analysis.total_conditions}</p>
                <button 
                  className="btn view-btn"
                  onClick={() => viewAnalysisDetails(analysis)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="action-buttons">
        <button className="btn back-btn" onClick={() => navigate('/ai-checkup')}>
          Perform New Analysis
        </button>
      </div>
    </div>
  );
};

export default AnalysisHistory;