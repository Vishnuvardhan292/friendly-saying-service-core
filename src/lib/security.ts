// Security utility functions

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests = 10, windowMs = 60000): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
};

// Content Security Policy headers
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://*.supabase.co; " +
    "font-src 'self';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
});

// Input sanitization for displaying user content
export const sanitizeForDisplay = (content: string): string => {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Error message sanitization (don't expose sensitive information)
export const sanitizeErrorMessage = (error: any): string => {
  // Don't expose internal error details to users
  if (typeof error === 'string') {
    return error.includes('duplicate key') ? 'This record already exists' :
           error.includes('foreign key') ? 'Invalid reference data' :
           error.includes('check constraint') ? 'Invalid data format' :
           'An error occurred while processing your request';
  }
  
  return 'An unexpected error occurred';
};

// SQL injection prevention check (basic)
export const containsSqlInjection = (input: string): boolean => {
  const sqlKeywords = [
    'union', 'select', 'insert', 'update', 'delete', 'drop', 'create', 
    'alter', 'exec', 'execute', 'script', 'javascript:', 'vbscript:'
  ];
  
  const lowerInput = input.toLowerCase();
  return sqlKeywords.some(keyword => lowerInput.includes(keyword));
};

// XSS prevention check
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};