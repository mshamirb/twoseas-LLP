import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaTimes, FaArrowLeft, FaExternalLinkAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import { getEmployeeById } from '../../services/employeeService';
import './EmployeeDetail.css';
import defaultProfileImage from "../../assets/no image found.png";
import SimplifiedCalendarScheduler from '../SimplifiedCalendarScheduler';

const EmployeeDetail = ({ employeeId, setActiveTab, setSelectedEmployee, onAddToWishlist, onRemoveFromWishlist, isInWishlist, showRemoveButton = false, }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Use the props from parent for wishlist operations
  const handleWishlistToggle = (employee, e) => {
    e.stopPropagation();

    if (showRemoveButton && onRemoveFromWishlist) {
      // In wishlist tab - remove
      onRemoveFromWishlist(employee.id);
    } else if (onAddToWishlist) {
      // In employees tab - add
      onAddToWishlist(employee);
    }
  };
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    document: null,
    type: '',
    isLoading: true
  });

  const [showScheduler, setShowScheduler] = useState(false);

  // 🆕 For image enlargement
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageUrl: null,
    employeeName: ''
  });

  const openImageViewer = (imageUrl, name) => {
    setImageViewer({
      isOpen: true,
      imageUrl,
      employeeName: name
    });
  };

  const closeImageViewer = () => {
    setImageViewer({ isOpen: false, imageUrl: null, employeeName: '' });
  };

  const openDocument = (doc, type) => {
    setViewerState({
      isOpen: true,
      document: doc,
      type,
      isLoading: true
    });
  };

  const closeDocument = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  const handleIframeLoad = () => {
    setViewerState(prev => ({ ...prev, isLoading: false }));
  };

  const getDocumentTitle = () => {
    switch (viewerState.type) {
      case 'resume': return 'Resume Document';
      case 'assessment': return 'Assessment Report';
      default: return 'Document Viewer';
    }
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const employeeData = await getEmployeeById(employeeId);
        if (employeeData) {
          setEmployee(employeeData);
          if (setSelectedEmployee) setSelectedEmployee(employeeData);
        } else {
          setError("Professional not found");
        }
      } catch (err) {
        setError("Failed to load professional");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [employeeId, setSelectedEmployee]);
  console.log(employee, "employeessss")

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleScheduleSubmit = (interviewData) => {
    console.log("Interview scheduled successfully:", interviewData);
    setShowScheduler(false);
    setShowSuccessModal(true);
    // alert('Interview scheduled successfully!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading professional...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button
          onClick={() => setActiveTab("employees")}
          className="back-button"
        >
          <FaArrowLeft /> Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="employee-detail-container">
      <div className="detail-card">
        <div className="profile-section">
          <div className="avatarcontainer">
            <img
              src={employee.imageBase64 || defaultProfileImage}
              alt={employee.name}
              className="detail-avatar cursor-pointer"
              onError={(e) => { e.target.src = defaultProfileImage; }}
              onClick={() => openImageViewer(employee.imageBase64 || defaultProfileImage, employee.name)} // 🆕 Added click
            />
            {/* 🆕 T-Key Ribbon */}
            {employee?.tKeyColor && (
              <div
                className="tkey-ribbon"
                style={{
                  backgroundColor: employee.tKeyColor,
                  position: "absolute",
                  top: "-40px",
                  right: "8px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.5 12C17.5 14.21 16.54 16.22 15 17.66L16.5 19.23C18.47 17.45 19.5 14.76 19.5 12C19.5 9.24 18.47 6.55 16.5 4.77L15 6.34C16.54 7.78 17.5 9.79 17.5 12Z" fill="white" />
                  <path d="M12 7.5C13.93 7.5 15.5 9.07 15.5 11H17.5C17.5 7.97 15.03 5.5 12 5.5V7.5Z" fill="white" />
                  <path d="M6.5 12C6.5 9.07 8.07 7.5 10 7.5V5.5C6.97 5.5 4.5 7.97 4.5 11H6.5Z" fill="white" />
                  <path d="M10 16.5C8.07 16.5 6.5 14.93 6.5 13H4.5C4.5 16.03 6.97 18.5 10 18.5V16.5Z" fill="white" />
                  <path d="M12 16.5C10.07 16.5 8.5 14.93 8.5 13H6.5C6.5 16.03 8.97 18.5 12 18.5V16.5Z" fill="white" />
                </svg>
              </div>
            )}
            {/* Wishlist Icon Overlay */}

            <button
              className="wishlist-icon"
              onClick={(e) => handleWishlistToggle(employee, e)}
            >
              {isInWishlist && isInWishlist(employee?.id) ? (
                <FaHeart className="wishlist-heart filled" title="Remove from wishlist" />
              ) : (
                <FaRegHeart className="wishlist-heart" title="Add to wishlist" />
              )}
            </button>
          </div>


          <div className="profile-info">
            <h2 style={{ color: 'white' }}>{employee.name}</h2>
            <p className="position" style={{ color: 'white', marginTop: '-10px' }}>
              {employee.expertise}
            </p>
            <div className='meta-infos'>
            <div className="meta-info">
              <span>{employee.experience} years experience</span>
            </div>
            <div className="meta-info">
              <span>{employee.hiringDate}</span>
            </div>
            </div>
          </div>

          <div className="top-actions">
            {employee.resume && (
              <button className="action-button" onClick={() => openDocument(employee.resume, "resume")}>
                View Resumes
              </button>
            )}
            {employee.assessment && (
              <button className="action-button" onClick={() => openDocument(employee.assessment, "assessment")}>
                View Assessment
              </button>
            )}
            <button
              className="action-button schedule-button"
              onClick={() => setShowScheduler(true)}
            >
              Schedule Interview
            </button>
          </div>
        </div>

        <div className="content-section">
          <div className="intro-section">
            <h3>Professional Introduction</h3>
            <p>{employee.intro}</p>
          </div>

          <div className="intro-section">
            <h3>Core Expertise</h3>
            <div className="skills-container">
              {employee.expertise?.split(',').map((skill, index) => (
                <span key={index} className="skill-tag">{skill.trim()}</span>
              ))}
            </div>
          </div>

          <div className="media-section">
            {employee.introductionVideoLink && (
              <div className="intro-section">
                <h3>Introduction Video</h3>
                <div className="video-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(employee.introductionVideoLink)}`}
                    title="Introduction Video"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            {employee.interviewVideoLink && (
              <div className="intro-section">
                <h3>Interview Video</h3>
                <div className="video-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(employee.interviewVideoLink)}`}
                    title="Interview Video"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🆕 Profile Image Viewer
      {imageViewer.isOpen && (
        <div className="profile-image-viewer">
          <div className="viewer-overlay" onClick={closeImageViewer}></div>
          <div className="profile-viewer-container">
            <div className="profile-viewer-header">
              <h3>{imageViewer.employeeName}'s Profile Picture</h3>
              <button
                onClick={closeImageViewer}
                className="close-button"
                aria-label="Close profile image viewer"
              >
                <FaTimes color="white" />
              </button>
            </div>
            <div className="profile-viewer-content">
              <img
                src={imageViewer.imageUrl}
                alt={`${imageViewer.employeeName}'s profile`}
                className="profile-large-image"
              />
            </div>
          </div>
        </div>
      )} */}
      {/* Profile Image Viewer Modal */}
      {imageViewer.isOpen && (
        <div className="profile-image-viewer">
          <div className="profile-viewer-overlay" onClick={closeImageViewer}></div>
          <button
            onClick={closeImageViewer}
            className="close-button"
            aria-label="Close profile image viewer"
          >
            <FaTimes />
          </button>
          <div className="profile-viewer-container">
            <div className="profile-viewer-content">
              <img
                src={imageViewer.imageUrl}
                alt={`${imageViewer.employeeName}'s profile`}
                className="profile-large-image"
              />
            </div>
            <div className="profile-viewer-name">
              <h3>{imageViewer.employeeName}</h3>
            </div>
          </div>
        </div>
      )}

      {viewerState.isOpen && (
        <div className="document-viewer">
          <div className="viewer-overlay" onClick={closeDocument}></div>
          <div className="viewer-container">
            <div className="viewer-header">
              <h3 style={{ color: "#2a2d7c" }}>{getDocumentTitle()}</h3>
              <div className="viewer-actions">
                <a
                  href={viewerState.document.base64}
                  download={viewerState.document.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                  title="Open in new tab"
                >
                  <FaExternalLinkAlt />
                </a>
                <button onClick={closeDocument} className="close-button" aria-label="Close document viewer">
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="viewer-content">
              {viewerState.isLoading && (
                <div className="viewer-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading document...</p>
                </div>
              )}
              <iframe
                src={viewerState.document.base64}
                title={getDocumentTitle()}
                className={`document-iframe ${viewerState.isLoading ? 'loading' : ''}`}
                allow="fullscreen"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
        </div>
      )}

      {showScheduler && employee?.id && (
        <div className="scheduler-modal-overlay">
          <div className="scheduler-modal">
            <button
              className="close-scheduler-btn"
              onClick={() => setShowScheduler(false)}
            >
              <FaTimes />
            </button>
            <SimplifiedCalendarScheduler
              selectedEmployee={employee}
              onScheduleSubmit={handleScheduleSubmit}
              onClose={() => setShowScheduler(false)}
            />
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>🎉 Interview Scheduled!</h3>
            <p>Thank you for scheduling with us. Our team will be in contact with you shortly.</p>
            <button
              className="primary-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
