/**
 * Additional Tools for DigitalOcean MCP Server
 * (Regions, Sizes, Snapshots, Tags, Projects, Account, Billing, Reserved IPs, etc.)
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerAdditionalTools(server: McpServer, client: DigitalOceanClient): void {
  // ===========================================================================
  // Account
  // ===========================================================================

  server.tool(
    'digitalocean_get_account',
    `Get account information.`,
    {},
    async () => {
      try {
        const account = await client.getAccount();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(account, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Regions
  // ===========================================================================

  server.tool(
    'digitalocean_list_regions',
    `List all available regions.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listRegions({ per_page, page });
        return formatResponse(result, format, 'regions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Sizes
  // ===========================================================================

  server.tool(
    'digitalocean_list_sizes',
    `List all available droplet sizes.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listSizes({ per_page, page });
        return formatResponse(result, format, 'sizes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Snapshots
  // ===========================================================================

  server.tool(
    'digitalocean_list_snapshots',
    `List all snapshots.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      resource_type: z.enum(['droplet', 'volume']).optional().describe('Filter by resource type'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, resource_type, format }) => {
      try {
        const result = await client.listSnapshots({ per_page, page, resource_type });
        return formatResponse(result, format, 'snapshots');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_snapshot',
    `Get details of a specific snapshot.`,
    {
      snapshot_id: z.string().describe('Snapshot ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ snapshot_id, format }) => {
      try {
        const snapshot = await client.getSnapshot(snapshot_id);
        return formatResponse(snapshot, format, 'snapshot');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_snapshot',
    `Delete a snapshot.`,
    {
      snapshot_id: z.string().describe('Snapshot ID'),
    },
    async ({ snapshot_id }) => {
      try {
        await client.deleteSnapshot(snapshot_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Snapshot ${snapshot_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Tags
  // ===========================================================================

  server.tool(
    'digitalocean_list_tags',
    `List all tags.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listTags({ per_page, page });
        return formatResponse(result, format, 'tags');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_tag',
    `Get details of a specific tag.`,
    {
      tag_name: z.string().describe('Tag name'),
    },
    async ({ tag_name }) => {
      try {
        const tag = await client.getTag(tag_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tag, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_create_tag',
    `Create a new tag.`,
    {
      name: z.string().describe('Tag name'),
    },
    async ({ name }) => {
      try {
        const tag = await client.createTag(name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tag created', tag }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_tag',
    `Delete a tag.`,
    {
      tag_name: z.string().describe('Tag name'),
    },
    async ({ tag_name }) => {
      try {
        await client.deleteTag(tag_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Tag ${tag_name} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_tag_resources',
    `Apply a tag to resources.`,
    {
      tag_name: z.string().describe('Tag name'),
      resources: z.array(z.object({
        resource_id: z.string().describe('Resource ID'),
        resource_type: z.enum(['droplet', 'image', 'volume', 'volume_snapshot', 'database']).describe('Resource type'),
      })).describe('Resources to tag'),
    },
    async ({ tag_name, resources }) => {
      try {
        await client.tagResources(tag_name, resources);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Resources tagged' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_untag_resources',
    `Remove a tag from resources.`,
    {
      tag_name: z.string().describe('Tag name'),
      resources: z.array(z.object({
        resource_id: z.string().describe('Resource ID'),
        resource_type: z.enum(['droplet', 'image', 'volume', 'volume_snapshot', 'database']).describe('Resource type'),
      })).describe('Resources to untag'),
    },
    async ({ tag_name, resources }) => {
      try {
        await client.untagResources(tag_name, resources);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Resources untagged' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Projects
  // ===========================================================================

  server.tool(
    'digitalocean_list_projects',
    `List all projects.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listProjects({ per_page, page });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_project',
    `Get details of a specific project.`,
    {
      project_id: z.string().describe('Project UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ project_id, format }) => {
      try {
        const project = await client.getProject(project_id);
        return formatResponse(project, format, 'project');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_default_project',
    `Get the default project.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const project = await client.getDefaultProject();
        return formatResponse(project, format, 'project');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_create_project',
    `Create a new project.`,
    {
      name: z.string().describe('Project name'),
      description: z.string().optional(),
      purpose: z.string().describe('Project purpose'),
      environment: z.enum(['Development', 'Staging', 'Production']).describe('Environment'),
    },
    async (input) => {
      try {
        const project = await client.createProject(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project created', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_update_project',
    `Update a project.`,
    {
      project_id: z.string().describe('Project UUID'),
      name: z.string().optional(),
      description: z.string().optional(),
      purpose: z.string().optional(),
      environment: z.enum(['Development', 'Staging', 'Production']).optional(),
    },
    async ({ project_id, ...input }) => {
      try {
        const project = await client.updateProject(project_id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project updated', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_project',
    `Delete a project (must be empty).`,
    {
      project_id: z.string().describe('Project UUID'),
    },
    async ({ project_id }) => {
      try {
        await client.deleteProject(project_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Project ${project_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_list_project_resources',
    `List all resources in a project.`,
    {
      project_id: z.string().describe('Project UUID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ project_id, per_page, page, format }) => {
      try {
        const result = await client.listProjectResources(project_id, { per_page, page });
        return formatResponse(result, format, 'project_resources');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_assign_resources_to_project',
    `Assign resources to a project.`,
    {
      project_id: z.string().describe('Project UUID'),
      resources: z.array(z.string()).describe('Resource URNs (e.g., do:droplet:123)'),
    },
    async ({ project_id, resources }) => {
      try {
        const result = await client.assignResourcesToProject(project_id, resources);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Resources assigned', resources: result }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Reserved IPs
  // ===========================================================================

  server.tool(
    'digitalocean_list_reserved_ips',
    `List all reserved IPs.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listReservedIPs({ per_page, page });
        return formatResponse(result, format, 'reserved_ips');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_reserved_ip',
    `Get details of a reserved IP.`,
    {
      ip: z.string().describe('Reserved IP address'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ip, format }) => {
      try {
        const reservedIp = await client.getReservedIP(ip);
        return formatResponse(reservedIp, format, 'reserved_ip');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_create_reserved_ip',
    `Create a new reserved IP.`,
    {
      region: z.string().optional().describe('Region slug (if not assigning to droplet)'),
      droplet_id: z.number().int().optional().describe('Droplet ID to assign to'),
      project_id: z.string().optional(),
    },
    async ({ region, droplet_id, project_id }) => {
      try {
        const reservedIp = await client.createReservedIP(region, droplet_id, project_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reserved IP created', reserved_ip: reservedIp }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_reserved_ip',
    `Delete a reserved IP.`,
    {
      ip: z.string().describe('Reserved IP address'),
    },
    async ({ ip }) => {
      try {
        await client.deleteReservedIP(ip);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Reserved IP ${ip} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_assign_reserved_ip',
    `Assign a reserved IP to a droplet.`,
    {
      ip: z.string().describe('Reserved IP address'),
      droplet_id: z.number().int().describe('Droplet ID'),
    },
    async ({ ip, droplet_id }) => {
      try {
        const action = await client.performReservedIPAction(ip, 'assign', droplet_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reserved IP assigned', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_unassign_reserved_ip',
    `Unassign a reserved IP from a droplet.`,
    {
      ip: z.string().describe('Reserved IP address'),
    },
    async ({ ip }) => {
      try {
        const action = await client.performReservedIPAction(ip, 'unassign');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reserved IP unassigned', action }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Billing
  // ===========================================================================

  server.tool(
    'digitalocean_get_balance',
    `Get the current account balance.`,
    {},
    async () => {
      try {
        const balance = await client.getBalance();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(balance, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_list_billing_history',
    `List billing history.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listBillingHistory({ per_page, page });
        return formatResponse(result, format, 'billing_history');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_list_invoices',
    `List all invoices.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listInvoices({ per_page, page });
        return formatResponse(result, format, 'invoices');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_invoice',
    `Get details of a specific invoice.`,
    {
      invoice_id: z.string().describe('Invoice UUID'),
    },
    async ({ invoice_id }) => {
      try {
        const invoice = await client.getInvoice(invoice_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_invoice_items',
    `Get line items for an invoice.`,
    {
      invoice_id: z.string().describe('Invoice UUID'),
    },
    async ({ invoice_id }) => {
      try {
        const items = await client.getInvoiceItems(invoice_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ invoice_items: items }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Actions
  // ===========================================================================

  server.tool(
    'digitalocean_list_actions',
    `List all actions in the account.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listActions({ per_page, page });
        return formatResponse(result, format, 'actions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_action',
    `Get details of a specific action.`,
    {
      action_id: z.number().int().describe('Action ID'),
    },
    async ({ action_id }) => {
      try {
        const action = await client.getAction(action_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(action, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Certificates
  // ===========================================================================

  server.tool(
    'digitalocean_list_certificates',
    `List all SSL certificates.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listCertificates({ per_page, page });
        return formatResponse(result, format, 'certificates');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_get_certificate',
    `Get details of a specific certificate.`,
    {
      certificate_id: z.string().describe('Certificate UUID'),
    },
    async ({ certificate_id }) => {
      try {
        const certificate = await client.getCertificate(certificate_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(certificate, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_create_certificate',
    `Create a new SSL certificate (Let's Encrypt or custom).`,
    {
      name: z.string().describe('Certificate name'),
      type: z.enum(['custom', 'lets_encrypt']).describe('Certificate type'),
      dns_names: z.array(z.string()).optional().describe('DNS names (for Let\'s Encrypt)'),
      private_key: z.string().optional().describe('Private key (for custom)'),
      leaf_certificate: z.string().optional().describe('Certificate (for custom)'),
      certificate_chain: z.string().optional().describe('Certificate chain (for custom)'),
    },
    async (input) => {
      try {
        const certificate = await client.createCertificate(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Certificate created', certificate }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_certificate',
    `Delete a certificate.`,
    {
      certificate_id: z.string().describe('Certificate UUID'),
    },
    async ({ certificate_id }) => {
      try {
        await client.deleteCertificate(certificate_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Certificate ${certificate_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Spaces Keys
  // ===========================================================================

  server.tool(
    'digitalocean_list_spaces_keys',
    `List all Spaces access keys.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listSpacesKeys({ per_page, page });
        return formatResponse(result, format, 'spaces_keys');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_create_spaces_key',
    `Create a new Spaces access key.`,
    {
      name: z.string().describe('Key name'),
      grants: z.array(z.object({
        bucket: z.string().optional().describe('Bucket name (empty for all)'),
        permission: z.enum(['read', 'readwrite', 'fullaccess']).describe('Permission level'),
      })).describe('Access grants'),
    },
    async ({ name, grants }) => {
      try {
        const key = await client.createSpacesKey({ name, grants });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Spaces key created', key }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'digitalocean_delete_spaces_key',
    `Delete a Spaces access key.`,
    {
      access_key: z.string().describe('Access key ID'),
    },
    async ({ access_key }) => {
      try {
        await client.deleteSpacesKey(access_key);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Spaces key ${access_key} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
