export const FacebookConfiguration = {
    client_id: "1727690964526245",
    response_type: "code",
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI || "http://localhost:3000/oauth2/callback/facebook",
    scope: "openid,public_profile,email",
};