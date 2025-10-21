
export const getRedirectPath = (userType: string): string => {
  switch (userType) {
    case "DOCTOR":
      return "/dashboard";  
    case "RECEPTIONIST":
      return "/receptionist";
    case "STAFF":
      return "/admin/adminHomeDashboard";
    case "USER":
    default:
      return "/";
  }
};
