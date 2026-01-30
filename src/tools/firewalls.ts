/**
 * Firewall Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import type { FirewallRule } from '../types/entities.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const firewallRuleSchema = z.object({
  protocol: z.enum(['tcp', 'udp', 'icmp']).describe('Protocol'),
  ports: z.string().describe('Port range (e.g., "22", "80-443", "all")'),
  sources: z.object({
    addresses: z.array(z.string()).optional(),
    droplet_ids: z.array(z.number().int()).optional(),
    load_balancer_uids: z.array(z.string()).optional(),
    kubernetes_ids: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  destinations: z.object({
    addresses: z.array(z.string()).optional(),
    droplet_ids: z.array(z.number().int()).optional(),
    load_balancer_uids: z.array(z.string()).optional(),
    kubernetes_ids: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export function registerFirewallTools(server: McpServer, client: DigitalOceanClient): void {
  // List Firewalls
  server.tool(
    'digitalocean_list_firewalls',
    `List all firewalls.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listFirewalls({ per_page, page });
        return formatResponse(result, format, 'firewalls');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Firewall
  server.tool(
    'digitalocean_get_firewall',
    `Get details of a specific firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ firewall_id, format }) => {
      try {
        const firewall = await client.getFirewall(firewall_id);
        return formatResponse(firewall, format, 'firewall');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Firewall
  server.tool(
    'digitalocean_create_firewall',
    `Create a new firewall.`,
    {
      name: z.string().describe('Firewall name'),
      inbound_rules: z.array(firewallRuleSchema).optional().describe('Inbound rules'),
      outbound_rules: z.array(firewallRuleSchema).optional().describe('Outbound rules'),
      droplet_ids: z.array(z.number().int()).optional().describe('Droplet IDs to apply to'),
      tags: z.array(z.string()).optional().describe('Tags to apply firewall to'),
    },
    async (input) => {
      try {
        const firewall = await client.createFirewall(input as { name: string; inbound_rules?: FirewallRule[]; outbound_rules?: FirewallRule[]; droplet_ids?: number[]; tags?: string[] });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Firewall created', firewall }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Firewall
  server.tool(
    'digitalocean_update_firewall',
    `Update an existing firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      name: z.string().describe('Firewall name'),
      inbound_rules: z.array(firewallRuleSchema).optional(),
      outbound_rules: z.array(firewallRuleSchema).optional(),
      droplet_ids: z.array(z.number().int()).optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ firewall_id, ...input }) => {
      try {
        const firewall = await client.updateFirewall(firewall_id, input as { name: string; inbound_rules?: FirewallRule[]; outbound_rules?: FirewallRule[]; droplet_ids?: number[]; tags?: string[] });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Firewall updated', firewall }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Firewall
  server.tool(
    'digitalocean_delete_firewall',
    `Delete a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
    },
    async ({ firewall_id }) => {
      try {
        await client.deleteFirewall(firewall_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Firewall ${firewall_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Add Droplets to Firewall
  server.tool(
    'digitalocean_add_droplets_to_firewall',
    `Add droplets to a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      droplet_ids: z.array(z.number().int()).describe('Droplet IDs to add'),
    },
    async ({ firewall_id, droplet_ids }) => {
      try {
        await client.addDropletsToFirewall(firewall_id, droplet_ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Droplets added to firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Remove Droplets from Firewall
  server.tool(
    'digitalocean_remove_droplets_from_firewall',
    `Remove droplets from a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      droplet_ids: z.array(z.number().int()).describe('Droplet IDs to remove'),
    },
    async ({ firewall_id, droplet_ids }) => {
      try {
        await client.removeDropletsFromFirewall(firewall_id, droplet_ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Droplets removed from firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Add Tags to Firewall
  server.tool(
    'digitalocean_add_tags_to_firewall',
    `Add tags to a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      tags: z.array(z.string()).describe('Tags to add'),
    },
    async ({ firewall_id, tags }) => {
      try {
        await client.addTagsToFirewall(firewall_id, tags);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tags added to firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Remove Tags from Firewall
  server.tool(
    'digitalocean_remove_tags_from_firewall',
    `Remove tags from a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      tags: z.array(z.string()).describe('Tags to remove'),
    },
    async ({ firewall_id, tags }) => {
      try {
        await client.removeTagsFromFirewall(firewall_id, tags);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Tags removed from firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Add Rules to Firewall
  server.tool(
    'digitalocean_add_rules_to_firewall',
    `Add rules to a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      inbound_rules: z.array(firewallRuleSchema).optional(),
      outbound_rules: z.array(firewallRuleSchema).optional(),
    },
    async ({ firewall_id, inbound_rules, outbound_rules }) => {
      try {
        await client.addRulesToFirewall(
          firewall_id,
          inbound_rules as FirewallRule[] | undefined,
          outbound_rules as FirewallRule[] | undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Rules added to firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Remove Rules from Firewall
  server.tool(
    'digitalocean_remove_rules_from_firewall',
    `Remove rules from a firewall.`,
    {
      firewall_id: z.string().describe('Firewall UUID'),
      inbound_rules: z.array(firewallRuleSchema).optional(),
      outbound_rules: z.array(firewallRuleSchema).optional(),
    },
    async ({ firewall_id, inbound_rules, outbound_rules }) => {
      try {
        await client.removeRulesFromFirewall(
          firewall_id,
          inbound_rules as FirewallRule[] | undefined,
          outbound_rules as FirewallRule[] | undefined
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Rules removed from firewall' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
