import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEmployee.css';
import { currencies, navItems } from '../AdminDashboard/constants';
import { db, collection, addDoc, getDocs } from '../../firebase';
import defaultProfileImage from "../../assets/no image found.png";
import ImageCropperModal from '../../components/ImageCropperModel/ImageCropperModel';

const AddEmployee = ({ noPadding, setActiveMenuItem }) => {
    const navigate = useNavigate();
    const [employee, setEmployee] = useState({
        name: '',
        email: '',
        experience: '',
        expertise: '',
        hiringDate: '',
        intro: '',
        image: null,
        interviewVideoLink: '',
        introductionVideoLink: '',
        resumeLink: '',
        assessmentLink: '',
        hiddenFromClients: [],
        tKeyColor: '' // Add T-Key color field
    });
    const [clients, setClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [selectedNiche, setSelectedNiche] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    // ✅ New state for visibility modal
    const [showVisibilityModal, setShowVisibilityModal] = useState(false);
    const [selectedVisibility, setSelectedVisibility] = useState('admin'); // 'client', 'admin', 'both'

    const [showCropper, setShowCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // T-Key color options
    const tKeyColors = [
        { id: '#000000', name: 'Black' },
        { id: '#19e965ff', name: 'Green' },      // your previous green
        { id: '#ec0b0bff', name: 'Red' },
        { id: '#a0481fff', name: 'Brown' },
        { id: '#1f41afff', name: 'Dark Blue' },
    ];

    // ✅ fetch clients list
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const snapshot = await getDocs(collection(db, "clients"));
                const clientList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClients(clientList);
            } catch (err) {
                console.error("Error fetching clients: ", err);
            }
        };
        fetchClients();
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleHiddenClientsChange = (e) => {
        const options = Array.from(e.target.selectedOptions);
        const selectedIds = options.map(opt => opt.value);
        setEmployee({ ...employee, hiddenFromClients: selectedIds });
    };

    const niches = navItems.map((item, index) => ({
        id: `niche-${index}`,
        name: item
    }));

    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployee({ ...employee, [name]: value });
    };

    // const handleImageUpload = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     // Validate image size (max 500KB)
    //     if (file.size > 500000) {
    //         alert('Image must be smaller than 500KB');
    //         return;
    //     }

    //     const reader = new FileReader();
    //     reader.onload = (event) => {
    //         setEmployee({ ...employee, image: event.target.result });
    //     };
    //     reader.readAsDataURL(file);
    // };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500000) {
            alert('Image must be smaller than 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target.result);
            setShowCropper(true); // open popup to crop
        };
        reader.readAsDataURL(file);
    };

    const handlePdfUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setEmployee((prev) => ({
                ...prev,
                [`${type}Base64`]: reader.result, // store Base64
                [`${type}FileName`]: file.name
            }));
        };
        reader.readAsDataURL(file); // Convert to Base64
    };

    const validateGoogleDriveLink = (url) => {
        if (!url) return true;
        return url.includes('drive.google.com') || url.includes('docs.google.com');
    };

    const YouTubeLinkInput = ({ label, name, value, onChange, placeholder }) => {
        const extractYouTubeId = (url) => {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        };

        const videoId = extractYouTubeId(value);

        return (
            <div className="form-group">
                <label>{label}</label>
                <div className="input-with-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 16.5L16 12L10 7.5V16.5ZM21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19Z" fill="#64748B" />
                    </svg>
                    <input
                        type="url"
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="youtube-input"
                    />
                    {videoId && (
                        <div className="input-status valid">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#22c55e" />
                            </svg>
                        </div>
                    )}
                </div>

                {videoId && (
                    <div className="video-preview-container">
                        <div className="video-preview">
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`${name} preview`}
                            />
                        </div>
                        <div className="video-actions">
                            <button
                                type="button"
                                className="clear-video-btn"
                                onClick={() => onChange({ target: { name, value: '' } })}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#64748B" />
                                </svg>
                                Remove Video
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleSubmitWithVisibility = async (e) => {
        e.preventDefault();
        setShowVisibilityModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Validate required fields
            if (!employee.name || !selectedNiche || !employee.email) {
                throw new Error('Please fill in all required fields');
            }

            // Validate email format
            if (!validateEmail(employee.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Validate Google Drive links
            if (!validateGoogleDriveLink(employee.resumeLink)) {
                throw new Error('Please provide a valid Google Drive link for the resume');
            }

            if (!validateGoogleDriveLink(employee.assessmentLink)) {
                throw new Error('Please provide a valid Google Drive link for the assessment');
            }

            // Prepare employee data
            const employeeData = {
                name: employee.name,
                email: employee.email,
                experience: employee.experience,
                expertise: employee.expertise,
                intro: employee.intro,
                imageBase64: employee.image || defaultProfileImage,
                niche: selectedNiche,
                interviewVideoLink: employee.interviewVideoLink,
                introductionVideoLink: employee.introductionVideoLink,
                createdAt: new Date(),
                status: "active",
                resume: {
                    fileName: employee.resumeFileName,
                    base64: employee.resumeBase64,
                    uploadedAt: new Date()
                },
                assessment: {
                    fileName: employee.assessmentFileName,
                    base64: employee.assessmentBase64,
                    uploadedAt: new Date()
                },
                hiddenFromClients: employee.hiddenFromClients || [],
                tKeyColor: employee.tKeyColor, // Include T-Key color
                visibleTo: selectedVisibility,
                hiringDate: employee.hiringDate
            };

            // Add to Firestore
            await addDoc(collection(db, "employees"), employeeData);

            alert('Employee added successfully!');
            navigate('/admin-dashboard');
        } catch (error) {
            console.error('Error adding employee: ', error);
            setSubmitError(error.message || 'Failed to add employee. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className={`add-employee-page ${noPadding ? "no-padding" : ""}`}>
            <div className="add-employee-container">
                <div className="add-employee-header">
                    <div className="header-content">
                        <h1>Onboard New Talent</h1>
                        <p>Create a comprehensive profile to showcase this professional</p>
                    </div>
                    <div className="header-accent"></div>
                </div>

                <form onSubmit={handleSubmitWithVisibility} className="add-employee-form">
                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#2A2D7C" />
                                </svg>
                            </div>
                            <h2>Basic Information</h2>
                        </div>

                        <div className="employee-profile-section">
                            <div className="profile-image-upload">
                                <div
                                    className={`image-upload-container ${employee.image ? 'has-image' : ''}`}
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {employee.image ? (
                                        <img src={employee.image} alt="Profile" className="profile-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 5H17V12H19V5C19 3.897 18.103 3 17 3H4C2.897 3 2 3.897 2 5V17C2 18.103 2.897 19 4 19H12V17H4V5Z" fill="#2A2D7C" fillOpacity="0.2" />
                                                <path d="M8 11L5 15H16L12 9L9 13L8 11Z" fill="#2A2D7C" fillOpacity="0.4" />
                                                <path d="M19 14H17V17H14V19H17V22H19V19H22V17H19V14Z" fill="#06a3c2" />
                                            </svg>
                                            <span>Upload Profile Photo</span>
                                        </div>
                                    )}
                                    <div className="image-upload-overlay">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 5H17V12H19V5C19 3.897 18.103 3 17 3H4C2.897 3 2 3.897 2 5V17C2 18.103 2.897 19 4 19H12V17H4V5Z" fill="white" />
                                            <path d="M8 11L5 15H16L12 9L9 13L8 11Z" fill="white" />
                                            <path d="M19 14H17V17H14V19H17V22H19V19H22V17H19V14Z" fill="white" />
                                        </svg>
                                        <span>{employee.image ? 'Change Photo' : 'Upload Photo'}</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <p className="image-upload-hint">Max 500KB, high resolution recommended (500x500px)</p>
                            </div>

                            <div className="profile-details">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name <span className="required">*</span></label>
                                        <div className="input-with-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#64748B" />
                                            </svg>
                                            <input
                                                type="text"
                                                name="name"
                                                value={employee.name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Add Email Field */}
                                    <div className="form-group">
                                        <label>Email Address <span className="required">*</span></label>
                                        <div className="input-with-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#64748B" />
                                            </svg>
                                            <input
                                                type="email"
                                                name="email"
                                                value={employee.email}
                                                onChange={handleInputChange}
                                                placeholder="john.doe@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Professional Introduction <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM7 7H9V9H7V7ZM7 11H9V13H7V11ZM7 15H9V17H7V15ZM17 17H11V15H17V17ZM17 13H11V11H17V13ZM17 9H11V7H17V9Z" fill="#64748B" />
                                        </svg>
                                        <textarea
                                            name="intro"
                                            value={employee.intro}
                                            onChange={handleInputChange}
                                            placeholder="A brief professional introduction highlighting key skills and experience..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Years of Experience <span className="required">*</span></label>
                                        <div className="input-with-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#64748B" />
                                                <path d="M12 6V12L16.14 14.5L17 13.07L13.5 11V6H12Z" fill="#64748B" />
                                            </svg>
                                            <input
                                                type="text"
                                                name="experience"
                                                value={employee.experience}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 5 years"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Area of Expertise <span className="required">*</span></label>
                                        <div className="input-with-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM12 4.47L18 6.7V11.09C18 15.28 15.33 19.29 12 20.55C8.67 19.29 6 15.28 6 11.09V6.7L12 4.47Z" fill="#64748B" />
                                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#64748B" />
                                            </svg>
                                            <input
                                                type="text"
                                                name="expertise"
                                                value={employee.expertise}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Technical Recruitment"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Hiring Date <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM19 7H5V6H19V7Z" fill="#64748B" />
                                        </svg>
                                        <input
                                            type="date"
                                            name="hiringDate"
                                            value={employee.hiringDate || ""}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 3H20C21.1 3 22 3.9 22 5V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 3 3 4 3H7C7 1.34 8.34 0 10 0C11.66 0 13 1.34 13 3H17ZM10 2C9.45 2 9 2.45 9 3C9 3.55 9.45 4 10 4C10.55 4 11 3.55 11 3C11 2.45 10.55 2 10 2Z" fill="#2A2D7C" />
                                </svg>
                            </div>
                            <h2>Niche Assignment</h2>
                        </div>

                        <div className="form-group">
                            <label>Select Primary Niche <span className="required">*</span></label>
                            <div className="niche-select-container">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 3H20C21.1 3 22 3.9 22 5V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 3 3 4 3H7C7 1.34 8.34 0 10 0C11.66 0 13 1.34 13 3H17ZM10 2C9.45 2 9 2.45 9 3C9 3.55 9.45 4 10 4C10.55 4 11 3.55 11 3C11 2.45 10.55 2 10 2Z" fill="#64748B" />
                                </svg>
                                <select
                                    value={selectedNiche}
                                    onChange={(e) => setSelectedNiche(e.target.value)}
                                    required
                                >
                                    <option value="">Select a niche category</option>
                                    {niches.map(niche => (
                                        <option key={niche.id} value={niche.id}>{niche.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* T-Key Color Section */}
                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.5 12C17.5 14.21 16.54 16.22 15 17.66L16.5 19.23C18.47 17.45 19.5 14.76 19.5 12C19.5 9.24 18.47 6.55 16.5 4.77L15 6.34C16.54 7.78 17.5 9.79 17.5 12Z" fill="#2A2D7C" />
                                    <path d="M12 7.5C13.93 7.5 15.5 9.07 15.5 11H17.5C17.5 7.97 15.03 5.5 12 5.5V7.5Z" fill="#2A2D7C" />
                                    <path d="M6.5 12C6.5 9.07 8.07 7.5 10 7.5V5.5C6.97 5.5 4.5 7.97 4.5 11H6.5Z" fill="#2A2D7C" />
                                    <path d="M10 16.5C8.07 16.5 6.5 14.93 6.5 13H4.5C4.5 16.03 6.97 18.5 10 18.5V16.5Z" fill="#2A2D7C" />
                                    <path d="M12 16.5C10.07 16.5 8.5 14.93 8.5 13H6.5C6.5 16.03 8.97 18.5 12 18.5V16.5Z" fill="#2A2D7C" />
                                </svg>
                            </div>
                            <h2>T-Key Assignment</h2>
                        </div>

                        <div className="form-group">
                            <label>Select T-Key Color</label>
                            <div className="modern-color-grid">
                                {tKeyColors.map(color => (
                                    <div
                                        key={color.id}
                                        className={`color-option-card ${employee.tKeyColor === color.id ? 'selected' : ''}`}
                                        onClick={() => setEmployee({ ...employee, tKeyColor: color.id })}
                                    >
                                        <div
                                            className="color-swatch"
                                            style={{ backgroundColor: color.id }}
                                        >
                                            {employee.tKeyColor === color.id && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="color-label">{color.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 10.5V7C17 5.9 16.1 5 15 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H15C16.1 19 17 18.1 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="#2A2D7C" />
                                </svg>
                            </div>
                            <h2>Video Links</h2>
                        </div>

                        {/* YouTube Link Input Component */}
                        <YouTubeLinkInput
                            label="Introduction Video (YouTube Link)"
                            name="introductionVideoLink"
                            value={employee.introductionVideoLink}
                            onChange={handleInputChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />

                        <YouTubeLinkInput
                            label="Interview Video (YouTube Link)"
                            name="interviewVideoLink"
                            value={employee.interviewVideoLink}
                            onChange={handleInputChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    {submitError && (
                        <div className="form-error">
                            {submitError}
                        </div>
                    )}

                    {/* Updated Documents form card */}
                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#2A2D7C" />
                                    <path d="M16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#2A2D7C" />
                                </svg>
                            </div>
                            <h2>Documents</h2>
                        </div>

                        <div className="form-group">
                            <label>Resume (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handlePdfUpload(e, "resume")}
                            />
                            {employee.resumeFileName && (
                                <p className="file-hint">Uploaded: {employee.resumeFileName}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Assessment Report (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handlePdfUpload(e, "assessment")}
                            />
                            {employee.assessmentFileName && (
                                <p className="file-hint">Uploaded: {employee.assessmentFileName}</p>
                            )}
                        </div>

                    </div>

                    {/* ✅ New section for hidden clients */}
                    <div className="form-card">
                        <div className="card-header">
                            <div className="form-card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M17 3H20C21.1 3 22 3.9 22 5V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 3 3 4 3H7C7 1.34 8.34 0 10 0C11.66 0 13 1.34 13 3H17Z"
                                        fill="#2A2D7C"
                                    />
                                </svg>
                            </div>
                            <h2>Client Visibility</h2>
                        </div>

                        <p className="visibility-description">Select clients this employee should be hidden from:</p>

                        {/* Modern search container */}
                        <div className="modern-search-container">
                            <div className="search-input-wrapper">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="search-icon">
                                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#64748B" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search clients by name..."
                                    className="modern-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={() => setSearchTerm('')}
                                        aria-label="Clear search"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#64748B" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Selection controls */}
                        <div className="selection-controls">
                            <div className="selection-info">
                                <span className="selected-count">
                                    {employee.hiddenFromClients.length} of {clients.length} selected
                                </span>
                                <span className="filtered-count">
                                    {filteredClients.length} matches
                                </span>
                            </div>

                            <div className="selection-buttons">
                                <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={() => {
                                        if (employee.hiddenFromClients.length === filteredClients.length) {
                                            // Deselect all visible
                                            const remainingSelections = employee.hiddenFromClients.filter(
                                                id => !filteredClients.some(client => client.id === id)
                                            );
                                            setEmployee({ ...employee, hiddenFromClients: remainingSelections });
                                        } else {
                                            // Select all visible
                                            const newSelections = [...new Set([
                                                ...employee.hiddenFromClients,
                                                ...filteredClients.map(c => c.id)
                                            ])];
                                            setEmployee({ ...employee, hiddenFromClients: newSelections });
                                        }
                                    }}
                                >
                                    {employee.hiddenFromClients.length === filteredClients.length ?
                                        "Deselect Visible" : "Select Visible"}
                                </button>

                                <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={() => {
                                        if (employee.hiddenFromClients.length === clients.length) {
                                            setEmployee({ ...employee, hiddenFromClients: [] });
                                        } else {
                                            setEmployee({
                                                ...employee,
                                                hiddenFromClients: clients.map((c) => c.id),
                                            });
                                        }
                                    }}
                                >
                                    {employee.hiddenFromClients.length === clients.length ?
                                        "Deselect All" : "Select All"}
                                </button>
                            </div>
                        </div>

                        {/* Clients list */}
                        <div className="modern-checkbox-list">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <div key={client.id} className="modern-checkbox-item">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={client.id}
                                                checked={employee.hiddenFromClients.includes(client.id)}
                                                onChange={(e) => {
                                                    let updated = [...employee.hiddenFromClients];
                                                    if (e.target.checked) {
                                                        updated.push(client.id);
                                                    } else {
                                                        updated = updated.filter((id) => id !== client.id);
                                                    }
                                                    setEmployee({ ...employee, hiddenFromClients: updated });
                                                }}
                                            />
                                            <span className="custom-checkbox"></span>
                                            <span className="client-name">{client.name}</span>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results-message">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#CBD5E1" />
                                        <path d="M12 7C11.45 7 11 7.45 11 8V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V8C13 7.45 12.55 7 12 7ZM11 15H13V17H11V15Z" fill="#CBD5E1" />
                                    </svg>
                                    <p>No clients found matching "{searchTerm}"</p>
                                    <button
                                        className="clear-search-text-btn"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/admin-dashboard')}
                            disabled={isSubmitting}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="submit-add-employee"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                'Uploading...'
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3Z" fill="white" />
                                        <path d="M12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19Z" fill="#2A2D7C" />
                                        <path d="M12 16C12.552 16 13 15.552 13 15C13 14.448 12.552 14 12 14C11.448 14 11 14.448 11 15C11 15.552 11.448 16 12 16Z" fill="#2A2D7C" />
                                    </svg>
                                    Complete Onboarding
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {showCropper && selectedImage && (
                    <ImageCropperModal
                        imageSrc={selectedImage}
                        onCancel={() => setShowCropper(false)}
                        onSave={(croppedImage) => {
                            setEmployee({ ...employee, image: croppedImage });
                            setShowCropper(false);
                        }}
                    />
                )}

                {/* ✅ Visibility Selection Modal */}
                {showVisibilityModal && (
                    <div className="modal-overlay">
                        <div className="visibility-modal">
                            <div className="modal-header">
                                <h3>Select Visibility</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowVisibilityModal(false)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#64748B" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-content">
                                <p>Who should be able to see this employee profile?</p>

                                <div className="visibility-options">
                                    <label className="visibility-option">
                                        <input
                                            type="radio"
                                            value="admin_client"
                                            checked={selectedVisibility === 'admin_client'}
                                            onChange={(e) => setSelectedVisibility(e.target.value)}
                                        />
                                        <div className="option-card">
                                            <div className="option-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#3B82F6" />
                                                </svg>
                                            </div>
                                            <div className="option-content">
                                                <h4>Admin & Client</h4>
                                                <p>Visible to both admin and clients</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="visibility-option">
                                        <input
                                            type="radio"
                                            value="admin"
                                            checked={selectedVisibility === 'admin'}
                                            onChange={(e) => setSelectedVisibility(e.target.value)}
                                        />
                                        <div className="option-card">
                                            <div className="option-icon">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7H9V5.5L3 7V9L9 10.5V12H15V10.5L21 9Z" fill="#10B981" />
                                                </svg>
                                            </div>
                                            <div className="option-content">
                                                <h4>Admin Only</h4>
                                                <p>Visible to admin only (hidden from clients)</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="visibility-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowVisibilityModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="onboarding-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm Onboarding'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add this section to show upload status */}
                {uploadStatus && (
                    <div className="upload-status">
                        <div className="status-message">{uploadStatus}</div>
                        {uploadProgress > 0 && (
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEmployee;