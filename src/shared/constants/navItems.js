import { ROLES } from "./roles";

const ALL_STAFF = [
  ROLES.SUPER_ADMIN, 
  ROLES.ADMIN, 
  ROLES.RECEPTIONIST, 
  ROLES.SURGEON, 
  ROLES.ANESTHESIOLOGIST, 
  ROLES.SCRUB_NURSE, 
  ROLES.CIRCULATING_NURSE, 
  ROLES.ANESTHESIA_NURSE, 
  ROLES.OT_TECHNICIAN, 
  ROLES.SURGICAL_TECH, 
  ROLES.ANESTHESIA_TECHNICIAN, 
  ROLES.NURSE, 
  ROLES.STAFF,
  ROLES.DOCTOR
];

const CLINICAL_STAFF = [
    ROLES.SURGEON, 
    ROLES.ANESTHESIOLOGIST, 
    ROLES.SCRUB_NURSE, 
    ROLES.CIRCULATING_NURSE, 
    ROLES.ANESTHESIA_NURSE, 
    ROLES.OT_TECHNICIAN, 
    ROLES.SURGICAL_TECH, 
    ROLES.ANESTHESIA_TECHNICIAN, 
    ROLES.NURSE,
    ROLES.DOCTOR
];

export const NAV_ITEMS = [
  // ─── SHARED / DASHBOARD ───────────────────────────────────
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "fa-solid fa-chart-pie",
    allowedRoles: ALL_STAFF,
  },

  // ─── CLINICAL PANEL (SURGEON, ANESTHESIA, NURSE, TECH) ────
  {
    id: "my-operations",
    label: "My Operations",
    path: "/operations-list",
    icon: "fa-solid fa-notes-medical",
    allowedRoles: CLINICAL_STAFF,
  },

  // ─── SUPER ADMIN ──────────────────────────────────────────
  {
    id: "hospitals",
    label: "Hospitals",
    path: "/hospital-management",
    icon: "fa-solid fa-hospital",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    id: "admins",
    label: "Admins",
    path: "/admin-management",
    icon: "fa-solid fa-user-tie",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    id: "revenue",
    label: "Revenue",
    path: "/revenue",
    icon: "fa-solid fa-chart-line",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: "fa-solid fa-magnifying-glass-chart",
    allowedRoles: [ROLES.SUPER_ADMIN],
  },

  // ─── ADMIN ────────────────────────────────────────────────
  {
    id: "admin-operations",
    label: "Operations registry",
    path: "/operations-list", 
    icon: "fa-solid fa-scalpel",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "ots",
    label: "Theaters",
    path: "/ot-management",
    icon: "fa-solid fa-building",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "all-rooms",
    label: "All Rooms",
    path: "/all-rooms",
    icon: "fa-solid fa-door-open",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "staff",
    label: "Staff",
    path: "/staff-management",
    icon: "fa-solid fa-users",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "catalog",
    label: "OT Catalog",
    path: "/ot-item-catalog",
    icon: "fa-solid fa-list-check",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "equipment",
    label: "Equipment",
    path: "/equipment-management",
    icon: "fa-solid fa-microscope",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "wards",
    label: "Wards",
    path: "/ot-ward",
    icon: "fa-solid fa-hospital-user",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: "fa-solid fa-file-lines",
    allowedRoles: [ROLES.ADMIN],
  },

  // ─── RECEPTIONIST ─────────────────────────────────────────
  {
    id: "ipd",
    label: "Scheduling",
    path: "/operation-management",
    icon: "fa-solid fa-calendar-days",
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
  },
  {
    id: "assigned-ops",
    label: "Staff Assignment",
    path: "/operations-list",
    icon: "fa-solid fa-user-check",
    allowedRoles: [ROLES.RECEPTIONIST],
  },
  {
    id: "rooms-reception",
    label: "Room Registry",
    path: "/room-management",
    icon: "fa-regular fa-calendar",
    allowedRoles: [ROLES.RECEPTIONIST],
  },
];

export const getNavItemsByRole = (role) => {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
};