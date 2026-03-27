export const STAFF_ROLES = [
    "SCRUB_NURSE", "CIRCULATING_NURSE", "ANESTHESIA_NURSE",
    "SURGICAL_TECH", "ANESTHESIA_TECHNICIAN", "OT_TECHNICIAN",
    "ANESTHESIOLOGIST", "ORDERLY", "OT_ASSISTANT"
];

export const SURGEON_ROLES = [
    "PRIMARY_SURGEON", "LEAD_SURGEON", "ASSISTANT_SURGEON", "CO_SURGEON",
    "CONSULTANT", "RESIDENT", "FELLOW"
];

export const STAFF_GROUPS = [
    { label: "Nursing Roles", roles: ["SCRUB_NURSE", "CIRCULATING_NURSE", "ANESTHESIA_NURSE"] },
    { label: "Technical Roles", roles: ["SURGICAL_TECH", "ANESTHESIA_TECHNICIAN", "OT_TECHNICIAN"] },
    { label: "Anesthesia Doctors", roles: ["ANESTHESIOLOGIST"] },
    { label: "Support Staff", roles: ["ORDERLY", "OT_ASSISTANT"] }
];

export const SURGEON_GROUPS = [
    { label: "Main Surgeons", roles: ["PRIMARY_SURGEON", "LEAD_SURGEON"] },
    { label: "Assistant Surgeons", roles: ["ASSISTANT_SURGEON", "CO_SURGEON"] },
    { label: "Consultants & Residents", roles: ["CONSULTANT", "RESIDENT", "FELLOW"] }
];
