/**
 * Droplet Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerDropletTools(server: McpServer, client: DigitalOceanClient): void {
  // List Droplets
  server.tool(
    'digitalocean_list_droplets',
    `List all droplets in the DigitalOcean account.

Args:
  - per_page: Number of droplets per page (1-200, default: 20)
  - page: Page number
  - tag_name: Filter by tag name
  - format: Response format ('json' or 'markdown')`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      tag_name: z.string().optional().describe('Filter droplets by tag'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, tag_name, format }) => {
      try {
        const result = await client.listDroplets({ per_page, page, tag_name });
        return formatResponse(result, format, 'droplets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Droplet
  server.tool(
    'digitalocean_get_droplet',
    `Get details of a specific droplet.

Args:
  - droplet_id: The unique identifier of the droplet
  - format: Response format`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, format }) => {
      try {
        const droplet = await client.getDroplet(droplet_id);
        return formatResponse(droplet, format, 'droplet');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Droplet
  server.tool(
    'digitalocean_create_droplet',
    `Create a new droplet.

Args:
  - name: Name for the droplet
  - region: Region slug (e.g., 'nyc1', 'sfo3', 'ams3')
  - size: Size slug (e.g., 's-1vcpu-1gb', 's-2vcpu-2gb')
  - image: Image slug or ID (e.g., 'ubuntu-22-04-x64', 'docker-20-04')
  - ssh_keys: Array of SSH key IDs or fingerprints
  - backups: Enable automatic backups
  - ipv6: Enable IPv6
  - monitoring: Enable monitoring
  - vpc_uuid: VPC UUID to place the droplet in
  - user_data: User data script for cloud-init
  - tags: Tags to apply to the droplet`,
    {
      name: z.string().describe('Droplet name'),
      region: z.string().describe('Region slug'),
      size: z.string().describe('Size slug'),
      image: z.union([z.string(), z.number()]).describe('Image slug or ID'),
      ssh_keys: z.array(z.union([z.string(), z.number()])).optional().describe('SSH key IDs or fingerprints'),
      backups: z.boolean().optional().describe('Enable backups'),
      ipv6: z.boolean().optional().describe('Enable IPv6'),
      monitoring: z.boolean().optional().describe('Enable monitoring'),
      vpc_uuid: z.string().optional().describe('VPC UUID'),
      user_data: z.string().optional().describe('User data script'),
      tags: z.array(z.string()).optional().describe('Tags'),
    },
    async (input) => {
      try {
        const droplet = await client.createDroplet(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Droplet created', droplet }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Droplet
  server.tool(
    'digitalocean_delete_droplet',
    `Delete a droplet.

Args:
  - droplet_id: The droplet ID to delete`,
    {
      droplet_id: z.number().int().describe('Droplet ID to delete'),
    },
    async ({ droplet_id }) => {
      try {
        await client.deleteDroplet(droplet_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Droplet ${droplet_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Droplets by Tag
  server.tool(
    'digitalocean_delete_droplets_by_tag',
    `Delete all droplets with a specific tag.

Args:
  - tag_name: The tag name to filter droplets`,
    {
      tag_name: z.string().describe('Tag name'),
    },
    async ({ tag_name }) => {
      try {
        await client.deleteDropletsByTag(tag_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Droplets with tag '${tag_name}' deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Perform Droplet Action
  server.tool(
    'digitalocean_droplet_action',
    `Perform an action on a droplet.

Args:
  - droplet_id: The droplet ID
  - action: Action type (power_on, power_off, shutdown, reboot, power_cycle,
            enable_ipv6, enable_backups, disable_backups, snapshot, restore,
            password_reset, resize, rebuild, rename)
  - Additional parameters based on action type`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      action: z.enum([
        'power_on',
        'power_off',
        'shutdown',
        'reboot',
        'power_cycle',
        'enable_ipv6',
        'enable_backups',
        'disable_backups',
        'snapshot',
        'restore',
        'password_reset',
        'resize',
        'rebuild',
        'rename',
      ]).describe('Action type'),
      name: z.string().optional().describe('New name (for rename/snapshot)'),
      image: z.union([z.string(), z.number()]).optional().describe('Image (for rebuild/restore)'),
      size: z.string().optional().describe('Size slug (for resize)'),
      disk: z.boolean().optional().describe('Resize disk (for resize)'),
    },
    async ({ droplet_id, action, name, image, size, disk }) => {
      try {
        const params: Record<string, unknown> = {};
        if (name) params.name = name;
        if (image) params.image = image;
        if (size) params.size = size;
        if (disk !== undefined) params.disk = disk;

        const result = await client.performDropletAction(droplet_id, action, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, action: result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Perform Action by Tag
  server.tool(
    'digitalocean_droplet_action_by_tag',
    `Perform an action on all droplets with a specific tag.

Args:
  - tag_name: The tag to filter droplets
  - action: Action type (power_on, power_off, shutdown, reboot, power_cycle,
            enable_ipv6, enable_backups, disable_backups, snapshot)`,
    {
      tag_name: z.string().describe('Tag name'),
      action: z.enum([
        'power_on',
        'power_off',
        'shutdown',
        'reboot',
        'power_cycle',
        'enable_ipv6',
        'enable_backups',
        'disable_backups',
        'snapshot',
      ]).describe('Action type'),
      name: z.string().optional().describe('Snapshot name (for snapshot action)'),
    },
    async ({ tag_name, action, name }) => {
      try {
        const params: Record<string, unknown> = {};
        if (name) params.name = name;

        const results = await client.performDropletActionByTag(tag_name, action, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, actions: results }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Droplet Actions
  server.tool(
    'digitalocean_list_droplet_actions',
    `List all actions for a droplet.

Args:
  - droplet_id: The droplet ID
  - per_page: Results per page
  - page: Page number`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, per_page, page, format }) => {
      try {
        const result = await client.listDropletActions(droplet_id, { per_page, page });
        return formatResponse(result, format, 'actions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Droplet Snapshots
  server.tool(
    'digitalocean_list_droplet_snapshots',
    `List all snapshots for a droplet.

Args:
  - droplet_id: The droplet ID
  - per_page: Results per page
  - page: Page number`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, per_page, page, format }) => {
      try {
        const result = await client.listDropletSnapshots(droplet_id, { per_page, page });
        return formatResponse(result, format, 'snapshots');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Droplet Backups
  server.tool(
    'digitalocean_list_droplet_backups',
    `List all backups for a droplet.

Args:
  - droplet_id: The droplet ID
  - per_page: Results per page
  - page: Page number`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, per_page, page, format }) => {
      try {
        const result = await client.listDropletBackups(droplet_id, { per_page, page });
        return formatResponse(result, format, 'backups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Droplet Firewalls
  server.tool(
    'digitalocean_list_droplet_firewalls',
    `List all firewalls applied to a droplet.

Args:
  - droplet_id: The droplet ID`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, format }) => {
      try {
        const result = await client.listDropletFirewalls(droplet_id);
        return formatResponse(result, format, 'firewalls');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Droplet Neighbors
  server.tool(
    'digitalocean_list_droplet_neighbors',
    `List droplets running on the same physical hardware.

Args:
  - droplet_id: The droplet ID`,
    {
      droplet_id: z.number().int().describe('Droplet ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ droplet_id, format }) => {
      try {
        const neighbors = await client.listDropletNeighbors(droplet_id);
        return formatResponse({ items: neighbors, count: neighbors.length, hasMore: false }, format, 'droplets');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
