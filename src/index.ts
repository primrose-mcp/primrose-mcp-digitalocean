/**
 * DigitalOcean MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API tokens) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-DigitalOcean-Token: API token for DigitalOcean authentication
 *
 * Optional Headers:
 * - X-DigitalOcean-Base-URL: Override the default API base URL
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createDigitalOceanClient } from './client.js';
import {
  registerAdditionalTools,
  registerAppTools,
  registerDatabaseTools,
  registerDomainTools,
  registerDropletTools,
  registerFirewallTools,
  registerImageTools,
  registerKubernetesTools,
  registerLoadBalancerTools,
  registerSSHKeyTools,
  registerVolumeTools,
  registerVPCTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-digitalocean';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

export class DigitalOceanMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-DigitalOcean-Token header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createDigitalOceanClient(credentials);

  // Register all tool modules
  registerDropletTools(server, client);
  registerKubernetesTools(server, client);
  registerDatabaseTools(server, client);
  registerDomainTools(server, client);
  registerVolumeTools(server, client);
  registerFirewallTools(server, client);
  registerLoadBalancerTools(server, client);
  registerVPCTools(server, client);
  registerImageTools(server, client);
  registerSSHKeyTools(server, client);
  registerAppTools(server, client);
  registerAdditionalTools(server, client);

  // Test connection tool
  server.tool(
    'digitalocean_test_connection',
    'Test the connection to the DigitalOcean API',
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stateless MCP with Streamable HTTP
    if (url.pathname === '/mcp' && request.method === 'POST') {
      const credentials = parseTenantCredentials(request);

      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-DigitalOcean-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const server = createStatelessServer(credentials);

      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint (not supported in multi-tenant mode)
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'DigitalOcean MCP Server - Multi-tenant',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-DigitalOcean-Token': 'API token for DigitalOcean authentication',
          },
          optional_headers: {
            'X-DigitalOcean-Base-URL': 'Override the default API base URL',
          },
        },
        tools: [
          'digitalocean_test_connection',
          // Droplets
          'digitalocean_list_droplets',
          'digitalocean_get_droplet',
          'digitalocean_create_droplet',
          'digitalocean_delete_droplet',
          'digitalocean_droplet_action',
          // Kubernetes
          'digitalocean_list_kubernetes_clusters',
          'digitalocean_create_kubernetes_cluster',
          'digitalocean_get_kubeconfig',
          // Databases
          'digitalocean_list_databases',
          'digitalocean_create_database',
          // Domains & DNS
          'digitalocean_list_domains',
          'digitalocean_list_domain_records',
          'digitalocean_create_domain_record',
          // And many more...',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
