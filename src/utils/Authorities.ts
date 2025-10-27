
export const getRedirectPath = (userType: string): string => {
  switch (userType) {
    case "DOCTOR":
      return "/dashboard";
    case "STAFF":
      return "/admin/adminHomeDashboard";
    case "RECEPTIONIST":
      return "/receptionist";
    case "USER":
    default:
      return "/";
  }
};
