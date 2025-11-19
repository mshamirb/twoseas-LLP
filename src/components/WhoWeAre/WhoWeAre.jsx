import React from "react";
import "./WhoWeAre.css";
import whoWeAreImage from "../../assets/who-we-are2.jpeg";
import { Link } from 'react-router-dom';

const WhoWeAre = () => {
    return (
        <section className="who-we-are">
            <div className="who-we-are-container">
                {/* Left Image */}
                <div className="who-we-are-image">
                    <img src={whoWeAreImage} alt="Video Call Meeting" />
                </div>

                {/* Right Text Content */}
                <div className="who-we-are-text">
                    <h2 className="who-we-are-title">Who we are</h2>
                    <p className="who-we-are-highlight">
                        A team of <span>retired military officers</span> led by Alumnus of Western Academia
                    </p>
                    <p className="who-we-are-description">
                        We strive to provide <span>relevant talent</span>, the right strategy, and the necessary
                        on-ground support to ensure offshoring success.
                    </p>
                    <p className="who-we-are-description">
                        We emphasize transparency and best practices at our end by utilizing tools to monitor and motivate our workforce.
                    </p>
                    <Link to="/schedule-appointment" className="who-we-are-button">
                        Book a Demo
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default WhoWeAre;