// debug-env.js - Check if secrets are loaded from .env
const normalize = (s) => (typeof s === 'string' ? s.trim().replace(/^"|"$/g, '') : s);
console.log('ACCESS_SECRET length:', normalize(process.env.ACCESS_SECRET)?.length || 'missing');
console.log('REFRESH_SECRET length:', normalize(process.env.REFRESH_SECRET)?.length || 'missing');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
