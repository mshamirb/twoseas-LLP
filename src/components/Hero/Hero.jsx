import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                <h2 className="hero-title">
                    Extraordinary talent, skillfully sourced, methodically placed.
                </h2>
                <p className="hero-subtitle">
                    Well practiced in Western approaches and deployable in days, find out how we provide talent at 60% cost saving.
                </p>
                <Link to="/book-call" className="hero-cta">
                    Book a free strategy call
                </Link>
            </div>
        </section>
    );
};

export default Hero;