const isProduction = process.env.NODE_ENV === 'production';

export const requireEnv = (name: string) => {
  const value = process.env[name];

  if (!value && isProduction) {
    throw new Error(`Nedostaje produkcijska env varijabla: ${name}`);
  }

  return value;
};

export const jwtSecret = () => {
  const value = requireEnv('JWT_SECRET') || 'dev-secret-change-me';

  if (isProduction && value === 'dev-secret-change-me') {
    throw new Error('JWT_SECRET mora biti postavljen na produkciji.');
  }

  return value;
};
