import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SEASProcessFlow from "../../pages/HowWeWork/components/SEASProcessFlow";
import "./ServiceDetails.css";
import ServiceTasks from "../ServiceTasks/ServiceTasks";

const ServiceDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { service } = state || {};

    // Scroll to top when service changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [service]);

    if (!service) {
        navigate('/services');
        return null;
    }

    return (
        <div className="service-detail-page">
            <h2 className="service-title">
                {service.displayTitle || service.title || service.name || service.parent?.title}
                {" "}
                {["medical", "dental", "insurance", "legal"].includes(service.id)
                    ? " VA's"
                    : service.title?.toLowerCase() !== "managed services" && " Professionals"}
            </h2>
            <p>{service.details?.description}</p>

            <SEASProcessFlow type={service.id} />
            {/* Conditional Sections */}
            {service.id === "insurance" && <ServiceTasks type="insurance" />}
            {service.id === "medical" && <ServiceTasks type="medical" />}
            {service.id === "dental" && <ServiceTasks type="dental" />}
            {service.id === "legal" && <ServiceTasks type="legal" />}
            <p>{service.details?.hiringProcess}</p>

            <div className="action-buttons-container">
                <button
                    className="consultation-button"
                    onClick={() => {
                        window.scrollTo(0, 0); // scroll to top
                        navigate("/schedule-appointment");
                    }}
                >
                    {service.title?.toLowerCase() === "sales & marketing"
                        ? "Find Your Next Best Hire"
                        : "Book Yourself a Free Consultation"}
                </button>

                <button
                    className="back-button"
                    onClick={() => {
                        window.scrollTo(0, 0); // Scroll to top before navigating
                        navigate('/services');
                    }}
                >
                    Back to Services
                </button>
            </div>
        </div>
    );
};

export default ServiceDetails;