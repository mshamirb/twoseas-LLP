import React, { useState, useRef, useEffect } from 'react';
import { FaFileUpload, FaLinkedin, FaCheck, FaTimes, FaVideo, FaCamera, FaMicrophone, FaUpload, FaStop, FaPlay, FaPause, FaDownload } from 'react-icons/fa';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FiCamera } from 'react-icons/fi';

const VideoRecorderOverlay = ({ onComplete, onClose }) => {
  const [countdown, setCountdown] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const MAX_RECORDING_TIME = 180; // 90 seconds maximum

  const startCountdown = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setCountdown(4); // Start with 5 second countdown
    } catch (err) {
      console.error("Error accessing camera:", err);
      onClose();
      alert("Could not access camera. Please check permissions.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      console.error("No stream available to record");
      return;
    }

    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm'
      });

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onComplete(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      onClose();
      alert("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
      cleanup();
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setCountdown(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (countdown === 0) {
      startRecording();
    } else if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    startCountdown();
    return cleanup;
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recorder-overlay">
      <div className="recorder-container">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <video ref={videoRef} muted className="camera-preview" />

        {countdown !== null && countdown > 0 ? (
          <div className="countdown">
            <div className="countdown-number">{countdown}</div>
            <div className="countdown-text">Recording starts in...</div>
          </div>
        ) : null}

        {isRecording && (
          <div className="recording-info">
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span>REC</span>
            </div>
            <div className="recording-timer">{formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}</div>
          </div>
        )}

        {isRecording && (
          <div className="controls">
            <button className="stop-btn" onClick={stopRecording}>
              <FaStop /> Stop Recording
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .recorder-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .recorder-container {
          position: relative;
          width: 90%;
          max-width: 800px;
          background: #111;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .camera-preview {
          width: 100%;
          max-height: 70vh;
          display: block;
          background: #000;
        }
        
        .countdown {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
        }
        
        .countdown-number {
          font-size: 72px;
          font-weight: bold;
          color: #ff4757;
          text-shadow: 0 0 10px rgba(255, 71, 87, 0.7);
        }
        
        .countdown-text {
          font-size: 18px;
          margin-top: 10px;
        }
        
        .recording-info {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 0, 0, 0.3);
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
        }
        
        .recording-dot {
          width: 10px;
          height: 10px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        .recording-timer {
          color: white;
          font-weight: bold;
          background: rgba(0, 0, 0, 0.5);
          padding: 5px 10px;
          border-radius: 4px;
        }
        
        .controls {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
        }
        
        .stop-btn {
          background: #ff4757;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.2s;
        }
        
        .stop-btn:hover {
          background: #ff6b81;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

const VideoPlayer = ({ videoBlob, onReRecord, onUseVideo, attemptNumber, maxAttempts }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // Create object URL when component mounts
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

      // Clean up object URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoBlob]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Error playing video:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `interview-attempt-${attemptNumber}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`video-player-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="video-player-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h4>Recorded Interview Video (Attempt {attemptNumber})</h4>
        <span className="collapse-toggle">
          {isCollapsed ? 'Show' : 'Hide'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="video-player-content">
          <video
            ref={videoRef}
            src={videoUrl}
            controls={false}
            className="video-preview"
            onEnded={() => setIsPlaying(false)}
          />

          <div className="video-controls-container">


            <div className="video-actions">
              <button
                onClick={onReRecord}
                className="re-record-btn"
                disabled={attemptNumber >= maxAttempts}
              >
                Record Another (Attempt {attemptNumber + 1}/{maxAttempts})
              </button>
              <button onClick={() => onUseVideo(videoBlob)} className="use-video-btn">
                Use This Video
              </button>
            </div>
            <div className="video-controls">
              <button onClick={togglePlay} className="control-btn">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <span className="video-time">
                {videoRef.current ? formatTime(videoRef.current.currentTime) : '00:00'}
              </span>
              <button onClick={handleDownload} className="control-btn">
                <FaDownload /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .video-player-container {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin: 15px 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .video-player-content {
          padding: 15px;
          background-color: white;
          display: flex;
          flex-direction: column;          
        }
        
        .video-preview {
          width: 100%;
          max-height: 300px;
          background-color: #000;
          border-radius: 4px;
        }

        .video-controls-container {
          display: flex;
          flex-direction: column;
          gap: 55px;
        }
        
        .video-controls {
          display: flex;
          margin-bottom: 155px;
          align-items: center;
          background: #2a2f7c !important;
        }
        
        .video-player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background-color: #f5f5f5;
          cursor: pointer;
          user-select: none;
        }
        
        .video-player-header h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        
        .collapse-toggle {
          font-size: 14px;
          color: #666;
        }
        
        .video-player-content {
          padding: 15px;
          background-color: white;
        }
        
        .video-preview {
          width: 100%;
          max-height: 300px;
          background-color: #000;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .video-time {
          font-size: 14px;
          color: #06a3c2;
          flex-grow: 1;
          text-align: center;
        }

        @media (max-width: 768px) {
          .video-controls {
            display: flex;
            margin-bottom: 195px;
            align-items: center;
            background: #2a2f7c !important;
          }
        }
        
        .control-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background-color: #06a3c2;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .control-btn:hover {
          background-color: #e0e0e0;
        }
        
        .video-actions {
          display: flex;
          gap: 10px;
          margin-top: 60px;
        }
        
        .re-record-btn {
          flex: 1;
          padding: 12px;
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        }
        
        .re-record-btn:hover:not(:disabled) {
          background-color: #e9e9e9;
        }
        
        .re-record-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .use-video-btn {
          flex: 1;
          padding: 12px;
          background-color: #2a2d7c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        }
        
        .use-video-btn:hover {
          background-color: #1a1d6c;
        }
        
        .collapsed .video-player-content {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ApplicationForm = ({ jobTitle, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    video: null,
    videoBlob: null,
    photo: null,
    coverLetter: '',
    resume: null,
    videoSource: 'upload',
    currentSalary: '', // ✅ empty string instead of 0
    expectedSalary: '', // ✅ empty string instead of 0
    salarySlip: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [recordedAttempts, setRecordedAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const MAX_ATTEMPTS = 3;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, salarySlip: file, salarySlipName: file.name, });
    }
  };

  const handleVideoSourceChange = (source) => {
    setFormData(prev => ({ ...prev, videoSource: source }));
    setErrors(prev => ({ ...prev, video: '' }));
  };

  const handleRecordingComplete = (blob) => {
    const newAttempt = {
      blob,
      attemptNumber: currentAttempt,
      timestamp: new Date().toISOString()
    };

    setRecordedAttempts(prev => [...prev, newAttempt]);
    setCurrentAttempt(prev => prev + 1);
    setShowCamera(false);
  };

  const handleReRecord = () => {
    if (currentAttempt > MAX_ATTEMPTS) return;
    setShowCamera(true);
  };

  const handleUseVideo = (blob) => {
    const extension = blob.type.split("/")[1] || "webm";
    const videoFile = new File(
      [blob],
      `recorded-video-attempt-${recordedAttempts.length}.${extension}`,
      {
        type: blob.type,
        lastModified: Date.now()
      }
    );
    setFormData(prev => ({
      ...prev,
      videoBlob: blob,
      video: videoFile
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }
    if (formData.videoSource === 'upload' && !formData.video) {
      newErrors.video = 'Video introduction is required';
      isValid = false;
    }
    if (formData.videoSource === 'record' && !formData.videoBlob) {
      newErrors.video = 'Please record a video introduction';
      isValid = false;
    }
    if (!formData.photo) {
      newErrors.photo = 'Profile photo is required';
      isValid = false;
    }
    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     // Simulate API call
  //     await new Promise(resolve => setTimeout(resolve, 1500));
  //     setIsSuccess(true);
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     alert('There was an error submitting your application. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();

    // 🔵 TEXT FIELDS
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("linkedin", formData.linkedin);
    formDataToSend.append("coverLetter", formData.coverLetter);
    formDataToSend.append("currentSalary", formData.currentSalary);
    formDataToSend.append("expectedSalary", formData.expectedSalary);

    // 🔵 FILES
    // Video (Either file OR recorded blob)
    if (formData.video) {
      formDataToSend.append("video", formData.video);
    } else if (formData.videoBlob) {
      formDataToSend.append(
        "video",
        formData.videoBlob,
        "recorded-video.mp4"
      );
    }

    // Photo
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    // Resume
    if (formData.resume) {
      formDataToSend.append("resume", formData.resume);
    }

    // Salary Slip (Optional)
    if (formData.salarySlip) {
      formDataToSend.append("salarySlip", formData.salarySlip);
    }

    // 🔵 SEND REQUEST
    const response = await fetch("https://twoseas.org/sendMail.php", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();

    if (result.success) {
      setIsSuccess(true);
    } else {
      alert("Error sending application.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }

  setIsSubmitting(false);
};

  const colors = {
    primary: '#2A2D7C',
    secondary: '#06A3C2',
    accent: '#4CAF50',
    background: '#F9FAFF',
    border: '#E0E3F1',
    textPrimary: '#2A2D7C',
    textSecondary: '#6A6D9E',
    textHint: '#A7AACB',
    success: '#4CAF50',
    error: '#F44336'
  };

  return (
    <div className="application-modal">
      <div className="application-container">
        {/* Header Section */}
        <div className="application-header">
          <button
            className="close-btn"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            <FaTimes />
          </button>
          <div className="header-content">
            <h2 className="application-title">
              Apply for <span className="highlight">{jobTitle}</span>
            </h2>
            <p className="application-subtitle">Join our team and start your next adventure</p>
            <div className="header-divider">
              <div className="divider-line"></div>
              <div className="divider-dot"></div>
              <div className="divider-line"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="application-content">
          {isSuccess ? (
            <div className="success-state">
              <div className="success-icon">
                <div className="success-circle">
                  <FaCheck />
                </div>
              </div>
              <h3>Application Submitted</h3>
              <p className="success-message">Thank you for applying to {jobTitle}.</p>
              <p className="success-message">We'll review your application and be in touch soon.</p>
              <button className="return-btn" onClick={onClose}>
                Return to Jobs
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="application-form">
              {/* First Row - Full Name and LinkedIn */}
              <div className="form-row">
                <div className={`form-group floating-label half-width ${errors.name ? 'has-error' : ''}`}>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="name">Full Name*</label>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group floating-label with-icon half-width">
                  <div className="input-container">
                    <FaLinkedin className="input-icon" />
                    <input
                      type="url"
                      name="linkedin"
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder=" "
                    />
                    <label htmlFor="linkedin">LinkedIn Profile</label>
                  </div>
                </div>
              </div>

              {/* Second Row - Email and Phone */}
              <div className="form-row">
                <div className={`form-group floating-label half-width ${errors.email ? 'has-error' : ''}`}>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="email">Email*</label>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className={`form-group floating-label half-width ${errors.phone ? 'has-error' : ''}`}>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="phone">Phone*</label>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              {/* Video Introduction Section */}
              <div className="form-group">
                <label className="file-label">Video Introduction*</label>

                {/* Toggle between upload or record */}
                <div className="video-source-toggle">
                  <button
                    type="button"
                    className={`toggle-option ${formData.videoSource === 'upload' ? 'active' : ''}`}
                    onClick={() => handleVideoSourceChange('upload')}
                  >
                    Upload Video
                  </button>
                  <span className="toggle-separator">OR</span>
                  <button
                    type="button"
                    className={`toggle-option ${formData.videoSource === 'record' ? 'active' : ''}`}
                    onClick={() => handleVideoSourceChange('record')}
                  >
                    Record Video (Upto 3 minutes)
                  </button>
                </div>

                {/* Upload mode */}
                {formData.videoSource === 'upload' && (
                  <div className={`file-upload ${errors.video ? 'has-error' : ''}`}>
                    <label className="upload-label">
                      <span className="upload-content">
                        <FaVideo className="upload-icon" />
                        {formData.video ? formData.video.name : 'Upload Video (Max 50MB)'}
                      </span>
                      <input
                        type="file"
                        name="video"
                        onChange={handleChange}
                        accept="video/*"
                      />
                    </label>
                    {errors.video && <span className="error-message">{errors.video}</span>}
                    <p className="file-hint">MP4, MOV, or AVI (Max 50MB)</p>
                  </div>
                )}

                {/* Record mode */}
                {formData.videoSource === 'record' && (
                  <div className={`video-recorder ${errors.video ? 'has-error' : ''}`}>
                    {/* If no recording yet */}
                    {recordedAttempts.length === 0 && (
                      <button
                        type="button"
                        className="start-recording-btn"
                        onClick={() => setShowCamera(true)}
                      >
                        <FaMicrophone /> Start Recording
                      </button>
                    )}

                    {/* Show recorded attempts */}
                    {recordedAttempts.length > 0 && (
                      <div className="recorded-attempts">
                        {recordedAttempts.map((attempt, index) => (
                          <VideoPlayer
                            key={index}
                            videoBlob={attempt.blob}
                            attemptNumber={attempt.attemptNumber}
                            maxAttempts={MAX_ATTEMPTS}
                            onReRecord={handleReRecord}
                            onUseVideo={() => handleUseVideo(attempt.blob)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Show current selected video */}
                    {formData.video && (
                      <div className="selected-video-info">
                        <p>Selected Video: {formData.video.name}</p>
                      </div>
                    )}

                    {/* Allow new recording if attempts remain */}
                    {recordedAttempts.length > 0 && currentAttempt <= MAX_ATTEMPTS && (
                      <button
                        type="button"
                        className="start-recording-btn"
                        onClick={() => setShowCamera(true)}
                        style={{ marginTop: '15px' }}
                      >
                        <FaMicrophone /> Record Another (Attempt {currentAttempt}/{MAX_ATTEMPTS})
                      </button>
                    )}

                    {errors.video && <span className="error-message">{errors.video}</span>}
                  </div>
                )}
              </div>

              {/* Profile Photo Upload */}
              <div className={`form-group file-upload ${errors.photo ? 'has-error' : ''}`}>
                <label className="file-label">Profile Photo*</label>
                <label className="upload-label">
                  <span className="upload-content">
                    <FaCamera className="upload-icon" />
                    {formData.photo ? formData.photo.name : 'Upload Photo (Max 5MB)'}
                  </span>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </label>
                {errors.photo && <span className="error-message">{errors.photo}</span>}
                <p className="file-hint">JPG, PNG (Max 5MB)</p>
              </div>

              {/* Resume Upload */}
              <div className={`form-group file-upload ${errors.resume ? 'has-error' : ''}`}>
                <label className="file-label">RESUME / CV*</label>
                <label className="upload-label">
                  <FaFileUpload className="upload-icon" />
                  <span>{formData.resume ? formData.resume.name : 'Choose File'}</span>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </label>
                {errors.resume && <span className="error-message">{errors.resume}</span>}
                <p className="file-hint">PDF, DOC, or DOCX (Max 5MB)</p>
              </div>

              {/* Cover Letter */}
              <div className="form-group floating-label">
                <label className="file-label">COVER LETTER</label>
                <textarea
                  name="coverLetter"
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  placeholder=" "
                ></textarea>
                <div className="char-count">{formData.coverLetter.length}/1000</div>
              </div>
              <div className="salary-section">
                {/* Current Salary Field */}
                <div className="form-group floating-label salary-input">
                  <input
                    type="text"
                    id="currentSalary"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleChange}
                    placeholder="CURRENT SALARY"
                  />
                </div>

                {/* Expected Salary + Salary Slip Upload */}
                <div className="form-group floating-label salary-input">
                  <input
                    type="text"
                    id="expectedSalary"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    placeholder="EXPECTED SALARY"
                  />
                </div>
              </div>


              {showCamera && (
                <VideoRecorderOverlay
                  onComplete={handleRecordingComplete}
                  onClose={() => setShowCamera(false)}
                />
              )}

              {/* Form Footer */}
              <div className="form-footer">
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? (
                    <span className="submit-spinner"></span>
                  ) : (
                    'Submit Application'
                  )}
                </button>
                <p className="disclaimer">
                  By submitting, you agree to our <a href="#">privacy policy</a> and <a href="#">terms</a>.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .application-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(42, 45, 124, 0.96);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 2rem;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .application-container {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .application-header {
          padding: 2.5rem 3rem 1.5rem;
          position: relative;
          background: linear-gradient(135deg, ${colors.background} 0%, #f0f3ff 100%);
          border-radius: 20px 20px 0 0;
        }

        .header-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #fff;
          border: 1px solid ${colors.border};
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${colors.primary};
          transition: all 0.3s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          z-index: 10;
        }

        .close-btn:hover {
          background: #f5f7ff;
          transform: rotate(90deg);
          color: ${colors.secondary};
        }

        .application-title {
          color: ${colors.primary};
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }

        .highlight {
          color: ${colors.secondary};
          font-weight: 700;
        }

        .application-subtitle {
          color: ${colors.textSecondary};
          font-size: 1rem;
          margin: 0 0 1.5rem;
          font-weight: 500;
        }

        .header-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          width: 200px;
        }

        .divider-line {
          height: 2px;
          background: linear-gradient(to right, transparent, ${colors.secondary}, transparent);
          flex: 1;
        }

        .divider-dot {
          width: 6px;
          height: 6px;
          background: ${colors.secondary};
          border-radius: 50%;
          margin: 0 10px;
        }

        .application-content {
          padding: 2rem 3rem 3rem;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .half-width {
          width: 50%;
        }

        .full-width {
          width: 100%;
        }

        .form-group {
          position: relative;
          margin-bottom: 1.5rem;
        }

        /* Floating Label Styles */
        .floating-label {
          position: relative;
        }

        .floating-label label {
          position: absolute;
          top: 18px;
          left: 20px;
          font-size: 0.9375rem;
          color: ${colors.textSecondary};
          font-weight: 500;
          pointer-events: none;
          transition: all 0.2s ease;
          background: ${colors.background};
          padding: 0 5px;
          border-radius: 4px;
        }

        .with-icon .floating-label label {
          left: 45px;
        }

        .floating-label input,
        .floating-label textarea {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border: 1px solid ${colors.border};
          border-radius: 10px;
          font-size: 0.9375rem;
          transition: all 0.3s;
          background: ${colors.background};
          color: ${colors.textPrimary};
        }

        .with-icon input {
          padding-left: 3.5rem;
        }

        .floating-label input:focus,
        .floating-label textarea:focus,
        .floating-label input:not(:placeholder-shown),
        .floating-label textarea:not(:placeholder-shown) {
          border-color: ${colors.secondary};
          box-shadow: 0 0 0 3px rgba(6, 163, 194, 0.1);
        }

        .floating-label input:focus + label,
        .floating-label textarea:focus + label,
        .floating-label input:not(:placeholder-shown) + label,
        .floating-label textarea:not(:placeholder-shown) + label {
          top: -10px;
          left: 15px;
          font-size: 0.75rem;
          color: ${colors.secondary};
          background: white;
        }

        .with-icon input:focus + label,
        .with-icon input:not(:placeholder-shown) + label {
          left: 40px;
        }

        textarea {
          min-height: 160px;
          resize: vertical;
          margin-top: 0.5rem;
        }

        .char-count {
          text-align: right;
          font-size: 0.75rem;
          color: ${colors.textHint};
          margin-top: 0.25rem;
        }

        .with-icon .input-container {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: ${colors.textSecondary};
          font-size: 1rem;
        }

        .upload-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .file-upload {
          margin-top: 0.5rem;
        }

        .file-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: ${colors.textPrimary};
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .upload-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border: 1px dashed ${colors.border};
          border-radius: 10px;
          background: ${colors.background};
          cursor: pointer;
          transition: all 0.3s;
        }

        .upload-label:hover {
          border-color: ${colors.secondary};
          background: rgba(6, 163, 194, 0.05);
        }

        .upload-icon {
          color: ${colors.secondary};
          font-size: 1.25rem;
        }

        .upload-label span {
          color: ${colors.textPrimary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.9375rem;
        }

        .file-upload input[type="file"] {
          display: none;
        }

        .file-hint {
          font-size: 0.75rem;
          color: ${colors.textHint};
          margin-top: 0.5rem;
        }

        /* Video Source Toggle */
        .video-source-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .toggle-option {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid ${colors.border};
          background: white;
          color: ${colors.textSecondary};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
        }

        .toggle-option.active {
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};
        }

        .toggle-separator {
          color: ${colors.textSecondary};
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0 5px;
        }

        /* Video Recorder */
        .video-recorder {
          margin-top: 10px;
        }

        .recorded-attempts {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .selected-video-info {
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 14px;
        }

        .start-recording-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 15px 15px; /* top, left/right, bottom */
          background: #2a2d7c;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          justify-content: center;
          margin-top: 20px; /* adjust value as needed */
        }

        .start-recording-btn:hover {
          background: #1a1d6c;
        }

        /* Form Footer */
        .form-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 2rem;
        }

        .submit-btn {
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          color: white;
          border: none;
          padding: 1.125rem 2.5rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          max-width: 300px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(42, 45, 124, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(42, 45, 124, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: ${colors.border};
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .submit-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .disclaimer {
          font-size: 0.75rem;
          color: ${colors.textHint};
          margin-top: 1.5rem;
          text-align: center;
          max-width: 400px;
          line-height: 1.5;
        }

        .disclaimer a {
          color: ${colors.secondary};
          text-decoration: none;
          transition: all 0.2s;
        }

        .disclaimer a:hover {
          text-decoration: underline;
        }

        /* Success State */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 0 3rem;
        }

        .success-icon {
          margin-bottom: 2rem;
        }

        .success-circle {
          width: 100px;
          height: 100px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.accent};
          font-size: 2.5rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .success-state h3 {
          color: ${colors.textPrimary};
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .success-message {
          color: ${colors.textSecondary};
          margin-bottom: 0.75rem;
          line-height: 1.6;
          max-width: 400px;
        }

        .return-btn {
          background: ${colors.secondary};
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 2rem;
          box-shadow: 0 4px 15px rgba(6, 163, 194, 0.3);
        }

        .return-btn:hover {
          background: #0589a3;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(6, 163, 194, 0.4);
        }

        /* Error States */
        .has-error input,
        .has-error textarea,
        .has-error .upload-label,
        .has-error .video-preview-container {
          border-color: ${colors.error} !important;
          background-color: rgba(244, 67, 54, 0.05) !important;
        }
        
        .error-message {
          color: ${colors.error};
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }
        
        .has-error label {
          color: ${colors.error} !important;
        }
        
        .has-error .file-label {
          color: ${colors.error} !important;
        }
        
        .has-error .upload-icon {
          color: ${colors.error} !important;
        }
.salary-section {
  display: flex;
  gap: 20px;
  width: 100%;
}
  .salary-input{
    flex: 1;
    }

        /* Responsive */
        @media (max-width: 768px) {
          .application-container {
            max-height: 95vh;
          }
          
          .application-header, .application-content {
            padding: 1.5rem;
          }
          
          .form-row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .half-width {
            width: 100%;
          }

          .video-source-toggle {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .application-modal {
            padding: 1rem;
          }
          
          .application-title {
            font-size: 1.5rem;
          }
          
          .application-subtitle {
            font-size: 0.875rem;
          }
          
          .floating-label input,
          .floating-label textarea {
            padding: 1rem 1.25rem;
          }
          
          .with-icon input {
            padding-left: 3rem;
          }
          
          .input-icon {
            left: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationForm;