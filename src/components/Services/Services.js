import React from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css";

const Services = () => {
    const navigate = useNavigate();

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
                description: "Our sales and marketing team consist of outbound and inbound telemarketers, sales executives and account executives. Focusing on both B2B and B2C expertise.",
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
            title: "Virtual Professionals",
            displayTitle: "Virtual",
            icon: "👥",
            desc: "Skilled remote support for your business needs.",
            details: {
                description: "Our Virtual Professionals can take on a number of back office tasks for our clients including data entry, CRM logins, customer support, front desk staff, back-office support, calendar management, billings, verification, note taking, and assistance to Executives. Our virtual professionals maintain data security whilst performing their job as per their contract.",
                // hiringProcess: "Virtual professionals are tested on time management, communication skills, and technical proficiency."
            }
        },
        {
            id: 'it-telecom',
            title: "IT & Telecom",
            icon: "💻",
            desc: "Technical experts for your digital infrastructure.",
            details: {
                description: "We provide back end/front-end software engineers, voice engineers, application developers, cyber security specialists as well as technical support professionals to our clients.",
                // hiringProcess: "IT candidates complete coding challenges and infrastructure troubleshooting scenarios."
            }
        },
        {
            id: 'managed-services',
            title: "Managed Services",
            icon: "🛠️",
            desc: "Reliable managed service professionals to support your business operations.",
            details: {
                description: "We specialize in development of both simple and state of the art websites. Our expertise lay further in visualization and development of web portals, applications and software.",
            }
        }
    ];

    const handleExploreClick = (service) => {
        navigate(`/services/${service.id}`, { state: { service } });
    };

    return (
        <section className="services-section">
            <div className="services-container">
                <div className="title-container">
                    <h2 className="business-title">Businesses We Serve</h2>
                    <div className="title-divider">
                        <span className="divider-line"></span>
                        <span className="divider-slash">/</span>
                        <span className="divider-line"></span>
                    </div>
                    <h2 className="professionals-title">Professionals We Provide</h2>
                </div>

                <div className="services-grid">
                    {services.slice(0, 3).map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onExploreClick={() => handleExploreClick(service)}
                        />
                    ))}
                </div>
                <div className="services-grid second-row">
                    {services.slice(3, 6).map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onExploreClick={() => handleExploreClick(service)}
                            isSpecial={service.id === 'it-telecom'}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const ServiceCard = ({ service, onExploreClick, isSpecial }) => (
    <div className={`service-card ${isSpecial ? "special-card" : ""}`}>
        <div className="card-icon">{service.icon}</div>
        <div className="card-content">
            <h3>{service.title}</h3>
            {/* <p className="card-desc">{service.desc}</p> */}
            <div className="card-hover-content">
                <button
                    className="card-cta"
                    onClick={onExploreClick}
                >
                    Explore Solutions
                </button>
            </div>
        </div>
    </div>
);

export default Services;