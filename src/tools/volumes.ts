/**
 * Volume Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerVolumeTools(server: McpServer, client: DigitalOceanClient): void {
  // List Volumes
  server.tool(
    'digitalocean_list_volumes',
    `List all block storage volumes.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      name: z.string().optional().describe('Filter by volume name'),
      region: z.string().optional().describe('Filter by region'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, name, region, format }) => {
      try {
        const result = await client.listVolumes({ per_page, page, name, region });
        return formatResponse(result, format, 'volumes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Volume
  server.tool(
    'digitalocean_get_volume',
    `Get details of a specific volume.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ volume_id, format }) => {
      try {
        const volume = await client.getVolume(volume_id);
        return formatResponse(volume, format, 'volume');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Volume
  server.tool(
    'digitalocean_create_volume',
    `Create a new block storage volume.`,
    {
      name: z.string().describe('Volume name'),
      size_gigabytes: z.number().int().describe('Size in GB'),
      region: z.string().describe('Region slug'),
      description: z.string().optional(),
      snapshot_id: z.string().optional().describe('Create from snapshot'),
      filesystem_type: z.enum(['ext4', 'xfs']).optional(),
      filesystem_label: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async (input) => {
      try {
        const volume = await client.createVolume(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Volume created', volume }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Volume
  server.tool(
    'digitalocean_delete_volume',
    `Delete a block storage volume.`,
    {
      volume_id: z.string().describe('Volume UUID'),
    },
    async ({ volume_id }) => {
      try {
        await client.deleteVolume(volume_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Volume ${volume_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Volume by Name
  server.tool(
    'digitalocean_delete_volume_by_name',
    `Delete a volume by name and region.`,
    {
      name: z.string().describe('Volume name'),
      region: z.string().describe('Region slug'),
    },
    async ({ name, region }) => {
      try {
        await client.deleteVolumeByName(name, region);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Volume ${name} in ${region} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Attach Volume
  server.tool(
    'digitalocean_attach_volume',
    `Attach a volume to a droplet.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      droplet_id: z.number().int().describe('Droplet ID'),
      region: z.string().optional().describe('Region slug'),
    },
    async ({ volume_id, droplet_id, region }) => {
      try {
        const action = await client.performVolumeAction(volume_id, 'attach', { droplet_id, region });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Volume attach initiated', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Detach Volume
  server.tool(
    'digitalocean_detach_volume',
    `Detach a volume from a droplet.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      droplet_id: z.number().int().describe('Droplet ID'),
      region: z.string().optional().describe('Region slug'),
    },
    async ({ volume_id, droplet_id, region }) => {
      try {
        const action = await client.performVolumeAction(volume_id, 'detach', { droplet_id, region });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Volume detach initiated', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Resize Volume
  server.tool(
    'digitalocean_resize_volume',
    `Resize a block storage volume (can only increase size).`,
    {
      volume_id: z.string().describe('Volume UUID'),
      size_gigabytes: z.number().int().describe('New size in GB'),
      region: z.string().optional().describe('Region slug'),
    },
    async ({ volume_id, size_gigabytes, region }) => {
      try {
        const action = await client.performVolumeAction(volume_id, 'resize', { size_gigabytes, region });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Volume resize initiated', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Volume Snapshots
  server.tool(
    'digitalocean_list_volume_snapshots',
    `List all snapshots for a volume.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ volume_id, per_page, page, format }) => {
      try {
        const result = await client.listVolumeSnapshots(volume_id, { per_page, page });
        return formatResponse(result, format, 'snapshots');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Volume Snapshot
  server.tool(
    'digitalocean_create_volume_snapshot',
    `Create a snapshot of a volume.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      name: z.string().describe('Snapshot name'),
      tags: z.array(z.string()).optional(),
    },
    async ({ volume_id, name, tags }) => {
      try {
        const snapshot = await client.createVolumeSnapshot(volume_id, name, tags);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Snapshot created', snapshot }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Volume Actions
  server.tool(
    'digitalocean_list_volume_actions',
    `List all actions for a volume.`,
    {
      volume_id: z.string().describe('Volume UUID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ volume_id, per_page, page, format }) => {
      try {
        const result = await client.listVolumeActions(volume_id, { per_page, page });
        return formatResponse(result, format, 'actions');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
