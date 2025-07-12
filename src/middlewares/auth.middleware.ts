import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

const {
  KEYCLOAK_URL = 'https://<your-keycloak-domain>',
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
} = process.env;

if (!KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID || !KEYCLOAK_CLIENT_SECRET) {
  throw new Error('Keycloak environment variables are not properly set');
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
      new URLSearchParams({
        token: token ?? '',
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const tokenInfo = response.data;

    if (!tokenInfo.active) {
      res.status(403).json({ error: 'Token is inactive or expired' });
    }

    // Attach user info to request
    (req as any).user = {
      id: tokenInfo.sub,
      email: tokenInfo.email,
      username: tokenInfo.preferred_username,
      roles: tokenInfo.realm_access?.roles || [],
      raw: tokenInfo, // optional: whole token info
    };

    next();
  } catch (error: any) {
    console.error('Keycloak token validation failed:', error.message);
    res.status(500).json({ error: 'Failed to validate access token' });
  }
};
