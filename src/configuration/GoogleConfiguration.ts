export const GoogleConfiguration = {
    client_id: process.env.GOOGLE_CLIENT_ID || "1070874704278-nk9uf9p7ekujr32f682rio95lmv0pglt.apps.googleusercontent.com",
    response_type: process.env.GOOGLE_RESPONSE_TYPE || "code",
    scope: process.env.GOOGLE_SCOPE || "email%20profile%20openid",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2/callback/google",
};