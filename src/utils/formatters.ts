/**
 * Response Formatting Utilities for DigitalOcean MCP Server
 */

import type {
  App,
  Database,
  Droplet,
  Firewall,
  KubernetesCluster,
  LoadBalancer,
  PaginatedResponse,
  ResponseFormat,
  Volume,
  VPC,
} from '../types/entities.js';
import { DigitalOceanApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof DigitalOceanApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items)
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  if (data.total !== undefined) {
    lines.push(`**Total:** ${data.total} | **Showing:** ${data.count}`);
  } else {
    lines.push(`**Showing:** ${data.count}`);
  }

  if (data.hasMore) {
    lines.push(`**More available:** Yes (next page: ${data.nextPage})`);
  }
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  switch (entityType) {
    case 'droplets':
      lines.push(formatDropletsTable(data.items as Droplet[]));
      break;
    case 'volumes':
      lines.push(formatVolumesTable(data.items as Volume[]));
      break;
    case 'firewalls':
      lines.push(formatFirewallsTable(data.items as Firewall[]));
      break;
    case 'load_balancers':
      lines.push(formatLoadBalancersTable(data.items as LoadBalancer[]));
      break;
    case 'vpcs':
      lines.push(formatVPCsTable(data.items as VPC[]));
      break;
    case 'kubernetes_clusters':
      lines.push(formatKubernetesClustersTable(data.items as KubernetesCluster[]));
      break;
    case 'databases':
      lines.push(formatDatabasesTable(data.items as Database[]));
      break;
    case 'apps':
      lines.push(formatAppsTable(data.items as App[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

/**
 * Format droplets as Markdown table
 */
function formatDropletsTable(droplets: Droplet[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | IP | Region | Size |');
  lines.push('|---|---|---|---|---|---|');

  for (const droplet of droplets) {
    const publicIp = droplet.networks?.v4?.find((n) => n.type === 'public')?.ip_address || '-';
    lines.push(
      `| ${droplet.id} | ${droplet.name} | ${droplet.status} | ${publicIp} | ${droplet.region?.slug || '-'} | ${droplet.size_slug} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format volumes as Markdown table
 */
function formatVolumesTable(volumes: Volume[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Size (GB) | Region | Attached To |');
  lines.push('|---|---|---|---|---|');

  for (const volume of volumes) {
    const attachedTo = volume.droplet_ids?.join(', ') || 'Not attached';
    lines.push(
      `| ${volume.id} | ${volume.name} | ${volume.size_gigabytes} | ${volume.region?.slug || '-'} | ${attachedTo} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format firewalls as Markdown table
 */
function formatFirewallsTable(firewalls: Firewall[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Status | Droplets | Inbound Rules | Outbound Rules |');
  lines.push('|---|---|---|---|---|---|');

  for (const firewall of firewalls) {
    lines.push(
      `| ${firewall.id} | ${firewall.name} | ${firewall.status} | ${firewall.droplet_ids?.length || 0} | ${firewall.inbound_rules?.length || 0} | ${firewall.outbound_rules?.length || 0} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format load balancers as Markdown table
 */
function formatLoadBalancersTable(loadBalancers: LoadBalancer[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | IP | Status | Region | Droplets |');
  lines.push('|---|---|---|---|---|---|');

  for (const lb of loadBalancers) {
    lines.push(
      `| ${lb.id} | ${lb.name} | ${lb.ip || '-'} | ${lb.status} | ${lb.region?.slug || '-'} | ${lb.droplet_ids?.length || 0} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format VPCs as Markdown table
 */
function formatVPCsTable(vpcs: VPC[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Region | IP Range | Default |');
  lines.push('|---|---|---|---|---|');

  for (const vpc of vpcs) {
    lines.push(
      `| ${vpc.id} | ${vpc.name} | ${vpc.region} | ${vpc.ip_range} | ${vpc.default ? 'Yes' : 'No'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format Kubernetes clusters as Markdown table
 */
function formatKubernetesClustersTable(clusters: KubernetesCluster[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Region | Version | Status | Node Pools |');
  lines.push('|---|---|---|---|---|---|');

  for (const cluster of clusters) {
    lines.push(
      `| ${cluster.id} | ${cluster.name} | ${cluster.region} | ${cluster.version} | ${cluster.status?.state || '-'} | ${cluster.node_pools?.length || 0} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format databases as Markdown table
 */
function formatDatabasesTable(databases: Database[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Engine | Version | Size | Region | Status |');
  lines.push('|---|---|---|---|---|---|---|');

  for (const db of databases) {
    lines.push(
      `| ${db.id} | ${db.name} | ${db.engine} | ${db.version} | ${db.size} | ${db.region} | ${db.status} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format apps as Markdown table
 */
function formatAppsTable(apps: App[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Region | Tier | Live URL |');
  lines.push('|---|---|---|---|---|');

  for (const app of apps) {
    lines.push(
      `| ${app.id} | ${app.spec?.name || '-'} | ${app.region?.slug || '-'} | ${app.tier_slug || '-'} | ${app.live_url || '-'} |`
    );
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 6);

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => {
      const val = record[k];
      if (val === null || val === undefined) return '-';
      if (typeof val === 'object') return '[object]';
      return String(val).substring(0, 50);
    });
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  return formatGenericTable(data);
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (snake_case to Title Case)
 */
function formatKey(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
