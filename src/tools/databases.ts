/**
 * Database Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerDatabaseTools(server: McpServer, client: DigitalOceanClient): void {
  // List Databases
  server.tool(
    'digitalocean_list_databases',
    `List all managed database clusters.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listDatabases({ per_page, page });
        return formatResponse(result, format, 'databases');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Database
  server.tool(
    'digitalocean_get_database',
    `Get details of a specific database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ database_id, format }) => {
      try {
        const database = await client.getDatabase(database_id);
        return formatResponse(database, format, 'database');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Database
  server.tool(
    'digitalocean_create_database',
    `Create a new managed database cluster.`,
    {
      name: z.string().describe('Database cluster name'),
      engine: z.enum(['pg', 'mysql', 'redis', 'mongodb', 'kafka', 'opensearch']).describe('Database engine'),
      version: z.string().optional().describe('Engine version'),
      size: z.string().describe('Droplet size slug'),
      region: z.string().describe('Region slug'),
      num_nodes: z.number().int().describe('Number of nodes'),
      tags: z.array(z.string()).optional(),
      private_network_uuid: z.string().optional().describe('VPC UUID'),
      project_id: z.string().optional(),
    },
    async (input) => {
      try {
        const database = await client.createDatabase(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Database cluster created', database }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Database
  server.tool(
    'digitalocean_delete_database',
    `Delete a managed database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        await client.deleteDatabase(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Database cluster ${database_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Resize Database
  server.tool(
    'digitalocean_resize_database',
    `Resize a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      size: z.string().describe('New droplet size slug'),
      num_nodes: z.number().int().describe('New number of nodes'),
    },
    async ({ database_id, size, num_nodes }) => {
      try {
        await client.resizeDatabase(database_id, size, num_nodes);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Database resize initiated' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Migrate Database
  server.tool(
    'digitalocean_migrate_database',
    `Migrate a database cluster to a different region.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      region: z.string().describe('Target region slug'),
    },
    async ({ database_id, region }) => {
      try {
        await client.migrateDatabase(database_id, region);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Database migration to ${region} initiated` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database Backups
  server.tool(
    'digitalocean_list_database_backups',
    `List all backups for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const backups = await client.listDatabaseBackups(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ backups }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get Database CA
  server.tool(
    'digitalocean_get_database_ca',
    `Get the CA certificate for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const certificate = await client.getDatabaseCA(database_id);
        return {
          content: [
            {
              type: 'text',
              text: certificate,
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database Replicas
  server.tool(
    'digitalocean_list_database_replicas',
    `List all read replicas for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ database_id, format }) => {
      try {
        const replicas = await client.listDatabaseReplicas(database_id);
        return formatResponse({ items: replicas, count: replicas.length, hasMore: false }, format, 'replicas');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Database Replica
  server.tool(
    'digitalocean_create_database_replica',
    `Create a read replica for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      name: z.string().describe('Replica name'),
      size: z.string().optional().describe('Droplet size slug'),
      region: z.string().optional().describe('Region slug'),
      tags: z.array(z.string()).optional(),
    },
    async ({ database_id, name, size, region, tags }) => {
      try {
        const replica = await client.createDatabaseReplica(database_id, name, size, region, tags);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Database replica created', replica }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Database Replica
  server.tool(
    'digitalocean_delete_database_replica',
    `Delete a read replica.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      replica_name: z.string().describe('Replica name'),
    },
    async ({ database_id, replica_name }) => {
      try {
        await client.deleteDatabaseReplica(database_id, replica_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Replica ${replica_name} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Promote Database Replica
  server.tool(
    'digitalocean_promote_database_replica',
    `Promote a read replica to primary.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      replica_name: z.string().describe('Replica name'),
    },
    async ({ database_id, replica_name }) => {
      try {
        await client.promoteDatabaseReplica(database_id, replica_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Replica ${replica_name} promoted to primary` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database Users
  server.tool(
    'digitalocean_list_database_users',
    `List all users for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const users = await client.listDatabaseUsers(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ users }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Database User
  server.tool(
    'digitalocean_create_database_user',
    `Create a new database user.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      name: z.string().describe('Username'),
      mysql_auth_plugin: z.enum(['mysql_native_password', 'caching_sha2_password']).optional().describe('MySQL auth plugin'),
    },
    async ({ database_id, name, mysql_auth_plugin }) => {
      try {
        const user = await client.createDatabaseUser(database_id, name, mysql_auth_plugin);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Database user created', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Database User
  server.tool(
    'digitalocean_delete_database_user',
    `Delete a database user.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      username: z.string().describe('Username'),
    },
    async ({ database_id, username }) => {
      try {
        await client.deleteDatabaseUser(database_id, username);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${username} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Reset Database User Auth
  server.tool(
    'digitalocean_reset_database_user_auth',
    `Reset authentication for a database user.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      username: z.string().describe('Username'),
      mysql_auth_plugin: z.enum(['mysql_native_password', 'caching_sha2_password']).optional(),
    },
    async ({ database_id, username, mysql_auth_plugin }) => {
      try {
        const user = await client.resetDatabaseUserAuth(database_id, username, mysql_auth_plugin);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User auth reset', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database DBs
  server.tool(
    'digitalocean_list_database_dbs',
    `List all databases in a cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const dbs = await client.listDatabaseDbs(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ databases: dbs }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Database DB
  server.tool(
    'digitalocean_create_database_db',
    `Create a new database in a cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      name: z.string().describe('Database name'),
    },
    async ({ database_id, name }) => {
      try {
        const db = await client.createDatabaseDb(database_id, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Database created', database: db }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Database DB
  server.tool(
    'digitalocean_delete_database_db',
    `Delete a database from a cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      db_name: z.string().describe('Database name'),
    },
    async ({ database_id, db_name }) => {
      try {
        await client.deleteDatabaseDb(database_id, db_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Database ${db_name} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database Pools
  server.tool(
    'digitalocean_list_database_pools',
    `List all connection pools for a PostgreSQL database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const pools = await client.listDatabasePools(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ pools }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create Database Pool
  server.tool(
    'digitalocean_create_database_pool',
    `Create a connection pool for a PostgreSQL database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      name: z.string().describe('Pool name'),
      mode: z.enum(['transaction', 'session', 'statement']).describe('Pool mode'),
      size: z.number().int().describe('Pool size'),
      db: z.string().describe('Database name'),
      user: z.string().describe('Username'),
    },
    async ({ database_id, name, mode, size, db, user }) => {
      try {
        const pool = await client.createDatabasePool(database_id, name, mode, size, db, user);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Connection pool created', pool }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete Database Pool
  server.tool(
    'digitalocean_delete_database_pool',
    `Delete a connection pool.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      pool_name: z.string().describe('Pool name'),
    },
    async ({ database_id, pool_name }) => {
      try {
        await client.deleteDatabasePool(database_id, pool_name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Pool ${pool_name} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List Database Firewall Rules
  server.tool(
    'digitalocean_list_database_firewall_rules',
    `List firewall rules for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
    },
    async ({ database_id }) => {
      try {
        const rules = await client.listDatabaseFirewallRules(database_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ rules }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update Database Firewall Rules
  server.tool(
    'digitalocean_update_database_firewall_rules',
    `Update firewall rules for a database cluster.`,
    {
      database_id: z.string().describe('Database cluster UUID'),
      rules: z.array(z.object({
        type: z.enum(['droplet', 'k8s', 'ip_addr', 'tag', 'app']).describe('Rule type'),
        value: z.string().describe('Rule value (IP, droplet ID, tag, etc.)'),
      })).describe('Firewall rules'),
    },
    async ({ database_id, rules }) => {
      try {
        await client.updateDatabaseFirewallRules(database_id, rules);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Firewall rules updated' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
