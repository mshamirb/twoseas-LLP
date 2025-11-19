import React from 'react';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <Helmet>
        <title>Privacy Policy | Two Seas</title>
        <style>
          {`
            :root {
              --teal: #06a3c2;
              --blue: #2A2D7C;
            }
          `}
        </style>
      </Helmet>

      <div className="container">
        <h1 className="policy-title">Privacy Policy</h1>

        <h2>Introduction</h2>
        <p>
          Two Seas (referred to as "the Company", "We", "Us", or "Our") is committed to safeguarding the privacy and personal data of our clients, candidates, and website users ("You"). This Privacy Policy explains how we collect, use, and share your information when you interact with our advertisements or utilize our services. It also outlines your privacy rights and the protections available under applicable laws.
        </p>
        <p>
          We take our responsibility to protect your information seriously. In line with global privacy standards and legal requirements, we ensure the confidentiality, integrity and secure handling of all personal data entrusted to us.
        </p>

        <h2>Collection and Use of Your Personal Data</h2>
        <h3>Types of Data Collected</h3>
        <p><strong>Personal Data:</strong></p>
        <p>
          In the course of delivering our services or responding to your interest in our opportunities, we may request personal information that is essential for effective communication and service delivery. We only collect the data we genuinely need and retain it only for as long as necessary to fulfill its purpose.
        </p>
        <p>Examples of the data we may collect include:</p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number(s)</li>
          <li>Online identifiers</li>
          <li>Location information (address, city, state, country)</li>
          <li>Professional preferences, requirements, or feedback</li>
        </ul>

        <h3>Purpose of Using Your Personal Data</h3>
        <p>
          As an HR services provider, transparency and trust are central to how we manage your data. We use your personal information for the following reasons:
        </p>
        <ul>
          <li>To provide and continuously improve our services</li>
          <li>To manage user accounts, registrations, and job applications</li>
          <li>To fulfill contractual obligations and service engagements</li>
          <li>To communicate updates, service offerings, or employment opportunities</li>
          <li>To analyze service performance and enhance user experience</li>
          <li>To support business continuity, including legal and compliance obligations</li>
        </ul>

        <h2>Sharing of Your Personal Data</h2>
        <p>
          We only share your information with third parties when necessary and in alignment with your expectations. These include:
        </p>
        <ul>
          <li>Service Providers who assist us in delivering our services or managing communication</li>
          <li>Business Partners for specific offerings aligned with your preferences</li>
          <li>Affiliates within our corporate structure</li>
          <li>Regulatory or Legal Authorities when disclosure is required by law</li>
        </ul>

        <h2>Tracking Tools & Marketing Automation</h2>
        <p>
          When using platforms like HubSpot for lead nurturing or communication, we fully comply with their privacy standards. These tools help us capture and manage data responsibly, ensuring security and clarity throughout the process.
        </p>

        <h2>International Data Transfers</h2>
        <p>
          If your information is transferred outside your country of residence, we will ensure that such transfers meet the required data protection standards. By interacting with our services, you agree to these cross-border data movements, and we take steps to ensure your data remains protected regardless of location.
        </p>

        <h2>Security of Your Information</h2>
        <p>
          Two Seas implements industry-standard practices to secure your data. While no system can guarantee complete protection, we continuously strive to maintain a secure environment for all information entrusted to us.
        </p>

        <h2>Third-Party Websites</h2>
        <p>
          Our website may contain links to other sites. Please note that we are not responsible for the content or privacy practices of any third-party platforms. We encourage you to review their privacy policies before sharing personal data.
        </p>

        <h2>Updates to This Policy</h2>
        <p>
          We may revise this Privacy Policy from time to time. When updates occur, they will be posted on this page. We recommend reviewing it periodically to stay informed about how we protect your information.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we manage your personal data, please contact us at:
        </p>
        <p className="contact-email">📧 <a href="mailto:itdepartment@twoseas.us">it@twoseas.org</a></p>
      </div>

      <style jsx>{`
        .privacy-policy {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 40px 0;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .policy-title {
          color: var(--blue);
          font-size: 2.5rem;
          margin-bottom: 30px;
          text-align: center;
        }
        
        h2 {
          color: var(--blue);
          border-bottom: 2px solid var(--teal);
          padding-bottom: 8px;
          margin: 40px 0 20px;
        }
        
        h3 {
          color: var(--teal);
          margin: 20px 0 10px;
        }
        
        ul {
          padding-left: 20px;
          margin: 15px 0;
        }
        
        li {
          margin-bottom: 8px;
        }
        
        .contact-email {
          font-size: 1.1rem;
          margin-top: 10px;
          color: var(--blue);
        }
        
        a {
          color: var(--teal);
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .policy-title {
            font-size: 2rem;
          }
          
          .container {
            padding: 0 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;