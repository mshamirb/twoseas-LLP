import { niches } from '../../pages/AdminDashboard/constants';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';
import logo from '../../assets/Two Seas Logo.png';
import CalendarScheduler from '../../components/CalendarScheduler';
import emailjs from 'emailjs-com';

const Contact = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        companyWebsite: '',
        niche: '',
        phone: '',
        email: '',
        message: ''
    });

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     emailjs.send(
    //         'service_wjrb0qk',
    //         'template_4jdr7t9',
    //         {
    //             name: formData.name,
    //             companyName: formData.companyName,
    //             companyWebsite: formData.companyWebsite,
    //             niche: formData.niche,
    //             phone: formData.phone,
    //             email: formData.email,
    //             message: formData.message,
    //             time: new Date().toLocaleString()
    //         },
    //         'vkVckeGL1JQx-x4_q'
    //     )
    //         .then((result) => {
    //             console.log('Email sent successfully!', result.text);
    //             alert('Thank you for your message! We will get back to you shortly.');
    //             setFormData({
    //                 name: '',
    //                 companyName: '',
    //                 companyWebsite: '',
    //                 niche: '',
    //                 phone: '',
    //                 email: '',
    //                 message: ''
    //             });
    //         })
    //         .catch((error) => {
    //             console.error('Error sending email:', error.text);
    //             alert('Something went wrong. Please try again later.');
    //         });
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Build the payload to send to sendMail.php
            const emailPayload = new URLSearchParams({
                formType: "Contact Us Form",
                name: formData.name,
                companyName: formData.companyName,
                companyWebsite: formData.companyWebsite,
                niche: formData.niche,
                phone: formData.phone,
                email: formData.email,
                message: formData.message,
                time: new Date().toLocaleString()
            });

            // Send the POST request to Hostinger PHP
            const response = await fetch("https://twoseas.org/sendMail.php", {
                method: "POST",
                body: emailPayload,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            const result = await response.json();

            if (result.status === "success") {
                console.log("Email sent successfully!");
                alert("Thank you for your message! We will get back to you shortly.");
                // Reset form
                setFormData({
                    name: "",
                    companyName: "",
                    companyWebsite: "",
                    niche: "",
                    phone: "",
                    email: "",
                    message: ""
                });
            } else {
                console.warn("Email failed:", result.message);
                alert("Something went wrong. Please try again later.");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Something went wrong. Please try again later.");
        }
    };


    const handleScheduleSubmit = async (appointmentData) => {
        try {
            const fullData = {
                ...appointmentData,
                contactInfo: {
                    name: formData.name,
                    companyName: formData.companyName,
                    companyWebsite: formData.companyWebsite,
                    niche: formData.niche,
                    email: formData.email,
                    phone: formData.phone
                }
            };

            console.log("Scheduling data:", fullData);
            return false;
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            throw error;
        }
    };

    return (
        <div className="contact-page-wrapper">
            <div className="contact-header">
                <div className="logo-container" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <img
                        src={logo}
                        alt="Two Seas LLP Logo"
                        className="contact-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/100?text=Logo";
                        }}
                    />
                </div>
                <h1 className="contact-title">
                    <span className="title-blue">Reach</span>
                    <span className="title-teal"> Us Out</span>
                </h1>
            </div>

            <div className="contact-content-grid">
                <div className="calendly-section">
                    <h2 className="section-title-alt">Schedule Your Call</h2>
                    <p className="section-subtitle-alt">
                        Your path to building/scaling a thriving business begins here.
                    </p>
                    <CalendarScheduler
                        onScheduleSubmit={handleScheduleSubmit}
                        submitButtonText="Confirm Appointment"
                        successMessage="We'll contact you shortly to confirm your appointment time."
                    />
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">Fill in the Form Below and our Team will be in Touch!</h2>
                    <div className="contact-card">
                        <div className="input-grid">
                            {/* Row 1: Name + Email */}
                            <div className="input-pair">
                                <div className="input-container">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="contact-input"
                                        required
                                    />
                                </div>
                                <div className="input-container">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="contact-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Phone + Company Name */}
                            <div className="input-pair">
                                <div className="input-container">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="contact-input"
                                    />
                                </div>
                                <div className="input-container">
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Company Name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="contact-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3: Company Website + Niche */}
                            <div className="input-pair">
                                <div className="input-container">
                                    <input
                                        type="url"
                                        name="companyWebsite"
                                        placeholder="Company Website"
                                        value={formData.companyWebsite}
                                        onChange={handleChange}
                                        className="contact-input"
                                    />
                                </div>
                                <div className="input-container">
                                    <select
                                        name="niche"
                                        value={formData.niche}
                                        onChange={handleChange}
                                        className="contact-input"
                                        required
                                    >
                                        <option value="">Select Niche of Hiring</option>
                                        {niches.map((n) => (
                                            <option key={n.id} value={n.name}>
                                                {n.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="contact-card">
                        <h2 className="section-title">Message / Query</h2>
                        <textarea
                            name="message"
                            placeholder="Type your message here..."
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            className="contact-textarea"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Send Message <span className="btn-wave">→</span>
                    </button>

                    <div className="contact-options-single">
                        <div className="contact-method">
                            <div className="method-icon blue-bg">✉️</div>
                            <h3>Email</h3>
                            <p className="highlight-blue">contact@twoseas.org</p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Contact;
