import { ROLES } from "../constants/roles";

// Har role ko uske allowed pages/actions map karo
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    canManageUsers: true,
    canManageRoles: true,
    canViewReports: true,
    canBookOT: true,
    canViewAllOT: true,
    canManageStaff: true,
    canViewPatients: true,
  },
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageRoles: false,
    canViewReports: true,
    canBookOT: true,
    canViewAllOT: true,
    canManageStaff: true,
    canViewPatients: true,
  },
  [ROLES.SURGEON]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canBookOT: true,
    canViewAllOT: false,     // sirf apna OT dekhega
    canManageStaff: false,
    canViewPatients: true,
  },
  [ROLES.DOCTOR]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canBookOT: false,
    canViewAllOT: false,
    canManageStaff: false,
    canViewPatients: true,
  },
  [ROLES.NURSE]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canBookOT: false,
    canViewAllOT: true,      // schedule dekhna hoga
    canManageStaff: false,
    canViewPatients: true,
  },
  [ROLES.RECEPTIONIST]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canBookOT: false,
    canViewAllOT: true,
    canManageStaff: false,
    canViewPatients: true,
  },
  [ROLES.STAFF]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canBookOT: false,
    canViewAllOT: true,
    canManageStaff: false,
    canViewPatients: false,
  },
};

// Helper — kisi bhi component mein use karo
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
};