/**
 * VPC Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerVPCTools(server: McpServer, client: DigitalOceanClient): void {
  // List VPCs
  server.tool(
    'digitalocean_list_vpcs',
    `List all VPCs.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listVPCs({ per_page, page });
        return formatResponse(result, format, 'vpcs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get VPC
  server.tool(
    'digitalocean_get_vpc',
    `Get details of a specific VPC.`,
    {
      vpc_id: z.string().describe('VPC UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ vpc_id, format }) => {
      try {
        const vpc = await client.getVPC(vpc_id);
        return formatResponse(vpc, format, 'vpc');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create VPC
  server.tool(
    'digitalocean_create_vpc',
    `Create a new VPC.`,
    {
      name: z.string().describe('VPC name'),
      region: z.string().describe('Region slug'),
      description: z.string().optional(),
      ip_range: z.string().optional().describe('IP range in CIDR notation (e.g., 10.10.10.0/24)'),
    },
    async (input) => {
      try {
        const vpc = await client.createVPC(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'VPC created', vpc }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update VPC
  server.tool(
    'digitalocean_update_vpc',
    `Update a VPC.`,
    {
      vpc_id: z.string().describe('VPC UUID'),
      name: z.string().describe('New VPC name'),
      description: z.string().optional(),
    },
    async ({ vpc_id, name, description }) => {
      try {
        const vpc = await client.updateVPC(vpc_id, name, description);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'VPC updated', vpc }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete VPC
  server.tool(
    'digitalocean_delete_vpc',
    `Delete a VPC.`,
    {
      vpc_id: z.string().describe('VPC UUID'),
    },
    async ({ vpc_id }) => {
      try {
        await client.deleteVPC(vpc_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `VPC ${vpc_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List VPC Members
  server.tool(
    'digitalocean_list_vpc_members',
    `List all members (resources) in a VPC.`,
    {
      vpc_id: z.string().describe('VPC UUID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ vpc_id, per_page, page, format }) => {
      try {
        const result = await client.listVPCMembers(vpc_id, { per_page, page });
        return formatResponse(result, format, 'vpc_members');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
