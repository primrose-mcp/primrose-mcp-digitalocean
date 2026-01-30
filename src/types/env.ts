/**
 * Environment Bindings for DigitalOcean MCP Server
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials
 * are passed via request headers, NOT stored in wrangler secrets.
 *
 * Request Headers:
 * - X-DigitalOcean-Token: API token for DigitalOcean authentication
 * - X-DigitalOcean-Base-URL: (Optional) Override the default API base URL
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** API Token for DigitalOcean authentication (from X-DigitalOcean-Token header) */
  token: string;

  /** Override API base URL (from X-DigitalOcean-Base-URL header) */
  baseUrl?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    token: headers.get('X-DigitalOcean-Token') || '',
    baseUrl: headers.get('X-DigitalOcean-Base-URL') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.token) {
    throw new Error('Missing credentials. Provide X-DigitalOcean-Token header.');
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  /** KV namespace (optional) */
  KV?: KVNamespace;

  /** Durable Object namespace (optional) */
  MCP_SESSIONS?: DurableObjectNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 20);
}

export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 100);
}
