/**
 * Domain and DNS Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerDomainTools(server: McpServer, client: DigitalOceanClient): void {
  // List Domains
  server.tool(
    'digitalocean_list_domains',
    `List all domains in the account.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listDomains({ per_page, page });
        return formatResponse(result, format, 'domains');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Domain
  server.tool(
    'digitalocean_get_domain',
    `Get details of a specific domain.`,
    {
      domain_name: z.string().describe('Domain name'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ domain_name, format }) => {
      try {
        const domain = await client.getDomain(domain_name);
        return formatResponse(domain, format, 'domain');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Domain
  server.tool(
    'digitalocean_create_domain',
    `Add a domain to the account.`,
    {
      name: z.string().describe('Domain name'),
      ip_address: z.string().optional().describe('IP address to create an A record for'),
    },
    async ({ name, ip_address }) => {
      try {
        const domain = await client.createDomain(name, ip_address);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Domain created', domain }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Domain
  server.tool(
    'digitalocean_delete_domain',
    `Delete a domain from the account.`,
    {
      domain_name: z.string().describe('Domain name'),
    },
    async ({ domain_name }) => {
      try {
        await client.deleteDomain(domain_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Domain ${domain_name} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Domain Records
  server.tool(
    'digitalocean_list_domain_records',
    `List all DNS records for a domain.`,
    {
      domain_name: z.string().describe('Domain name'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ domain_name, per_page, page, format }) => {
      try {
        const result = await client.listDomainRecords(domain_name, { per_page, page });
        return formatResponse(result, format, 'domain_records');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Domain Record
  server.tool(
    'digitalocean_get_domain_record',
    `Get a specific DNS record.`,
    {
      domain_name: z.string().describe('Domain name'),
      record_id: z.number().int().describe('Record ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ domain_name, record_id, format }) => {
      try {
        const record = await client.getDomainRecord(domain_name, record_id);
        return formatResponse(record, format, 'domain_record');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Domain Record
  server.tool(
    'digitalocean_create_domain_record',
    `Create a new DNS record.`,
    {
      domain_name: z.string().describe('Domain name'),
      type: z.enum(['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'SOA', 'SRV', 'TXT']).describe('Record type'),
      name: z.string().describe('Record name (use @ for root)'),
      data: z.string().describe('Record data'),
      priority: z.number().int().optional().describe('Priority (for MX/SRV)'),
      port: z.number().int().optional().describe('Port (for SRV)'),
      ttl: z.number().int().optional().describe('TTL in seconds'),
      weight: z.number().int().optional().describe('Weight (for SRV)'),
      flags: z.number().int().optional().describe('Flags (for CAA)'),
      tag: z.string().optional().describe('Tag (for CAA)'),
    },
    async ({ domain_name, ...input }) => {
      try {
        const record = await client.createDomainRecord(domain_name, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'DNS record created', record }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Domain Record
  server.tool(
    'digitalocean_update_domain_record',
    `Update an existing DNS record.`,
    {
      domain_name: z.string().describe('Domain name'),
      record_id: z.number().int().describe('Record ID'),
      type: z.enum(['A', 'AAAA', 'CAA', 'CNAME', 'MX', 'NS', 'SOA', 'SRV', 'TXT']).optional(),
      name: z.string().optional(),
      data: z.string().optional(),
      priority: z.number().int().optional(),
      port: z.number().int().optional(),
      ttl: z.number().int().optional(),
      weight: z.number().int().optional(),
      flags: z.number().int().optional(),
      tag: z.string().optional(),
    },
    async ({ domain_name, record_id, ...input }) => {
      try {
        const record = await client.updateDomainRecord(domain_name, record_id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'DNS record updated', record }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Domain Record
  server.tool(
    'digitalocean_delete_domain_record',
    `Delete a DNS record.`,
    {
      domain_name: z.string().describe('Domain name'),
      record_id: z.number().int().describe('Record ID'),
    },
    async ({ domain_name, record_id }) => {
      try {
        await client.deleteDomainRecord(domain_name, record_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `DNS record ${record_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
