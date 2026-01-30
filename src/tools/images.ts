/**
 * Image Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerImageTools(server: McpServer, client: DigitalOceanClient): void {
  // List Images
  server.tool(
    'digitalocean_list_images',
    `List all images (snapshots, backups, and distribution images).`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      type: z.enum(['distribution', 'application', 'snapshot', 'backup']).optional().describe('Filter by image type'),
      private: z.boolean().optional().describe('Filter by private images only'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, type, private: isPrivate, format }) => {
      try {
        const result = await client.listImages({ per_page, page, type, private: isPrivate });
        return formatResponse(result, format, 'images');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Image
  server.tool(
    'digitalocean_get_image',
    `Get details of a specific image.`,
    {
      image_id: z.union([z.number().int(), z.string()]).describe('Image ID or slug'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ image_id, format }) => {
      try {
        const image = await client.getImage(image_id);
        return formatResponse(image, format, 'image');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Image
  server.tool(
    'digitalocean_update_image',
    `Update an image (rename or update metadata).`,
    {
      image_id: z.number().int().describe('Image ID'),
      name: z.string().describe('New image name'),
      description: z.string().optional(),
      distribution: z.string().optional(),
    },
    async ({ image_id, name, description, distribution }) => {
      try {
        const image = await client.updateImage(image_id, name, description, distribution);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image updated', image }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Image
  server.tool(
    'digitalocean_delete_image',
    `Delete an image (custom/snapshot only).`,
    {
      image_id: z.number().int().describe('Image ID'),
    },
    async ({ image_id }) => {
      try {
        await client.deleteImage(image_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Image ${image_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Transfer Image
  server.tool(
    'digitalocean_transfer_image',
    `Transfer an image to another region.`,
    {
      image_id: z.number().int().describe('Image ID'),
      region: z.string().describe('Target region slug'),
    },
    async ({ image_id, region }) => {
      try {
        const action = await client.performImageAction(image_id, 'transfer', { region });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image transfer initiated', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Convert Image to Snapshot
  server.tool(
    'digitalocean_convert_image_to_snapshot',
    `Convert a backup image to a snapshot.`,
    {
      image_id: z.number().int().describe('Image ID'),
    },
    async ({ image_id }) => {
      try {
        const action = await client.performImageAction(image_id, 'convert');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Image conversion initiated', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Image Actions
  server.tool(
    'digitalocean_list_image_actions',
    `List all actions for an image.`,
    {
      image_id: z.number().int().describe('Image ID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ image_id, per_page, page, format }) => {
      try {
        const result = await client.listImageActions(image_id, { per_page, page });
        return formatResponse(result, format, 'actions');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
