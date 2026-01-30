/**
 * Kubernetes Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerKubernetesTools(server: McpServer, client: DigitalOceanClient): void {
  // List Kubernetes Clusters
  server.tool(
    'digitalocean_list_kubernetes_clusters',
    `List all Kubernetes clusters.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listKubernetesClusters({ per_page, page });
        return formatResponse(result, format, 'kubernetes_clusters');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Kubernetes Cluster
  server.tool(
    'digitalocean_get_kubernetes_cluster',
    `Get details of a specific Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cluster_id, format }) => {
      try {
        const cluster = await client.getKubernetesCluster(cluster_id);
        return formatResponse(cluster, format, 'kubernetes_cluster');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Kubernetes Cluster
  server.tool(
    'digitalocean_create_kubernetes_cluster',
    `Create a new Kubernetes cluster.`,
    {
      name: z.string().describe('Cluster name'),
      region: z.string().describe('Region slug'),
      version: z.string().describe('Kubernetes version slug'),
      vpc_uuid: z.string().optional().describe('VPC UUID'),
      tags: z.array(z.string()).optional(),
      node_pools: z.array(z.object({
        name: z.string(),
        size: z.string(),
        count: z.number().int(),
        tags: z.array(z.string()).optional(),
        labels: z.record(z.string(), z.string()).optional(),
        auto_scale: z.boolean().optional(),
        min_nodes: z.number().int().optional(),
        max_nodes: z.number().int().optional(),
      })).describe('Node pool configurations'),
      auto_upgrade: z.boolean().optional(),
      surge_upgrade: z.boolean().optional(),
      ha: z.boolean().optional().describe('Enable high availability'),
    },
    async (input) => {
      try {
        const cluster = await client.createKubernetesCluster(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Kubernetes cluster created', cluster }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Kubernetes Cluster
  server.tool(
    'digitalocean_update_kubernetes_cluster',
    `Update a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      name: z.string().describe('New cluster name'),
      auto_upgrade: z.boolean().optional(),
      maintenance_policy: z.object({
        start_time: z.string(),
        day: z.enum(['any', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      }).optional(),
    },
    async ({ cluster_id, name, auto_upgrade, maintenance_policy }) => {
      try {
        const cluster = await client.updateKubernetesCluster(cluster_id, name, auto_upgrade, maintenance_policy);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Kubernetes cluster updated', cluster }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Kubernetes Cluster
  server.tool(
    'digitalocean_delete_kubernetes_cluster',
    `Delete a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
    },
    async ({ cluster_id }) => {
      try {
        await client.deleteKubernetesCluster(cluster_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Kubernetes cluster ${cluster_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Kubeconfig
  server.tool(
    'digitalocean_get_kubeconfig',
    `Get the kubeconfig for a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
    },
    async ({ cluster_id }) => {
      try {
        const kubeconfig = await client.getKubernetesKubeconfig(cluster_id);
        return {
          content: [
            {
              type: 'text',
              text: kubeconfig,
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Kubernetes Credentials
  server.tool(
    'digitalocean_get_kubernetes_credentials',
    `Get credentials for a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
    },
    async ({ cluster_id }) => {
      try {
        const credentials = await client.getKubernetesCredentials(cluster_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(credentials, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Node Pools
  server.tool(
    'digitalocean_list_kubernetes_node_pools',
    `List all node pools in a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cluster_id, format }) => {
      try {
        const nodePools = await client.listKubernetesNodePools(cluster_id);
        return formatResponse({ items: nodePools, count: nodePools.length, hasMore: false }, format, 'node_pools');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Node Pool
  server.tool(
    'digitalocean_get_kubernetes_node_pool',
    `Get details of a specific node pool.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      node_pool_id: z.string().describe('Node pool UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cluster_id, node_pool_id, format }) => {
      try {
        const nodePool = await client.getKubernetesNodePool(cluster_id, node_pool_id);
        return formatResponse(nodePool, format, 'node_pool');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Add Node Pool
  server.tool(
    'digitalocean_add_kubernetes_node_pool',
    `Add a new node pool to a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      name: z.string().describe('Node pool name'),
      size: z.string().describe('Droplet size slug'),
      count: z.number().int().describe('Number of nodes'),
      tags: z.array(z.string()).optional(),
      labels: z.record(z.string(), z.string()).optional(),
      auto_scale: z.boolean().optional(),
      min_nodes: z.number().int().optional(),
      max_nodes: z.number().int().optional(),
    },
    async ({ cluster_id, ...input }) => {
      try {
        const nodePool = await client.addKubernetesNodePool(cluster_id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Node pool added', node_pool: nodePool }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Node Pool
  server.tool(
    'digitalocean_update_kubernetes_node_pool',
    `Update a node pool in a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      node_pool_id: z.string().describe('Node pool UUID'),
      name: z.string().optional(),
      count: z.number().int().optional(),
      tags: z.array(z.string()).optional(),
      labels: z.record(z.string(), z.string()).optional(),
      auto_scale: z.boolean().optional(),
      min_nodes: z.number().int().optional(),
      max_nodes: z.number().int().optional(),
    },
    async ({ cluster_id, node_pool_id, ...input }) => {
      try {
        const nodePool = await client.updateKubernetesNodePool(cluster_id, node_pool_id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Node pool updated', node_pool: nodePool }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Node Pool
  server.tool(
    'digitalocean_delete_kubernetes_node_pool',
    `Delete a node pool from a Kubernetes cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      node_pool_id: z.string().describe('Node pool UUID'),
    },
    async ({ cluster_id, node_pool_id }) => {
      try {
        await client.deleteKubernetesNodePool(cluster_id, node_pool_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Node pool ${node_pool_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Node
  server.tool(
    'digitalocean_delete_kubernetes_node',
    `Delete a node from a node pool.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      node_pool_id: z.string().describe('Node pool UUID'),
      node_id: z.string().describe('Node UUID'),
      replace: z.boolean().optional().describe('Replace the node'),
      skip_drain: z.boolean().optional().describe('Skip draining the node'),
    },
    async ({ cluster_id, node_pool_id, node_id, replace, skip_drain }) => {
      try {
        await client.deleteKubernetesNode(cluster_id, node_pool_id, node_id, replace, skip_drain);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Node ${node_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Upgrade Cluster
  server.tool(
    'digitalocean_upgrade_kubernetes_cluster',
    `Upgrade a Kubernetes cluster to a new version.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
      version: z.string().describe('Target Kubernetes version'),
    },
    async ({ cluster_id, version }) => {
      try {
        await client.upgradeKubernetesCluster(cluster_id, version);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Cluster upgrade to ${version} initiated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Available Upgrades
  server.tool(
    'digitalocean_list_kubernetes_upgrades',
    `List available Kubernetes version upgrades for a cluster.`,
    {
      cluster_id: z.string().describe('Cluster UUID'),
    },
    async ({ cluster_id }) => {
      try {
        const upgrades = await client.listKubernetesAvailableUpgrades(cluster_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ available_upgrades: upgrades }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Kubernetes Options
  server.tool(
    'digitalocean_get_kubernetes_options',
    `Get available Kubernetes options (versions, regions, sizes).`,
    {},
    async () => {
      try {
        const options = await client.getKubernetesOptions();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(options, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
