
export const getRedirectPath = (userType: string): string => {
  switch (userType) {
    case "DOCTOR":
      return "/dashboard";
    case "STAFF":
      return "/staff";
    case "RECEPTIONIST":
      return "/receptionist";
    case "ADMIN":
      return "/admin/adminHomeDashboard";
    case "USER":
    default:
      return "/";
  }
};
