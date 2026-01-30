# DigitalOcean MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/digitalocean)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for DigitalOcean. Manage cloud infrastructure including Droplets, Kubernetes, databases, domains, and more through a standardized interface.

## Features

- **Droplet Management** - Create, resize, and manage cloud servers
- **Kubernetes Clusters** - Deploy and manage Kubernetes clusters
- **Managed Databases** - Work with PostgreSQL, MySQL, Redis, and MongoDB
- **Domain Management** - Configure DNS records and domains
- **Block Storage** - Manage volumes and snapshots
- **Firewalls** - Configure cloud firewalls
- **Load Balancers** - Set up and manage load balancers
- **VPC Networks** - Manage virtual private clouds
- **Images** - Work with snapshots and custom images
- **SSH Keys** - Manage SSH key access
- **App Platform** - Deploy and manage applications

## Quick Start

The recommended way to use this MCP server is through the [Primrose SDK](https://www.npmjs.com/package/primrose-mcp):

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseClient } from 'primrose-mcp';

const client = new PrimroseClient({
  service: 'digitalocean',
  headers: {
    'X-DigitalOcean-Token': 'your-api-token'
  }
});

// List all droplets
const droplets = await client.call('digitalocean_list_droplets', {});
```

## Manual Installation

If you prefer to run the MCP server directly:

```bash
# Clone the repository
git clone https://github.com/primrose-ai/primrose-mcp-digitalocean.git
cd primrose-mcp-digitalocean

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-DigitalOcean-Token` | Your DigitalOcean API token |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-DigitalOcean-Base-URL` | Override the default API base URL |

### Getting Your API Token

1. Log in to the [DigitalOcean Control Panel](https://cloud.digitalocean.com)
2. Click "API" in the left sidebar
3. Click "Generate New Token"
4. Give it a name and select Read/Write scope
5. Copy the token and use it as your `X-DigitalOcean-Token`

## Available Tools

### Droplet Tools
- `digitalocean_list_droplets` - List all Droplets
- `digitalocean_get_droplet` - Get Droplet details
- `digitalocean_create_droplet` - Create a new Droplet
- `digitalocean_delete_droplet` - Delete a Droplet
- `digitalocean_droplet_action` - Perform actions (power on/off, reboot, resize)
- `digitalocean_list_droplet_snapshots` - List Droplet snapshots

### Kubernetes Tools
- `digitalocean_list_kubernetes_clusters` - List Kubernetes clusters
- `digitalocean_get_kubernetes_cluster` - Get cluster details
- `digitalocean_create_kubernetes_cluster` - Create a cluster
- `digitalocean_delete_kubernetes_cluster` - Delete a cluster
- `digitalocean_get_kubeconfig` - Get cluster kubeconfig

### Database Tools
- `digitalocean_list_databases` - List database clusters
- `digitalocean_get_database` - Get database details
- `digitalocean_create_database` - Create a database cluster
- `digitalocean_delete_database` - Delete a database cluster
- `digitalocean_list_database_users` - List database users
- `digitalocean_create_database_user` - Create a database user

### Domain Tools
- `digitalocean_list_domains` - List all domains
- `digitalocean_get_domain` - Get domain details
- `digitalocean_create_domain` - Add a domain
- `digitalocean_delete_domain` - Remove a domain
- `digitalocean_list_domain_records` - List DNS records
- `digitalocean_create_domain_record` - Create a DNS record

### Volume Tools
- `digitalocean_list_volumes` - List block storage volumes
- `digitalocean_get_volume` - Get volume details
- `digitalocean_create_volume` - Create a volume
- `digitalocean_delete_volume` - Delete a volume
- `digitalocean_attach_volume` - Attach volume to Droplet

### Firewall Tools
- `digitalocean_list_firewalls` - List firewalls
- `digitalocean_get_firewall` - Get firewall details
- `digitalocean_create_firewall` - Create a firewall
- `digitalocean_update_firewall` - Update firewall rules
- `digitalocean_delete_firewall` - Delete a firewall

### Load Balancer Tools
- `digitalocean_list_load_balancers` - List load balancers
- `digitalocean_get_load_balancer` - Get load balancer details
- `digitalocean_create_load_balancer` - Create a load balancer
- `digitalocean_delete_load_balancer` - Delete a load balancer

### VPC Tools
- `digitalocean_list_vpcs` - List VPCs
- `digitalocean_get_vpc` - Get VPC details
- `digitalocean_create_vpc` - Create a VPC
- `digitalocean_delete_vpc` - Delete a VPC

### Image Tools
- `digitalocean_list_images` - List available images
- `digitalocean_get_image` - Get image details
- `digitalocean_delete_image` - Delete a custom image

### SSH Key Tools
- `digitalocean_list_ssh_keys` - List SSH keys
- `digitalocean_get_ssh_key` - Get SSH key details
- `digitalocean_create_ssh_key` - Add an SSH key
- `digitalocean_delete_ssh_key` - Remove an SSH key

### App Platform Tools
- `digitalocean_list_apps` - List App Platform apps
- `digitalocean_get_app` - Get app details
- `digitalocean_create_app` - Deploy an app
- `digitalocean_delete_app` - Delete an app

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [DigitalOcean API Documentation](https://docs.digitalocean.com/reference/api/)
- [Model Context Protocol](https://modelcontextprotocol.io)
