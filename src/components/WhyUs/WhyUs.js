import React from "react";
import "./WhyUs.css";

const WhyUs = () => {
    return (
        <section className="why-us-section">
            <div className="why-us-container">
                <h2 className="section-title">
                    <span className="title-slash">Why Us?</span>
                </h2>

                {/* Process Flow
                <div className="process-flow">
                    <div className="flow-section">
                        <h3>Needs Assessment</h3>
                        <div className="flow-arrow">→</div>
                        <h3>Rigorous Interviewing</h3>
                        <div className="flow-arrow">→</div>
                        <h3>Finding the Right Fit</h3>
                    </div>
                    <div className="flow-section secondary-flow">
                        <p>Initial Screening</p>
                        <div className="flow-arrow">→</div>
                        <p>Interviews</p>
                        <div className="flow-arrow">→</div>
                        <p>Reference Checking</p>
                    </div>
                </div> */}

                {/* Cards Row */}
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <h3>Interviewed Talent Pool</h3>
                        <p>Pre-Screened, Rigorously vetted, reference checked talent pool. Employees deployable in days.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>Professionals to Oversee Staff</h3>
                        <p>Our Ex-Military Officers deploy quality assurance checks to ensure transparency, availability, and best practices.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>Larger Scale Expansion</h3>
                        <p>We help our clients expand their team over time finding the right talent gradually to ensure corporate level expansion.</p>
                        <p className="card-detail">Performance metrics such as KPI’s are constantly measured and carried through to our clients.</p>
                    </div>

                    <div className="benefit-card">
                        <h3>Your HR Partner</h3>
                        <p>Benefits, support, payroll and compliance are all taken care of by us so you can focus on the core tasks.</p>
                        <p className="business-model">End-to-end HR solutions</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;