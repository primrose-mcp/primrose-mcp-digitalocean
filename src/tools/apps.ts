/**
 * App Platform Tools for DigitalOcean MCP Server
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DigitalOceanClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerAppTools(server: McpServer, client: DigitalOceanClient): void {
  // List Apps
  server.tool(
    'digitalocean_list_apps',
    `List all apps in App Platform.`,
    {
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ per_page, page, format }) => {
      try {
        const result = await client.listApps({ per_page, page });
        return formatResponse(result, format, 'apps');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get App
  server.tool(
    'digitalocean_get_app',
    `Get details of a specific app.`,
    {
      app_id: z.string().describe('App UUID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ app_id, format }) => {
      try {
        const app = await client.getApp(app_id);
        return formatResponse(app, format, 'app');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create App
  server.tool(
    'digitalocean_create_app',
    `Create a new app in App Platform. Provide a complete app spec.`,
    {
      spec: z.object({
        name: z.string().describe('App name'),
        region: z.string().optional().describe('Region slug'),
        services: z.array(z.object({
          name: z.string(),
          github: z.object({
            repo: z.string(),
            branch: z.string().optional(),
            deploy_on_push: z.boolean().optional(),
          }).optional(),
          git: z.object({
            repo_clone_url: z.string(),
            branch: z.string().optional(),
          }).optional(),
          image: z.object({
            registry_type: z.enum(['DOCR', 'DOCKER_HUB', 'GHCR']),
            repository: z.string(),
            tag: z.string().optional(),
          }).optional(),
          dockerfile_path: z.string().optional(),
          build_command: z.string().optional(),
          run_command: z.string().optional(),
          http_port: z.number().int().optional(),
          instance_count: z.number().int().optional(),
          instance_size_slug: z.string().optional(),
          envs: z.array(z.object({
            key: z.string(),
            value: z.string().optional(),
            scope: z.enum(['RUN_TIME', 'BUILD_TIME', 'RUN_AND_BUILD_TIME']).optional(),
            type: z.enum(['GENERAL', 'SECRET']).optional(),
          })).optional(),
        })).optional().describe('Services'),
        static_sites: z.array(z.object({
          name: z.string(),
          github: z.object({
            repo: z.string(),
            branch: z.string().optional(),
            deploy_on_push: z.boolean().optional(),
          }).optional(),
          build_command: z.string().optional(),
          output_dir: z.string().optional(),
          index_document: z.string().optional(),
          error_document: z.string().optional(),
        })).optional().describe('Static sites'),
        workers: z.array(z.object({
          name: z.string(),
          github: z.object({
            repo: z.string(),
            branch: z.string().optional(),
          }).optional(),
          run_command: z.string().optional(),
          instance_count: z.number().int().optional(),
          instance_size_slug: z.string().optional(),
        })).optional().describe('Workers'),
        jobs: z.array(z.object({
          name: z.string(),
          github: z.object({
            repo: z.string(),
            branch: z.string().optional(),
          }).optional(),
          run_command: z.string().optional(),
          kind: z.enum(['UNSPECIFIED', 'PRE_DEPLOY', 'POST_DEPLOY', 'FAILED_DEPLOY']).optional(),
        })).optional().describe('Jobs'),
        databases: z.array(z.object({
          name: z.string(),
          engine: z.enum(['UNSET', 'MYSQL', 'PG', 'REDIS', 'MONGODB', 'KAFKA', 'OPENSEARCH']).optional(),
          production: z.boolean().optional(),
        })).optional().describe('Databases'),
      }).describe('App specification'),
      project_id: z.string().optional(),
    },
    async ({ spec, project_id }) => {
      try {
        const app = await client.createApp({ spec: spec as Parameters<typeof client.createApp>[0]['spec'], project_id });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'App created', app }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Update App
  server.tool(
    'digitalocean_update_app',
    `Update an existing app's spec.`,
    {
      app_id: z.string().describe('App UUID'),
      spec: z.record(z.string(), z.unknown()).describe('Updated app spec'),
    },
    async ({ app_id, spec }) => {
      try {
        const app = await client.updateApp(app_id, spec);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'App updated', app }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Delete App
  server.tool(
    'digitalocean_delete_app',
    `Delete an app.`,
    {
      app_id: z.string().describe('App UUID'),
    },
    async ({ app_id }) => {
      try {
        await client.deleteApp(app_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `App ${app_id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List App Deployments
  server.tool(
    'digitalocean_list_app_deployments',
    `List all deployments for an app.`,
    {
      app_id: z.string().describe('App UUID'),
      per_page: z.number().int().min(1).max(200).default(20).optional(),
      page: z.number().int().min(1).optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ app_id, per_page, page, format }) => {
      try {
        const result = await client.listAppDeployments(app_id, { per_page, page });
        return formatResponse(result, format, 'deployments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get App Deployment
  server.tool(
    'digitalocean_get_app_deployment',
    `Get details of a specific deployment.`,
    {
      app_id: z.string().describe('App UUID'),
      deployment_id: z.string().describe('Deployment UUID'),
    },
    async ({ app_id, deployment_id }) => {
      try {
        const deployment = await client.getAppDeployment(app_id, deployment_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(deployment, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Create App Deployment
  server.tool(
    'digitalocean_create_app_deployment',
    `Trigger a new deployment for an app.`,
    {
      app_id: z.string().describe('App UUID'),
      force_build: z.boolean().optional().describe('Force rebuild of components'),
    },
    async ({ app_id, force_build }) => {
      try {
        const deployment = await client.createAppDeployment(app_id, force_build);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Deployment triggered', deployment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Cancel App Deployment
  server.tool(
    'digitalocean_cancel_app_deployment',
    `Cancel a running deployment.`,
    {
      app_id: z.string().describe('App UUID'),
      deployment_id: z.string().describe('Deployment UUID'),
    },
    async ({ app_id, deployment_id }) => {
      try {
        const deployment = await client.cancelAppDeployment(app_id, deployment_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Deployment cancelled', deployment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Get App Logs
  server.tool(
    'digitalocean_get_app_logs',
    `Get logs for an app or component.`,
    {
      app_id: z.string().describe('App UUID'),
      deployment_id: z.string().optional().describe('Deployment UUID'),
      component_name: z.string().optional().describe('Component name'),
      type: z.enum(['BUILD', 'DEPLOY', 'RUN', 'RUN_RESTARTED']).optional().describe('Log type'),
      follow: z.boolean().optional().describe('Follow log stream'),
    },
    async ({ app_id, deployment_id, component_name, type, follow }) => {
      try {
        const logs = await client.getAppLogs(app_id, deployment_id, component_name, type, follow);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(logs, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List App Regions
  server.tool(
    'digitalocean_list_app_regions',
    `List all available regions for App Platform.`,
    {},
    async () => {
      try {
        const regions = await client.listAppRegions();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ regions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // List App Instance Sizes
  server.tool(
    'digitalocean_list_app_instance_sizes',
    `List all available instance sizes for App Platform.`,
    {},
    async () => {
      try {
        const sizes = await client.listAppInstanceSizes();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ instance_sizes: sizes }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Propose App
  server.tool(
    'digitalocean_propose_app',
    `Validate an app spec and get deployment info without creating.`,
    {
      spec: z.record(z.string(), z.unknown()).describe('App spec to validate'),
    },
    async ({ spec }) => {
      try {
        const result = await client.proposeApp(spec);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
