import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from "../../assets/Two Seas Logo.png";

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const services = [
        {
            id: 'insurance',
            title: "Insurance",
            icon: "☂️",
            desc: "Expert insurance professionals for all your coverage needs.",
            details: {
                description: "We provide a wide array of experienced workforce and fresh graduates wanting to work in the niche of Insurance. Our reps are pre-vetted, interviewed, and reference checked through the two seas 5 step method. ",
            }
        },
        {
            id: 'sales-marketing',
            title: "Sales & Marketing",
            icon: "📈",
            desc: "Revenue-driving professionals for your growth needs.",
            details: {
                description: "Our sales and marketing team consist of outbound and inbound telemarketers, sales executives and account executives, as well as social media managers.",
                hiringProcess: "Candidates undergo practical sales simulations and marketing strategy assessments."
            }
        },
        {
            id: 'accounting-finance',
            title: "Accounting & Finance",
            icon: "💰",
            desc: "Financial experts to manage your fiscal operations.",
            details: {
                description: "We help accounting firms find top 1% accounting talent to function as their offshore arm. Our accountants specialize in audits, financial statements, bookkeeping, taxation, and spreadsheets. They are majorly proficient accounting software, Microsoft 365, and the English language.",
                hiringProcess: ""
            }
        },
        {
            id: 'virtual-professionals',
            title: "Virtual Assistants",
            displayTitle: "Virtual",
            icon: "👥",
            desc: "Skilled remote support for your business needs.",
            subMenu: [
                { name: "Medical", id: "medical" },
                { name: "Dental", id: "dental" },
                { name: "Insurance", id: "insurance" },
                { name: "Legal", id: "legal" },
            ],
            details: {
                description:
                    "Our Virtual Professionals can take on a number of back office tasks for our clients including data entry, CRM logins, customer support, front desk staff, back-office support, calendar management, billings, verification, note taking, and assistance to Executives. Our virtual professionals maintain data security whilst performing their job as per their contract.",
            },
        },
        {
            id: 'virtual-professionals',
            title: "Virtual Professionals",
            displayTitle: "Virtual",
            icon: "👥",
            desc: "Skilled remote support for your business needs.",
            details: {
                description:
                    "Our Virtual Professionals can take on a number of back office tasks for our clients including data entry, CRM logins, customer support, front desk staff, back-office support, calendar management, billings, verification, note taking, and assistance to Executives. Our virtual professionals maintain data security whilst performing their job as per their contract.",
            },
        },
        {
            id: 'it-telecom',
            title: "IT & Telecom",
            icon: "💻",
            desc: "Technical experts for your digital infrastructure.",
            details: {
                description: "We provide back end/front-end software engineers, voice engineers, application developers, cyber security specialists as well as technical support professionals to our clients on demand.",
                // hiringProcess: "IT candidates complete coding challenges and infrastructure troubleshooting scenarios."
            }
        }
    ];

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            // If already on home page, scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // If not on home page, navigate to home
            navigate('/');
        }
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const handleServiceClick = (service) => {
        // If sub-service like medical/dental/legal
        if (service.parent) {
            navigate(`/services/${service.id}`, {
                state: { service: { ...service, parent: service.parent } },
            });
        } else {
            navigate(`/services/${service.id}`, { state: { service } });
        }

        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="logo-wrapper" onClick={handleLogoClick}>
                    <img src={logo} alt="Two Seas Logo" className="nav-logo" />
                </div>

                <button
                    className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'white-text' : ''}`}
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            window.scrollTo(0, 0);
                        }}
                    >
                        Home
                    </Link>

                    <div
                        className="nav-link dropdown-trigger"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className={`${location.pathname.startsWith('/services') ? 'white-text' : ''}`}>
                            Our Professionals
                        </span>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {services.map(service => (
                                    <div key={service.id} className="dropdown-item-wrapper">
                                        <div
                                            className={`dropdown-item ${isActive(`/services/${service.id}`) ? 'black-text' : ''}`}
                                            onClick={() => handleServiceClick(service)}
                                        >
                                            {service.title}
                                        </div>

                                        {service.id === 'virtual-professionals' && service.subMenu && (
                                            <div className="sub-dropdown">
                                                {service.subMenu.map((sub, index) => (
                                                    <div
                                                        key={index}
                                                        className="sub-dropdown-item"
                                                        onClick={() => handleServiceClick({ ...sub, parent: service })}
                                                    >
                                                        {sub.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        to="/how-we-work"
                        className={`nav-link ${isActive('/how-we-work') ? 'white-text' : ''}`}
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            window.scrollTo(0, 0);
                        }}
                    >
                        How We Work
                    </Link>

                    <Link
                        to="/contact-us"
                        className={`nav-link ${isActive('/contact-us') ? 'white-text' : ''}`}
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            window.scrollTo(0, 0);
                        }}
                    >
                        Contact Us
                    </Link>

                    <Link
                        to="/careers"
                        className={`nav-link careers-link ${isActive('/careers') ? 'white-text' : ''}`}
                        onClick={() => {
                            // Close mobile menu
                            setIsMobileMenuOpen(false);

                            // Scroll to top
                            window.scrollTo(0, 0);

                            // Dispatch custom event to notify Careers component
                            window.dispatchEvent(new CustomEvent('careersLinkClicked'));
                        }}
                    >
                        Careers
                    </Link>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;