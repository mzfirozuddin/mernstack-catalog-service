import { expressjwt, GetVerificationKey } from "express-jwt";
import config from "config";
import { Request } from "express";
import JwksClient from "jwks-rsa";
import { AuthCookie } from "../types";

// expressjwt return a middleware that we can plug directly in our route
export default expressjwt({
    secret: JwksClient.expressJwtSecret({
        jwksUri: config.get("auth.JWKS_URI"),
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,

    algorithms: ["RS256"],

    getToken(req: Request) {
        //: Get accessToken from authorization header if present
        const authHeader = req.headers.authorization;
        // Bearer zyadjfjjdc$cnknemkmmlzaso
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const token = authHeader.split(" ")[1];
            if (token) {
                return token;
            }
        }

        //: Get accessToken from cookies (because it is not present in authorization header)
        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
