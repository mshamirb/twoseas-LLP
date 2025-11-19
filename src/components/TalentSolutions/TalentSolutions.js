import React from "react";
import "./TalentSolutions.css";
import fbrLogo from "../../assets/FBR-Logo.png";
import secpLogo from "../../assets/SCEP-Logo.png";
import psebLogo from "../../assets/PSEB-Logo.png";
import hipaaLogo from "../../assets/Hipaa Compliant.jpg";
import { Link } from "react-router-dom";

const TalentSolutions = () => {
    const solutionItems = [
        "HR",
        "Benefits and Payroll",
        "Compliance and Data Security",
        "No Upfront fees",
        "On-Ground Support",
        "Top Tier Talent",
        "Employee Well Being Stucture ",
        "Cost Savings"
    ];

    // Split items into rows of 3, then handle the remaining items
    const rows = [];
    for (let i = 0; i < solutionItems.length; i += 3) {
        rows.push(solutionItems.slice(i, i + 3));
    }

    return (
        <section className="talent-solutions">
            <div className="solutions-container">
                <div className="title-wrapper">
                    <h2 className="section-title">
                        <span className="title-line-1">College Educated,</span>
                        <span className="title-line-2">Adaptable, Smart and Witty Talent</span>
                    </h2>
                    <div className="all-in-one-badge">
                        ALL IN ONE SOLUTION!
                    </div>
                </div>

                <div className="solutions-content">
                    {rows.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`solution-row ${row.length === 1 ? 'single-item' :
                                    row.length === 2 ? 'double-items' : ''
                                }`}
                        >
                            {row.map((item, index) => (
                                <div key={index} className="solution-item">
                                    <span className="solution-number">{rowIndex * 3 + index + 1}</span>
                                    <span className="solution-text">{item}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="compliance-section">
                <div className="compliance-logos">
                    {[fbrLogo, secpLogo, psebLogo, hipaaLogo].map((logo, index) => (
                        <div key={index} className="logo-item">
                            <img src={logo} alt={["FBR", "SECP", "PSEB", "HIPAA"][index]} />
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link to="/how-we-work" className="how-we-work-button">
                        How We Work
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TalentSolutions;