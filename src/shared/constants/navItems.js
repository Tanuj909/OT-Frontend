import { ROLES } from "./roles";

export const NAV_ITEMS = [
  // ─── SUPER ADMIN ──────────────────────────────────────────
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "fa-solid fa-chart-pie",
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SURGEON, ROLES.NURSE, ROLES.STAFF],
  },
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
    id: "ipd",
    label: "IPD Requests",
    path: "/operation-management",
    icon: "fa-solid fa-person-walking-arrow-right",
    allowedRoles: [ROLES.ADMIN, ROLES.RECEPTIONIST],
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
    id: "operations",
    label: "Operations",
    path: "/operations-list", 
    icon: "fa-solid fa-scalpel",
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
    id: "schedule",
    label: "Schedule",
    path: "/room-management",
    icon: "fa-regular fa-calendar",
    allowedRoles: [ROLES.RECEPTIONIST],
  },
];

export const getNavItemsByRole = (role) => {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(role));
};