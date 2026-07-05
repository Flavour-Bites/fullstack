import helmet from 'helmet';

export const securityConfig = helmet({ contentSecurityPolicy: false });
