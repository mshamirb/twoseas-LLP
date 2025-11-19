import React from "react";
import { FaPhoneAlt, FaFileSignature, FaFileInvoice, FaClipboardCheck, FaRedoAlt, FaDatabase } from "react-icons/fa";
import { MdMedicalServices, MdOutlineFollowTheSigns, MdAssignmentTurnedIn, MdVerifiedUser, MdSupportAgent, MdPolicy } from "react-icons/md";
import { GiTooth, GiReceiveMoney, GiHealthNormal } from "react-icons/gi";
import "./ServiceTasks.css";

const ServiceTasks = ({ type }) => {
  const tasks = {
    insurance: [
      { icon: <FaPhoneAlt />, title: "Customer Calls", desc: "Receive customer calls; make outbound calls. Answer queries related to billing, coverage, and payments." },
      { icon: <MdPolicy />, title: "Perform Policy Evaluation", desc: "Assist in evaluation of policy details and suggest adjustments." },
      { icon: <FaFileSignature />, title: "Review Applications", desc: "Process and complete applications for timely approvals." },
      { icon: <FaClipboardCheck />, title: "Generate Quotes", desc: "Generate and provide accurate quotes." },
      { icon: <FaRedoAlt />, title: "Renewal Process Support and Follow Ups", desc: "Assist in managing policy renewals and updates for continuous coverage." },
      { icon: <FaDatabase />, title: "Data Entry Reporting", desc: "Accurately enter and edit data in company CRM as it comes and goes." },
    ],

    medical: [
      { icon: <FaFileInvoice />, title: "Billing", desc: "Manage billing and assign codes to patient diagnosis." },
      { icon: <FaDatabase />, title: "Data Entry", desc: "Record and update patient data in CRM; post payments from insurance companies and patients." },
      { icon: <MdOutlineFollowTheSigns />, title: "Follow Ups", desc: "Track payments and resolve denied claims." },
      { icon: <MdVerifiedUser />, title: "Insurance Verification", desc: "Coordinate with insurance companies for verification and identification of patient coverage." },
      { icon: <MdSupportAgent />, title: "Customer Service Support", desc: "Attend phone calls, answer customer queries, and assist with billing and payments." },
      { icon: <MdMedicalServices />, title: "Compliance Overseeing", desc: "Ensure billing practices comply with HIPAA guidelines." },
    ],

    dental: [
      { icon: <GiTooth />, title: "Administration Tasks", desc: "Update/edit records in CRM, maintain patient notes, and handle back-office tasks." },
      { icon: <MdVerifiedUser />, title: "Insurance Verification", desc: "Coordinate with insurance companies for verification of patients' coverage." },
      { icon: <FaPhoneAlt />, title: "Communication with Customers and Staff", desc: "Handle calls, answer queries, and guide patients through their coverage and policies." },
      { icon: <FaDatabase />, title: "Data Entry and Payments", desc: "Record customer information and attach payment documents from insurance and patients." },
      { icon: <GiReceiveMoney />, title: "Claims Management", desc: "Assist with or assign ADA’s CDT codes." },
      { icon: <GiHealthNormal />, title: "Follow Ups", desc: "Follow up with clients for payments/visits and guide them through medication processes." },
    ],

     legal: [
      {
        icon: <MdAssignmentTurnedIn />,
        title: "Administration",
        desc: "Writing and compiling documents, preparing legal drafts, and filling out forms."
      },
      {
        icon: <FaPhoneAlt />,
        title: "Client Support",
        desc: "Receive and make calls to clients, reach out for follow-ups, convey and receive information."
      },
      {
        icon: <MdOutlineFollowTheSigns />,
        title: "Calendar Management",
        desc: "Manage your calendar and your staff’s schedule for meetings and appointments."
      }
    ],
  };

  const currentTasks = tasks[type];
  if (!currentTasks) return null;

  return (
    <div className="service-tasks-section">
      <h3 className="tasks-title">
        {type === "insurance" && "Our Insurance VA’s Can Perform"}
        {type === "medical" && "Our Medical VA’s Can Perform"}
        {type === "dental" && "Our Dental VA’s Can Perform"}
        {type === "legal" && "Our Legal VA’s Can Perform"}
      </h3>

      <div className="tasks-grid">
        {currentTasks.map((task, index) => (
          <div key={index} className="task-card">
            <div className="task-icon">{task.icon}</div>
            <h4>{task.title}</h4>
            <p>{task.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTasks;
