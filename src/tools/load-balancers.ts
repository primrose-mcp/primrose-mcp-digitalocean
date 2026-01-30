/**
 * Load Balancer Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const forwardingRuleSchema = z.object({
  entry_protocol: z.enum(['http', 'https', 'http2', 'http3', 'tcp', 'udp']),
  entry_port: z.number().int(),
  target_protocol: z.enum(['http', 'https', 'http2', 'tcp', 'udp']),
  target_port: z.number().int(),
  certificate_id: z.string().optional(),
  tls_passthrough: z.boolean().optional(),
});

const healthCheckSchema = z.object({
  protocol: z.enum(['http', 'https', 'tcp']),
  port: z.number().int(),
  path: z.string().optional(),
  check_interval_seconds: z.number().int().optional(),
  response_timeout_seconds: z.number().int().optional(),
  unhealthy_threshold: z.number().int().optional(),
  healthy_threshold: z.number().int().optional(),
});

const stickySessionsSchema = z.object({
  type: z.enum(['none', 'cookies']),
  cookie_name: z.string().optional(),
  cookie_ttl_seconds: z.number().int().optional(),
});

export function registerLoadBalancerTools(server: McpServer, client: DigitalOceanClient): void {
  // List Load Balancers
  server.tool(
    'digitalocean_list_load_balancers',
    `List all load balancers.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listLoadBalancers({ per_page, page });
        return formatResponse(result, format, 'load_balancers');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Load Balancer
  server.tool(
    'digitalocean_get_load_balancer',
    `Get details of a specific load balancer.`,
    {
      lb_id: z.string().describe('Load balancer UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ lb_id, format }) => {
      try {
        const lb = await client.getLoadBalancer(lb_id);
        return formatResponse(lb, format, 'load_balancer');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Load Balancer
  server.tool(
    'digitalocean_create_load_balancer',
    `Create a new load balancer.`,
    {
      name: z.string().describe('Load balancer name'),
      region: z.string().describe('Region slug'),
      size: z.enum(['lb-small', 'lb-medium', 'lb-large']).optional(),
      forwarding_rules: z.array(forwardingRuleSchema).describe('Forwarding rules'),
      health_check: healthCheckSchema.optional(),
      sticky_sessions: stickySessionsSchema.optional(),
      droplet_ids: z.array(z.number().int()).optional(),
      tag: z.string().optional().describe('Tag for automatic droplet assignment'),
      redirect_http_to_https: z.boolean().optional(),
      enable_proxy_protocol: z.boolean().optional(),
      enable_backend_keepalive: z.boolean().optional(),
      vpc_uuid: z.string().optional(),
      project_id: z.string().optional(),
      http_idle_timeout_seconds: z.number().int().optional(),
    },
    async (input) => {
      try {
        const lb = await client.createLoadBalancer(input as Parameters<typeof client.createLoadBalancer>[0]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Load balancer created', load_balancer: lb }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Load Balancer
  server.tool(
    'digitalocean_update_load_balancer',
    `Update an existing load balancer.`,
    {
      lb_id: z.string().describe('Load balancer UUID'),
      name: z.string().optional(),
      size: z.enum(['lb-small', 'lb-medium', 'lb-large']).optional(),
      forwarding_rules: z.array(forwardingRuleSchema).optional(),
      health_check: healthCheckSchema.optional(),
      sticky_sessions: stickySessionsSchema.optional(),
      droplet_ids: z.array(z.number().int()).optional(),
      tag: z.string().optional(),
      redirect_http_to_https: z.boolean().optional(),
      enable_proxy_protocol: z.boolean().optional(),
      enable_backend_keepalive: z.boolean().optional(),
      http_idle_timeout_seconds: z.number().int().optional(),
    },
    async ({ lb_id, ...input }) => {
      try {
        const lb = await client.updateLoadBalancer(lb_id, input as Parameters<typeof client.updateLoadBalancer>[1]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Load balancer updated', load_balancer: lb }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Load Balancer
  server.tool(
    'digitalocean_delete_load_balancer',
    `Delete a load balancer.`,
    {
      lb_id: z.string().describe('Load balancer UUID'),
    },
    async ({ lb_id }) => {
      try {
        await client.deleteLoadBalancer(lb_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Load balancer ${lb_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Add Droplets to Load Balancer
  server.tool(
    'digitalocean_add_droplets_to_load_balancer',
    `Add droplets to a load balancer.`,
    {
      lb_id: z.string().describe('Load balancer UUID'),
      droplet_ids: z.array(z.number().int()).describe('Droplet IDs to add'),
    },
    async ({ lb_id, droplet_ids }) => {
      try {
        await client.addDropletsToLoadBalancer(lb_id, droplet_ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Droplets added to load balancer' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Remove Droplets from Load Balancer
  server.tool(
    'digitalocean_remove_droplets_from_load_balancer',
    `Remove droplets from a load balancer.`,
    {
      lb_id: z.string().describe('Load balancer UUID'),
      droplet_ids: z.array(z.number().int()).describe('Droplet IDs to remove'),
    },
    async ({ lb_id, droplet_ids }) => {
      try {
        await client.removeDropletsFromLoadBalancer(lb_id, droplet_ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Droplets removed from load balancer' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
