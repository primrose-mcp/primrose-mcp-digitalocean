/**
 * SSH Key Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSSHKeyTools(server: McpServer, client: DigitalOceanClient): void {
  // List SSH Keys
  server.tool(
    'digitalocean_list_ssh_keys',
    `List all SSH keys in the account.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listSSHKeys({ per_page, page });
        return formatResponse(result, format, 'ssh_keys');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get SSH Key
  server.tool(
    'digitalocean_get_ssh_key',
    `Get details of a specific SSH key.`,
    {
      key_id: z.union([z.number().int(), z.string()]).describe('SSH key ID or fingerprint'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ key_id, format }) => {
      try {
        const key = await client.getSSHKey(key_id);
        return formatResponse(key, format, 'ssh_key');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create SSH Key
  server.tool(
    'digitalocean_create_ssh_key',
    `Add a new SSH key to the account.`,
    {
      name: z.string().describe('SSH key name'),
      public_key: z.string().describe('SSH public key content'),
    },
    async ({ name, public_key }) => {
      try {
        const key = await client.createSSHKey({ name, public_key });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'SSH key created', ssh_key: key }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update SSH Key
  server.tool(
    'digitalocean_update_ssh_key',
    `Update an SSH key name.`,
    {
      key_id: z.union([z.number().int(), z.string()]).describe('SSH key ID or fingerprint'),
      name: z.string().describe('New SSH key name'),
    },
    async ({ key_id, name }) => {
      try {
        const key = await client.updateSSHKey(key_id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'SSH key updated', ssh_key: key }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete SSH Key
  server.tool(
    'digitalocean_delete_ssh_key',
    `Delete an SSH key from the account.`,
    {
      key_id: z.union([z.number().int(), z.string()]).describe('SSH key ID or fingerprint'),
    },
    async ({ key_id }) => {
      try {
        await client.deleteSSHKey(key_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `SSH key ${key_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
