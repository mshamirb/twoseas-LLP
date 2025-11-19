import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaFilter, FaUserFriends, FaDatabase, FaUsers, FaHandshake, FaLightbulb, FaClipboardCheck, FaFileAlt, FaCode } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SEASProcessFlow = ({ type }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [hoveredStep, setHoveredStep] = useState(null);

    let steps = [
        { icon: <FaBullhorn />, label: "Advertising" },
        { icon: <FaFilter />, label: "Candidates are Screened" },
        { icon: <FaUserFriends />, label: "Interview" },
        { icon: <FaDatabase />, label: "Reference Data" },
        { icon: <FaUsers />, label: "Talent Pool" }
    ];

    // Replace with Managed Services steps if applicable
    if (type === "managed-services") {
        steps = [
            { icon: <FaHandshake />, label: "Meeting" },
            { icon: <FaLightbulb />, label: "Suggestions" },
            { icon: <FaClipboardCheck />, label: "Decisions" },
            { icon: <FaFileAlt />, label: "Requirement Sheet" },
            { icon: <FaCode />, label: "Development Starts" }
        ];
    }

    useEffect(() => {
        // Only auto-advance if not hovering on any step
        if (!isHovering) {
            const timer = setInterval(() => {
                setActiveStep(prev => (prev + 1) % steps.length);
            }, 2500);
            return () => clearInterval(timer);
        }
    }, [isHovering, steps.length]);

    const handleStepHover = (index) => {
        setIsHovering(true);
        setHoveredStep(index);
        setActiveStep(index); // Set the active step to the hovered one
    };

    const handleStepLeave = () => {
        setIsHovering(false);
        setHoveredStep(null);
    };

    return (
        <div className="seas-flow-container">
            <div className="flow-header">
                {type === "managed-services" ? (
                    <>
                        <h2>Our Development Process</h2>
                        <p>From idea to execution, every project follows these clear steps.</p>
                    </>
                ) : (
                    <>
                        <h2>We Hire Professionals</h2>
                        <p>With Minimum a Bachelor's Degree & 1-2 Years of Experience</p>
                    </>
                )}
            </div>

            <div className="process-track">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="step-container">
                            <motion.div
                                className="step-icon"
                                animate={{
                                    scale: activeStep === index ? 1.1 : 1,
                                    backgroundColor: activeStep === index ? '#06a3c2' : '#e6f7fa'
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15
                                }}
                                whileHover={{ scale: 1.05 }}
                                onMouseEnter={() => handleStepHover(index)}
                                onMouseLeave={handleStepLeave}
                            >
                                <motion.div
                                    className="icon-wrapper"
                                    animate={{
                                        color: activeStep === index ? 'white' : '#06a3c2'
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {React.cloneElement(step.icon, { size: 28 })}
                                </motion.div>
                            </motion.div>

                            <motion.div
                                className="step-label"
                                animate={{
                                    color: activeStep === index ? '#06a3c2' : '#666',
                                    fontWeight: activeStep === index ? '600' : '400'
                                }}
                                onMouseEnter={() => handleStepHover(index)}
                                onMouseLeave={handleStepLeave}
                            >
                                {step.label}
                            </motion.div>
                        </div>

                        {index < steps.length - 1 && (
                            <motion.div
                                className="connector"
                                animate={{
                                    opacity: activeStep > index ? 1 : 0.3,
                                    backgroundColor: activeStep > index ? '#06a3c2' : '#e6f7fa'
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={isHovering ? `hover-${hoveredStep}` : `auto-${activeStep}`}
                    className="step-description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {getStepDescription(type, isHovering ? hoveredStep : activeStep)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// function getStepDescription(step) {
//     const descriptions = [
//         "Advertising of positions is done on multiple platforms.",
//         "Each candidate undergoes rigorous screening for qualifications.",
//         "Shortlisted candidates complete an interview round.",
//         "We verify background information and references.",
//         "Successful candidates join our exclusive talent pool."
//     ];
//     return descriptions[step];
// }
function getStepDescription(type, step) {
    if (type === "managed-services") {
        const descriptions = [
            "We meet with our clients to identify their requirements.",
            "Our technical team suggests improvements and walks clients through different language structures.",
            "Language, technicalities, and visuals are mutually decided.",
            "A requirement sheet is sought and timeline is decided."
        ];
        return descriptions[step];
    }

    const defaultDescriptions = [
        "Advertising of positions is done on multiple platforms.",
        "Each candidate undergoes rigorous screening for qualifications.",
        "Shortlisted candidates complete an interview round.",
        "We verify background information and references.",
        "Successful candidates join our exclusive talent pool."
    ];
    return defaultDescriptions[step];
}

export default SEASProcessFlow;