
export const getRedirectPath = (userType: string): string => {
  switch (userType) {  
    case "STAFF":
      return "/admin/adminHomeDashboard";
    case "ADMIN":
      return "/admin/adminHomeDashboard";
    case "USER":
    default:
      return "/";
  }
};
