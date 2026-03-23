export const SUPER_ADMIN_ENDPOINTS = {

  //Hospital Endpoints
  CREATE_HOSPITAL: "/super-admin/hospitals",
  GET_ALL_HOSPITALS: "/super-admin/hospitals",
  GET_HOSPITAL_BY_ID: "/super-admin/hospitals/:id",
  UPDATE_HOSPITAL: "/super-admin/hospitals/:id",

  // Admin Endpoints
  CREATE_ADMIN: "/super-admin/create-admin",
  GET_ADMIN_BY_ID: "/super-admin/admin/:id",
  GET_ALL_ADMINS: "/super-admin/admin-all",
  MAP_ADMIN_HOSPITAL: "/super-admin/map-admin-hospital",
  UPDATE_ADMIN_HOSPITAL: "/super-admin/update-admin-hospital",
  GET_ADMINS_BY_HOSPITAL: "/super-admin/hospital-admins/:hospitalId",
};