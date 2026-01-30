/**
 * DigitalOcean API Client
 *
 * Handles all HTTP communication with the DigitalOcean API.
 * Base URL: https://api.digitalocean.com/v2
 */

import type {
  Account,
  Action,
  AlertPolicy,
  AlertPolicyCreateInput,
  App,
  AppCreateInput,
  Balance,
  BillingHistory,
  CDNEndpoint,
  CDNEndpointCreateInput,
  Certificate,
  CertificateCreateInput,
  ContainerRegistry,
  ContainerRepository,
  ContainerRepositoryTag,
  Database,
  DatabaseCreateInput,
  DatabaseFirewallRule,
  DatabasePool,
  DatabaseReplica,
  DatabaseUser,
  Domain,
  DomainRecord,
  DomainRecordCreateInput,
  Droplet,
  DropletCreateInput,
  Firewall,
  FirewallCreateInput,
  FirewallRule,
  FunctionsNamespace,
  FunctionsNamespaceCreateInput,
  FunctionsTrigger,
  FunctionsTriggerCreateInput,
  Image,
  Invoice,
  InvoiceItem,
  KubernetesCluster,
  KubernetesClusterCreateInput,
  KubernetesNodePool,
  KubernetesNodePoolCreateInput,
  KubernetesOptions,
  Links,
  LoadBalancer,
  LoadBalancerCreateInput,
  Meta,
  PaginatedResponse,
  PaginationParams,
  Project,
  ProjectCreateInput,
  ProjectResource,
  Region,
  ReservedIP,
  Size,
  Snapshot,
  SpacesKey,
  SpacesKeyCreateInput,
  SSHKey,
  SSHKeyCreateInput,
  Tag,
  TenantCredentials,
  UptimeAlert,
  UptimeAlertCreateInput,
  UptimeCheck,
  UptimeCheckCreateInput,
  Volume,
  VolumeCreateInput,
  VPC,
  VPCCreateInput,
  VPCMember,
} from './types/index.js';
import { AuthenticationError, DigitalOceanApiError, RateLimitError } from './utils/errors.js';

const API_BASE_URL = 'https://api.digitalocean.com/v2';

export interface DigitalOceanClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Account
  getAccount(): Promise<Account>;

  // Droplets
  listDroplets(params?: PaginationParams & { tag_name?: string }): Promise<PaginatedResponse<Droplet>>;
  getDroplet(dropletId: number): Promise<Droplet>;
  createDroplet(input: DropletCreateInput): Promise<Droplet | Droplet[]>;
  deleteDroplet(dropletId: number): Promise<void>;
  deleteDropletsByTag(tagName: string): Promise<void>;
  listDropletActions(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Action>>;
  performDropletAction(dropletId: number, action: string, params?: Record<string, unknown>): Promise<Action>;
  performDropletActionByTag(tagName: string, action: string, params?: Record<string, unknown>): Promise<Action[]>;
  listDropletSnapshots(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>>;
  listDropletBackups(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>>;
  listDropletKernels(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<unknown>>;
  listDropletFirewalls(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Firewall>>;
  listDropletNeighbors(dropletId: number): Promise<Droplet[]>;

  // Images
  listImages(params?: PaginationParams & { type?: string; private?: boolean }): Promise<PaginatedResponse<Image>>;
  getImage(imageId: number | string): Promise<Image>;
  updateImage(imageId: number, name: string, description?: string, distribution?: string): Promise<Image>;
  deleteImage(imageId: number): Promise<void>;
  listImageActions(imageId: number, params?: PaginationParams): Promise<PaginatedResponse<Action>>;
  performImageAction(imageId: number, action: string, params?: Record<string, unknown>): Promise<Action>;

  // Regions
  listRegions(params?: PaginationParams): Promise<PaginatedResponse<Region>>;

  // Sizes
  listSizes(params?: PaginationParams): Promise<PaginatedResponse<Size>>;

  // SSH Keys
  listSSHKeys(params?: PaginationParams): Promise<PaginatedResponse<SSHKey>>;
  getSSHKey(keyId: number | string): Promise<SSHKey>;
  createSSHKey(input: SSHKeyCreateInput): Promise<SSHKey>;
  updateSSHKey(keyId: number | string, name: string): Promise<SSHKey>;
  deleteSSHKey(keyId: number | string): Promise<void>;

  // Domains
  listDomains(params?: PaginationParams): Promise<PaginatedResponse<Domain>>;
  getDomain(domainName: string): Promise<Domain>;
  createDomain(name: string, ipAddress?: string): Promise<Domain>;
  deleteDomain(domainName: string): Promise<void>;

  // Domain Records
  listDomainRecords(domainName: string, params?: PaginationParams): Promise<PaginatedResponse<DomainRecord>>;
  getDomainRecord(domainName: string, recordId: number): Promise<DomainRecord>;
  createDomainRecord(domainName: string, input: DomainRecordCreateInput): Promise<DomainRecord>;
  updateDomainRecord(domainName: string, recordId: number, input: Partial<DomainRecordCreateInput>): Promise<DomainRecord>;
  deleteDomainRecord(domainName: string, recordId: number): Promise<void>;

  // Volumes
  listVolumes(params?: PaginationParams & { name?: string; region?: string }): Promise<PaginatedResponse<Volume>>;
  getVolume(volumeId: string): Promise<Volume>;
  createVolume(input: VolumeCreateInput): Promise<Volume>;
  deleteVolume(volumeId: string): Promise<void>;
  deleteVolumeByName(name: string, region: string): Promise<void>;
  listVolumeSnapshots(volumeId: string, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>>;
  createVolumeSnapshot(volumeId: string, name: string, tags?: string[]): Promise<Snapshot>;
  listVolumeActions(volumeId: string, params?: PaginationParams): Promise<PaginatedResponse<Action>>;
  performVolumeAction(volumeId: string, action: string, params?: Record<string, unknown>): Promise<Action>;

  // Snapshots
  listSnapshots(params?: PaginationParams & { resource_type?: 'droplet' | 'volume' }): Promise<PaginatedResponse<Snapshot>>;
  getSnapshot(snapshotId: string): Promise<Snapshot>;
  deleteSnapshot(snapshotId: string): Promise<void>;

  // Firewalls
  listFirewalls(params?: PaginationParams): Promise<PaginatedResponse<Firewall>>;
  getFirewall(firewallId: string): Promise<Firewall>;
  createFirewall(input: FirewallCreateInput): Promise<Firewall>;
  updateFirewall(firewallId: string, input: FirewallCreateInput): Promise<Firewall>;
  deleteFirewall(firewallId: string): Promise<void>;
  addDropletsToFirewall(firewallId: string, dropletIds: number[]): Promise<void>;
  removeDropletsFromFirewall(firewallId: string, dropletIds: number[]): Promise<void>;
  addTagsToFirewall(firewallId: string, tags: string[]): Promise<void>;
  removeTagsFromFirewall(firewallId: string, tags: string[]): Promise<void>;
  addRulesToFirewall(firewallId: string, inboundRules?: FirewallRule[], outboundRules?: FirewallRule[]): Promise<void>;
  removeRulesFromFirewall(firewallId: string, inboundRules?: FirewallRule[], outboundRules?: FirewallRule[]): Promise<void>;

  // Load Balancers
  listLoadBalancers(params?: PaginationParams): Promise<PaginatedResponse<LoadBalancer>>;
  getLoadBalancer(lbId: string): Promise<LoadBalancer>;
  createLoadBalancer(input: LoadBalancerCreateInput): Promise<LoadBalancer>;
  updateLoadBalancer(lbId: string, input: Partial<LoadBalancerCreateInput>): Promise<LoadBalancer>;
  deleteLoadBalancer(lbId: string): Promise<void>;
  addDropletsToLoadBalancer(lbId: string, dropletIds: number[]): Promise<void>;
  removeDropletsFromLoadBalancer(lbId: string, dropletIds: number[]): Promise<void>;

  // VPCs
  listVPCs(params?: PaginationParams): Promise<PaginatedResponse<VPC>>;
  getVPC(vpcId: string): Promise<VPC>;
  createVPC(input: VPCCreateInput): Promise<VPC>;
  updateVPC(vpcId: string, name: string, description?: string): Promise<VPC>;
  deleteVPC(vpcId: string): Promise<void>;
  listVPCMembers(vpcId: string, params?: PaginationParams): Promise<PaginatedResponse<VPCMember>>;

  // Kubernetes
  listKubernetesClusters(params?: PaginationParams): Promise<PaginatedResponse<KubernetesCluster>>;
  getKubernetesCluster(clusterId: string): Promise<KubernetesCluster>;
  createKubernetesCluster(input: KubernetesClusterCreateInput): Promise<KubernetesCluster>;
  updateKubernetesCluster(clusterId: string, name: string, autoUpgrade?: boolean, maintenancePolicy?: unknown): Promise<KubernetesCluster>;
  deleteKubernetesCluster(clusterId: string): Promise<void>;
  getKubernetesKubeconfig(clusterId: string): Promise<string>;
  getKubernetesCredentials(clusterId: string): Promise<unknown>;
  listKubernetesNodePools(clusterId: string): Promise<KubernetesNodePool[]>;
  getKubernetesNodePool(clusterId: string, nodePoolId: string): Promise<KubernetesNodePool>;
  addKubernetesNodePool(clusterId: string, input: KubernetesNodePoolCreateInput): Promise<KubernetesNodePool>;
  updateKubernetesNodePool(clusterId: string, nodePoolId: string, input: Partial<KubernetesNodePoolCreateInput>): Promise<KubernetesNodePool>;
  deleteKubernetesNodePool(clusterId: string, nodePoolId: string): Promise<void>;
  deleteKubernetesNode(clusterId: string, nodePoolId: string, nodeId: string, replace?: boolean, skipDrain?: boolean): Promise<void>;
  upgradeKubernetesCluster(clusterId: string, version: string): Promise<void>;
  listKubernetesAvailableUpgrades(clusterId: string): Promise<unknown[]>;
  getKubernetesOptions(): Promise<KubernetesOptions>;

  // Databases
  listDatabases(params?: PaginationParams): Promise<PaginatedResponse<Database>>;
  getDatabase(databaseId: string): Promise<Database>;
  createDatabase(input: DatabaseCreateInput): Promise<Database>;
  deleteDatabase(databaseId: string): Promise<void>;
  resizeDatabase(databaseId: string, size: string, numNodes: number): Promise<void>;
  migrateDatabase(databaseId: string, region: string): Promise<void>;
  listDatabaseBackups(databaseId: string): Promise<unknown[]>;
  getDatabaseCA(databaseId: string): Promise<string>;
  listDatabaseReplicas(databaseId: string): Promise<DatabaseReplica[]>;
  getDatabaseReplica(databaseId: string, replicaName: string): Promise<DatabaseReplica>;
  createDatabaseReplica(databaseId: string, name: string, size?: string, region?: string, tags?: string[]): Promise<DatabaseReplica>;
  deleteDatabaseReplica(databaseId: string, replicaName: string): Promise<void>;
  promoteDatabaseReplica(databaseId: string, replicaName: string): Promise<void>;
  listDatabaseUsers(databaseId: string): Promise<DatabaseUser[]>;
  getDatabaseUser(databaseId: string, username: string): Promise<DatabaseUser>;
  createDatabaseUser(databaseId: string, name: string, mysqlAuthPlugin?: string): Promise<DatabaseUser>;
  deleteDatabaseUser(databaseId: string, username: string): Promise<void>;
  resetDatabaseUserAuth(databaseId: string, username: string, mysqlAuthPlugin?: string): Promise<DatabaseUser>;
  listDatabaseDbs(databaseId: string): Promise<{ name: string }[]>;
  getDatabaseDb(databaseId: string, dbName: string): Promise<{ name: string }>;
  createDatabaseDb(databaseId: string, name: string): Promise<{ name: string }>;
  deleteDatabaseDb(databaseId: string, dbName: string): Promise<void>;
  listDatabasePools(databaseId: string): Promise<DatabasePool[]>;
  getDatabasePool(databaseId: string, poolName: string): Promise<DatabasePool>;
  createDatabasePool(databaseId: string, name: string, mode: string, size: number, db: string, user: string): Promise<DatabasePool>;
  updateDatabasePool(databaseId: string, poolName: string, mode: string, size: number, db: string, user: string): Promise<DatabasePool>;
  deleteDatabasePool(databaseId: string, poolName: string): Promise<void>;
  listDatabaseFirewallRules(databaseId: string): Promise<DatabaseFirewallRule[]>;
  updateDatabaseFirewallRules(databaseId: string, rules: Array<{ type: string; value: string }>): Promise<void>;

  // Apps (App Platform)
  listApps(params?: PaginationParams): Promise<PaginatedResponse<App>>;
  getApp(appId: string): Promise<App>;
  createApp(input: AppCreateInput): Promise<App>;
  updateApp(appId: string, spec: unknown): Promise<App>;
  deleteApp(appId: string): Promise<void>;
  listAppDeployments(appId: string, params?: PaginationParams): Promise<PaginatedResponse<unknown>>;
  getAppDeployment(appId: string, deploymentId: string): Promise<unknown>;
  createAppDeployment(appId: string, forceBuild?: boolean): Promise<unknown>;
  cancelAppDeployment(appId: string, deploymentId: string): Promise<unknown>;
  getAppLogs(appId: string, deploymentId?: string, componentName?: string, type?: string, follow?: boolean): Promise<unknown>;
  listAppRegions(): Promise<unknown[]>;
  listAppTiers(): Promise<unknown[]>;
  listAppInstanceSizes(): Promise<unknown[]>;
  proposeApp(spec: unknown): Promise<unknown>;

  // Tags
  listTags(params?: PaginationParams): Promise<PaginatedResponse<Tag>>;
  getTag(tagName: string): Promise<Tag>;
  createTag(name: string): Promise<Tag>;
  deleteTag(tagName: string): Promise<void>;
  tagResources(tagName: string, resources: Array<{ resource_id: string; resource_type: string }>): Promise<void>;
  untagResources(tagName: string, resources: Array<{ resource_id: string; resource_type: string }>): Promise<void>;

  // Projects
  listProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>>;
  getProject(projectId: string): Promise<Project>;
  getDefaultProject(): Promise<Project>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateProject(projectId: string, input: Partial<ProjectCreateInput>): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
  listProjectResources(projectId: string, params?: PaginationParams): Promise<PaginatedResponse<ProjectResource>>;
  assignResourcesToProject(projectId: string, resources: string[]): Promise<ProjectResource[]>;

  // Reserved IPs
  listReservedIPs(params?: PaginationParams): Promise<PaginatedResponse<ReservedIP>>;
  getReservedIP(ip: string): Promise<ReservedIP>;
  createReservedIP(region?: string, dropletId?: number, projectId?: string): Promise<ReservedIP>;
  deleteReservedIP(ip: string): Promise<void>;
  listReservedIPActions(ip: string, params?: PaginationParams): Promise<PaginatedResponse<Action>>;
  performReservedIPAction(ip: string, action: string, dropletId?: number): Promise<Action>;

  // Certificates
  listCertificates(params?: PaginationParams): Promise<PaginatedResponse<Certificate>>;
  getCertificate(certificateId: string): Promise<Certificate>;
  createCertificate(input: CertificateCreateInput): Promise<Certificate>;
  deleteCertificate(certificateId: string): Promise<void>;

  // CDN Endpoints
  listCDNEndpoints(params?: PaginationParams): Promise<PaginatedResponse<CDNEndpoint>>;
  getCDNEndpoint(cdnId: string): Promise<CDNEndpoint>;
  createCDNEndpoint(input: CDNEndpointCreateInput): Promise<CDNEndpoint>;
  updateCDNEndpoint(cdnId: string, ttl?: number, certificateId?: string, customDomain?: string): Promise<CDNEndpoint>;
  deleteCDNEndpoint(cdnId: string): Promise<void>;
  purgeCDNCache(cdnId: string, files: string[]): Promise<void>;

  // Uptime
  listUptimeChecks(params?: PaginationParams): Promise<PaginatedResponse<UptimeCheck>>;
  getUptimeCheck(checkId: string): Promise<UptimeCheck>;
  createUptimeCheck(input: UptimeCheckCreateInput): Promise<UptimeCheck>;
  updateUptimeCheck(checkId: string, input: Partial<UptimeCheckCreateInput>): Promise<UptimeCheck>;
  deleteUptimeCheck(checkId: string): Promise<void>;
  getUptimeCheckState(checkId: string): Promise<unknown>;
  listUptimeAlerts(checkId: string, params?: PaginationParams): Promise<PaginatedResponse<UptimeAlert>>;
  getUptimeAlert(checkId: string, alertId: string): Promise<UptimeAlert>;
  createUptimeAlert(checkId: string, input: UptimeAlertCreateInput): Promise<UptimeAlert>;
  updateUptimeAlert(checkId: string, alertId: string, input: Partial<UptimeAlertCreateInput>): Promise<UptimeAlert>;
  deleteUptimeAlert(checkId: string, alertId: string): Promise<void>;

  // Monitoring
  listAlertPolicies(params?: PaginationParams): Promise<PaginatedResponse<AlertPolicy>>;
  getAlertPolicy(alertId: string): Promise<AlertPolicy>;
  createAlertPolicy(input: AlertPolicyCreateInput): Promise<AlertPolicy>;
  updateAlertPolicy(alertId: string, input: AlertPolicyCreateInput): Promise<AlertPolicy>;
  deleteAlertPolicy(alertId: string): Promise<void>;
  getDropletBandwidthMetrics(hostId: string, start: string, end: string, direction?: string, networkInterface?: string): Promise<unknown>;
  getDropletCPUMetrics(hostId: string, start: string, end: string): Promise<unknown>;
  getDropletMemoryMetrics(hostId: string, start: string, end: string, metric: string): Promise<unknown>;
  getDropletFilesystemMetrics(hostId: string, start: string, end: string, metric: string): Promise<unknown>;
  getDropletLoadMetrics(hostId: string, start: string, end: string, period: string): Promise<unknown>;

  // Functions
  listFunctionsNamespaces(params?: PaginationParams): Promise<PaginatedResponse<FunctionsNamespace>>;
  getFunctionsNamespace(namespaceId: string): Promise<FunctionsNamespace>;
  createFunctionsNamespace(input: FunctionsNamespaceCreateInput): Promise<FunctionsNamespace>;
  deleteFunctionsNamespace(namespaceId: string): Promise<void>;
  listFunctionsTriggers(namespaceId: string): Promise<FunctionsTrigger[]>;
  getFunctionsTrigger(namespaceId: string, triggerName: string): Promise<FunctionsTrigger>;
  createFunctionsTrigger(namespaceId: string, input: FunctionsTriggerCreateInput): Promise<FunctionsTrigger>;
  updateFunctionsTrigger(namespaceId: string, triggerName: string, input: Partial<FunctionsTriggerCreateInput>): Promise<FunctionsTrigger>;
  deleteFunctionsTrigger(namespaceId: string, triggerName: string): Promise<void>;

  // Container Registry
  getContainerRegistry(): Promise<ContainerRegistry>;
  createContainerRegistry(name: string, subscriptionTier: string, region?: string): Promise<ContainerRegistry>;
  deleteContainerRegistry(): Promise<void>;
  getDockerCredentials(readWrite?: boolean, expirySeconds?: number): Promise<unknown>;
  validateRegistryName(name: string): Promise<{ name: string; available: boolean }>;
  listContainerRepositories(registryName: string, params?: PaginationParams): Promise<PaginatedResponse<ContainerRepository>>;
  listContainerRepositoryTags(registryName: string, repositoryName: string, params?: PaginationParams): Promise<PaginatedResponse<ContainerRepositoryTag>>;
  deleteContainerRepositoryTag(registryName: string, repositoryName: string, tag: string): Promise<void>;
  deleteContainerRepositoryManifest(registryName: string, repositoryName: string, digest: string): Promise<void>;
  runGarbageCollection(registryName: string): Promise<unknown>;
  getGarbageCollection(registryName: string): Promise<unknown>;
  listGarbageCollections(registryName: string, params?: PaginationParams): Promise<PaginatedResponse<unknown>>;

  // Spaces Keys
  listSpacesKeys(params?: PaginationParams): Promise<PaginatedResponse<SpacesKey>>;
  getSpacesKey(accessKey: string): Promise<SpacesKey>;
  createSpacesKey(input: SpacesKeyCreateInput): Promise<SpacesKey>;
  updateSpacesKey(accessKey: string, name?: string, grants?: unknown[]): Promise<SpacesKey>;
  deleteSpacesKey(accessKey: string): Promise<void>;

  // Billing
  getBalance(): Promise<Balance>;
  listBillingHistory(params?: PaginationParams): Promise<PaginatedResponse<BillingHistory>>;
  listInvoices(params?: PaginationParams): Promise<PaginatedResponse<Invoice>>;
  getInvoice(invoiceId: string): Promise<Invoice>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  getInvoicePDF(invoiceId: string): Promise<ArrayBuffer>;
  getInvoiceCSV(invoiceId: string): Promise<string>;

  // Actions
  listActions(params?: PaginationParams): Promise<PaginatedResponse<Action>>;
  getAction(actionId: number): Promise<Action>;
}

class DigitalOceanClientImpl implements DigitalOceanClient {
  private credentials: TenantCredentials;
  private baseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || API_BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.token) {
      throw new AuthenticationError('No token provided. Include X-DigitalOcean-Token header.');
    }

    return {
      Authorization: `Bearer ${this.credentials.token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your API token.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.message || errorJson.id || message;
      } catch {
        // Use default message
      }
      throw new DigitalOceanApiError(message, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as T;
  }

  private parsePaginatedResponse<T>(
    response: { links?: Links; meta?: Meta } & Record<string, unknown>,
    key: string
  ): PaginatedResponse<T> {
    const items = (response[key] || []) as T[];
    const meta = response.meta;
    const links = response.links;

    return {
      items,
      count: items.length,
      total: meta?.total,
      hasMore: !!links?.pages?.next,
      nextPage: links?.pages?.next ? this.extractPageNumber(links.pages.next) : undefined,
    };
  }

  private extractPageNumber(url: string): number | undefined {
    try {
      const parsedUrl = new URL(url);
      const page = parsedUrl.searchParams.get('page');
      return page ? parseInt(page, 10) : undefined;
    } catch {
      return undefined;
    }
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const filtered = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    );
    if (filtered.length === 0) return '';
    const searchParams = new URLSearchParams();
    for (const [key, value] of filtered) {
      searchParams.set(key, String(value));
    }
    return `?${searchParams.toString()}`;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.getAccount();
      return { connected: true, message: 'Successfully connected to DigitalOcean API' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Account
  // ===========================================================================

  async getAccount(): Promise<Account> {
    const response = await this.request<{ account: Account }>('/account');
    return response.account;
  }

  // ===========================================================================
  // Droplets
  // ===========================================================================

  async listDroplets(params?: PaginationParams & { tag_name?: string }): Promise<PaginatedResponse<Droplet>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ droplets: Droplet[]; links?: Links; meta?: Meta }>(`/droplets${query}`);
    return this.parsePaginatedResponse(response, 'droplets');
  }

  async getDroplet(dropletId: number): Promise<Droplet> {
    const response = await this.request<{ droplet: Droplet }>(`/droplets/${dropletId}`);
    return response.droplet;
  }

  async createDroplet(input: DropletCreateInput): Promise<Droplet | Droplet[]> {
    const response = await this.request<{ droplet?: Droplet; droplets?: Droplet[] }>('/droplets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.droplet || response.droplets || [];
  }

  async deleteDroplet(dropletId: number): Promise<void> {
    await this.request<void>(`/droplets/${dropletId}`, { method: 'DELETE' });
  }

  async deleteDropletsByTag(tagName: string): Promise<void> {
    await this.request<void>(`/droplets?tag_name=${encodeURIComponent(tagName)}`, { method: 'DELETE' });
  }

  async listDropletActions(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Action>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ actions: Action[]; links?: Links; meta?: Meta }>(`/droplets/${dropletId}/actions${query}`);
    return this.parsePaginatedResponse(response, 'actions');
  }

  async performDropletAction(dropletId: number, action: string, params?: Record<string, unknown>): Promise<Action> {
    const response = await this.request<{ action: Action }>(`/droplets/${dropletId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ type: action, ...params }),
    });
    return response.action;
  }

  async performDropletActionByTag(tagName: string, action: string, params?: Record<string, unknown>): Promise<Action[]> {
    const response = await this.request<{ actions: Action[] }>(`/droplets/actions?tag_name=${encodeURIComponent(tagName)}`, {
      method: 'POST',
      body: JSON.stringify({ type: action, ...params }),
    });
    return response.actions;
  }

  async listDropletSnapshots(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ snapshots: Snapshot[]; links?: Links; meta?: Meta }>(`/droplets/${dropletId}/snapshots${query}`);
    return this.parsePaginatedResponse(response, 'snapshots');
  }

  async listDropletBackups(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ backups: Snapshot[]; links?: Links; meta?: Meta }>(`/droplets/${dropletId}/backups${query}`);
    return this.parsePaginatedResponse(response, 'backups');
  }

  async listDropletKernels(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<unknown>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ kernels: unknown[]; links?: Links; meta?: Meta }>(`/droplets/${dropletId}/kernels${query}`);
    return this.parsePaginatedResponse(response, 'kernels');
  }

  async listDropletFirewalls(dropletId: number, params?: PaginationParams): Promise<PaginatedResponse<Firewall>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ firewalls: Firewall[]; links?: Links; meta?: Meta }>(`/droplets/${dropletId}/firewalls${query}`);
    return this.parsePaginatedResponse(response, 'firewalls');
  }

  async listDropletNeighbors(dropletId: number): Promise<Droplet[]> {
    const response = await this.request<{ droplets: Droplet[] }>(`/droplets/${dropletId}/neighbors`);
    return response.droplets;
  }

  // ===========================================================================
  // Images
  // ===========================================================================

  async listImages(params?: PaginationParams & { type?: string; private?: boolean }): Promise<PaginatedResponse<Image>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ images: Image[]; links?: Links; meta?: Meta }>(`/images${query}`);
    return this.parsePaginatedResponse(response, 'images');
  }

  async getImage(imageId: number | string): Promise<Image> {
    const response = await this.request<{ image: Image }>(`/images/${imageId}`);
    return response.image;
  }

  async updateImage(imageId: number, name: string, description?: string, distribution?: string): Promise<Image> {
    const response = await this.request<{ image: Image }>(`/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, distribution }),
    });
    return response.image;
  }

  async deleteImage(imageId: number): Promise<void> {
    await this.request<void>(`/images/${imageId}`, { method: 'DELETE' });
  }

  async listImageActions(imageId: number, params?: PaginationParams): Promise<PaginatedResponse<Action>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ actions: Action[]; links?: Links; meta?: Meta }>(`/images/${imageId}/actions${query}`);
    return this.parsePaginatedResponse(response, 'actions');
  }

  async performImageAction(imageId: number, action: string, params?: Record<string, unknown>): Promise<Action> {
    const response = await this.request<{ action: Action }>(`/images/${imageId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ type: action, ...params }),
    });
    return response.action;
  }

  // ===========================================================================
  // Regions
  // ===========================================================================

  async listRegions(params?: PaginationParams): Promise<PaginatedResponse<Region>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ regions: Region[]; links?: Links; meta?: Meta }>(`/regions${query}`);
    return this.parsePaginatedResponse(response, 'regions');
  }

  // ===========================================================================
  // Sizes
  // ===========================================================================

  async listSizes(params?: PaginationParams): Promise<PaginatedResponse<Size>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ sizes: Size[]; links?: Links; meta?: Meta }>(`/sizes${query}`);
    return this.parsePaginatedResponse(response, 'sizes');
  }

  // ===========================================================================
  // SSH Keys
  // ===========================================================================

  async listSSHKeys(params?: PaginationParams): Promise<PaginatedResponse<SSHKey>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ ssh_keys: SSHKey[]; links?: Links; meta?: Meta }>(`/account/keys${query}`);
    return this.parsePaginatedResponse(response, 'ssh_keys');
  }

  async getSSHKey(keyId: number | string): Promise<SSHKey> {
    const response = await this.request<{ ssh_key: SSHKey }>(`/account/keys/${keyId}`);
    return response.ssh_key;
  }

  async createSSHKey(input: SSHKeyCreateInput): Promise<SSHKey> {
    const response = await this.request<{ ssh_key: SSHKey }>('/account/keys', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.ssh_key;
  }

  async updateSSHKey(keyId: number | string, name: string): Promise<SSHKey> {
    const response = await this.request<{ ssh_key: SSHKey }>(`/account/keys/${keyId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    return response.ssh_key;
  }

  async deleteSSHKey(keyId: number | string): Promise<void> {
    await this.request<void>(`/account/keys/${keyId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Domains
  // ===========================================================================

  async listDomains(params?: PaginationParams): Promise<PaginatedResponse<Domain>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ domains: Domain[]; links?: Links; meta?: Meta }>(`/domains${query}`);
    return this.parsePaginatedResponse(response, 'domains');
  }

  async getDomain(domainName: string): Promise<Domain> {
    const response = await this.request<{ domain: Domain }>(`/domains/${domainName}`);
    return response.domain;
  }

  async createDomain(name: string, ipAddress?: string): Promise<Domain> {
    const response = await this.request<{ domain: Domain }>('/domains', {
      method: 'POST',
      body: JSON.stringify({ name, ip_address: ipAddress }),
    });
    return response.domain;
  }

  async deleteDomain(domainName: string): Promise<void> {
    await this.request<void>(`/domains/${domainName}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Domain Records
  // ===========================================================================

  async listDomainRecords(domainName: string, params?: PaginationParams): Promise<PaginatedResponse<DomainRecord>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ domain_records: DomainRecord[]; links?: Links; meta?: Meta }>(`/domains/${domainName}/records${query}`);
    return this.parsePaginatedResponse(response, 'domain_records');
  }

  async getDomainRecord(domainName: string, recordId: number): Promise<DomainRecord> {
    const response = await this.request<{ domain_record: DomainRecord }>(`/domains/${domainName}/records/${recordId}`);
    return response.domain_record;
  }

  async createDomainRecord(domainName: string, input: DomainRecordCreateInput): Promise<DomainRecord> {
    const response = await this.request<{ domain_record: DomainRecord }>(`/domains/${domainName}/records`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.domain_record;
  }

  async updateDomainRecord(domainName: string, recordId: number, input: Partial<DomainRecordCreateInput>): Promise<DomainRecord> {
    const response = await this.request<{ domain_record: DomainRecord }>(`/domains/${domainName}/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.domain_record;
  }

  async deleteDomainRecord(domainName: string, recordId: number): Promise<void> {
    await this.request<void>(`/domains/${domainName}/records/${recordId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Volumes
  // ===========================================================================

  async listVolumes(params?: PaginationParams & { name?: string; region?: string }): Promise<PaginatedResponse<Volume>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ volumes: Volume[]; links?: Links; meta?: Meta }>(`/volumes${query}`);
    return this.parsePaginatedResponse(response, 'volumes');
  }

  async getVolume(volumeId: string): Promise<Volume> {
    const response = await this.request<{ volume: Volume }>(`/volumes/${volumeId}`);
    return response.volume;
  }

  async createVolume(input: VolumeCreateInput): Promise<Volume> {
    const response = await this.request<{ volume: Volume }>('/volumes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.volume;
  }

  async deleteVolume(volumeId: string): Promise<void> {
    await this.request<void>(`/volumes/${volumeId}`, { method: 'DELETE' });
  }

  async deleteVolumeByName(name: string, region: string): Promise<void> {
    await this.request<void>(`/volumes?name=${encodeURIComponent(name)}&region=${encodeURIComponent(region)}`, { method: 'DELETE' });
  }

  async listVolumeSnapshots(volumeId: string, params?: PaginationParams): Promise<PaginatedResponse<Snapshot>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ snapshots: Snapshot[]; links?: Links; meta?: Meta }>(`/volumes/${volumeId}/snapshots${query}`);
    return this.parsePaginatedResponse(response, 'snapshots');
  }

  async createVolumeSnapshot(volumeId: string, name: string, tags?: string[]): Promise<Snapshot> {
    const response = await this.request<{ snapshot: Snapshot }>(`/volumes/${volumeId}/snapshots`, {
      method: 'POST',
      body: JSON.stringify({ name, tags }),
    });
    return response.snapshot;
  }

  async listVolumeActions(volumeId: string, params?: PaginationParams): Promise<PaginatedResponse<Action>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ actions: Action[]; links?: Links; meta?: Meta }>(`/volumes/${volumeId}/actions${query}`);
    return this.parsePaginatedResponse(response, 'actions');
  }

  async performVolumeAction(volumeId: string, action: string, params?: Record<string, unknown>): Promise<Action> {
    const response = await this.request<{ action: Action }>(`/volumes/${volumeId}/actions`, {
      method: 'POST',
      body: JSON.stringify({ type: action, ...params }),
    });
    return response.action;
  }

  // ===========================================================================
  // Snapshots
  // ===========================================================================

  async listSnapshots(params?: PaginationParams & { resource_type?: 'droplet' | 'volume' }): Promise<PaginatedResponse<Snapshot>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ snapshots: Snapshot[]; links?: Links; meta?: Meta }>(`/snapshots${query}`);
    return this.parsePaginatedResponse(response, 'snapshots');
  }

  async getSnapshot(snapshotId: string): Promise<Snapshot> {
    const response = await this.request<{ snapshot: Snapshot }>(`/snapshots/${snapshotId}`);
    return response.snapshot;
  }

  async deleteSnapshot(snapshotId: string): Promise<void> {
    await this.request<void>(`/snapshots/${snapshotId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Firewalls
  // ===========================================================================

  async listFirewalls(params?: PaginationParams): Promise<PaginatedResponse<Firewall>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ firewalls: Firewall[]; links?: Links; meta?: Meta }>(`/firewalls${query}`);
    return this.parsePaginatedResponse(response, 'firewalls');
  }

  async getFirewall(firewallId: string): Promise<Firewall> {
    const response = await this.request<{ firewall: Firewall }>(`/firewalls/${firewallId}`);
    return response.firewall;
  }

  async createFirewall(input: FirewallCreateInput): Promise<Firewall> {
    const response = await this.request<{ firewall: Firewall }>('/firewalls', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.firewall;
  }

  async updateFirewall(firewallId: string, input: FirewallCreateInput): Promise<Firewall> {
    const response = await this.request<{ firewall: Firewall }>(`/firewalls/${firewallId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.firewall;
  }

  async deleteFirewall(firewallId: string): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}`, { method: 'DELETE' });
  }

  async addDropletsToFirewall(firewallId: string, dropletIds: number[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/droplets`, {
      method: 'POST',
      body: JSON.stringify({ droplet_ids: dropletIds }),
    });
  }

  async removeDropletsFromFirewall(firewallId: string, dropletIds: number[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/droplets`, {
      method: 'DELETE',
      body: JSON.stringify({ droplet_ids: dropletIds }),
    });
  }

  async addTagsToFirewall(firewallId: string, tags: string[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async removeTagsFromFirewall(firewallId: string, tags: string[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tags }),
    });
  }

  async addRulesToFirewall(firewallId: string, inboundRules?: FirewallRule[], outboundRules?: FirewallRule[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/rules`, {
      method: 'POST',
      body: JSON.stringify({ inbound_rules: inboundRules, outbound_rules: outboundRules }),
    });
  }

  async removeRulesFromFirewall(firewallId: string, inboundRules?: FirewallRule[], outboundRules?: FirewallRule[]): Promise<void> {
    await this.request<void>(`/firewalls/${firewallId}/rules`, {
      method: 'DELETE',
      body: JSON.stringify({ inbound_rules: inboundRules, outbound_rules: outboundRules }),
    });
  }

  // ===========================================================================
  // Load Balancers
  // ===========================================================================

  async listLoadBalancers(params?: PaginationParams): Promise<PaginatedResponse<LoadBalancer>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ load_balancers: LoadBalancer[]; links?: Links; meta?: Meta }>(`/load_balancers${query}`);
    return this.parsePaginatedResponse(response, 'load_balancers');
  }

  async getLoadBalancer(lbId: string): Promise<LoadBalancer> {
    const response = await this.request<{ load_balancer: LoadBalancer }>(`/load_balancers/${lbId}`);
    return response.load_balancer;
  }

  async createLoadBalancer(input: LoadBalancerCreateInput): Promise<LoadBalancer> {
    const response = await this.request<{ load_balancer: LoadBalancer }>('/load_balancers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.load_balancer;
  }

  async updateLoadBalancer(lbId: string, input: Partial<LoadBalancerCreateInput>): Promise<LoadBalancer> {
    const response = await this.request<{ load_balancer: LoadBalancer }>(`/load_balancers/${lbId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.load_balancer;
  }

  async deleteLoadBalancer(lbId: string): Promise<void> {
    await this.request<void>(`/load_balancers/${lbId}`, { method: 'DELETE' });
  }

  async addDropletsToLoadBalancer(lbId: string, dropletIds: number[]): Promise<void> {
    await this.request<void>(`/load_balancers/${lbId}/droplets`, {
      method: 'POST',
      body: JSON.stringify({ droplet_ids: dropletIds }),
    });
  }

  async removeDropletsFromLoadBalancer(lbId: string, dropletIds: number[]): Promise<void> {
    await this.request<void>(`/load_balancers/${lbId}/droplets`, {
      method: 'DELETE',
      body: JSON.stringify({ droplet_ids: dropletIds }),
    });
  }

  // ===========================================================================
  // VPCs
  // ===========================================================================

  async listVPCs(params?: PaginationParams): Promise<PaginatedResponse<VPC>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ vpcs: VPC[]; links?: Links; meta?: Meta }>(`/vpcs${query}`);
    return this.parsePaginatedResponse(response, 'vpcs');
  }

  async getVPC(vpcId: string): Promise<VPC> {
    const response = await this.request<{ vpc: VPC }>(`/vpcs/${vpcId}`);
    return response.vpc;
  }

  async createVPC(input: VPCCreateInput): Promise<VPC> {
    const response = await this.request<{ vpc: VPC }>('/vpcs', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.vpc;
  }

  async updateVPC(vpcId: string, name: string, description?: string): Promise<VPC> {
    const response = await this.request<{ vpc: VPC }>(`/vpcs/${vpcId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
    return response.vpc;
  }

  async deleteVPC(vpcId: string): Promise<void> {
    await this.request<void>(`/vpcs/${vpcId}`, { method: 'DELETE' });
  }

  async listVPCMembers(vpcId: string, params?: PaginationParams): Promise<PaginatedResponse<VPCMember>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ members: VPCMember[]; links?: Links; meta?: Meta }>(`/vpcs/${vpcId}/members${query}`);
    return this.parsePaginatedResponse(response, 'members');
  }

  // ===========================================================================
  // Kubernetes
  // ===========================================================================

  async listKubernetesClusters(params?: PaginationParams): Promise<PaginatedResponse<KubernetesCluster>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ kubernetes_clusters: KubernetesCluster[]; links?: Links; meta?: Meta }>(`/kubernetes/clusters${query}`);
    return this.parsePaginatedResponse(response, 'kubernetes_clusters');
  }

  async getKubernetesCluster(clusterId: string): Promise<KubernetesCluster> {
    const response = await this.request<{ kubernetes_cluster: KubernetesCluster }>(`/kubernetes/clusters/${clusterId}`);
    return response.kubernetes_cluster;
  }

  async createKubernetesCluster(input: KubernetesClusterCreateInput): Promise<KubernetesCluster> {
    const response = await this.request<{ kubernetes_cluster: KubernetesCluster }>('/kubernetes/clusters', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.kubernetes_cluster;
  }

  async updateKubernetesCluster(clusterId: string, name: string, autoUpgrade?: boolean, maintenancePolicy?: unknown): Promise<KubernetesCluster> {
    const response = await this.request<{ kubernetes_cluster: KubernetesCluster }>(`/kubernetes/clusters/${clusterId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, auto_upgrade: autoUpgrade, maintenance_policy: maintenancePolicy }),
    });
    return response.kubernetes_cluster;
  }

  async deleteKubernetesCluster(clusterId: string): Promise<void> {
    await this.request<void>(`/kubernetes/clusters/${clusterId}`, { method: 'DELETE' });
  }

  async getKubernetesKubeconfig(clusterId: string): Promise<string> {
    return this.request<string>(`/kubernetes/clusters/${clusterId}/kubeconfig`);
  }

  async getKubernetesCredentials(clusterId: string): Promise<unknown> {
    return this.request<unknown>(`/kubernetes/clusters/${clusterId}/credentials`);
  }

  async listKubernetesNodePools(clusterId: string): Promise<KubernetesNodePool[]> {
    const response = await this.request<{ node_pools: KubernetesNodePool[] }>(`/kubernetes/clusters/${clusterId}/node_pools`);
    return response.node_pools;
  }

  async getKubernetesNodePool(clusterId: string, nodePoolId: string): Promise<KubernetesNodePool> {
    const response = await this.request<{ node_pool: KubernetesNodePool }>(`/kubernetes/clusters/${clusterId}/node_pools/${nodePoolId}`);
    return response.node_pool;
  }

  async addKubernetesNodePool(clusterId: string, input: KubernetesNodePoolCreateInput): Promise<KubernetesNodePool> {
    const response = await this.request<{ node_pool: KubernetesNodePool }>(`/kubernetes/clusters/${clusterId}/node_pools`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.node_pool;
  }

  async updateKubernetesNodePool(clusterId: string, nodePoolId: string, input: Partial<KubernetesNodePoolCreateInput>): Promise<KubernetesNodePool> {
    const response = await this.request<{ node_pool: KubernetesNodePool }>(`/kubernetes/clusters/${clusterId}/node_pools/${nodePoolId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.node_pool;
  }

  async deleteKubernetesNodePool(clusterId: string, nodePoolId: string): Promise<void> {
    await this.request<void>(`/kubernetes/clusters/${clusterId}/node_pools/${nodePoolId}`, { method: 'DELETE' });
  }

  async deleteKubernetesNode(clusterId: string, nodePoolId: string, nodeId: string, replace?: boolean, skipDrain?: boolean): Promise<void> {
    const query = this.buildQueryString({ replace, skip_drain: skipDrain });
    await this.request<void>(`/kubernetes/clusters/${clusterId}/node_pools/${nodePoolId}/nodes/${nodeId}${query}`, { method: 'DELETE' });
  }

  async upgradeKubernetesCluster(clusterId: string, version: string): Promise<void> {
    await this.request<void>(`/kubernetes/clusters/${clusterId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ version }),
    });
  }

  async listKubernetesAvailableUpgrades(clusterId: string): Promise<unknown[]> {
    const response = await this.request<{ available_upgrade_versions: unknown[] }>(`/kubernetes/clusters/${clusterId}/upgrades`);
    return response.available_upgrade_versions || [];
  }

  async getKubernetesOptions(): Promise<KubernetesOptions> {
    const response = await this.request<{ options: KubernetesOptions }>('/kubernetes/options');
    return response.options;
  }

  // ===========================================================================
  // Databases
  // ===========================================================================

  async listDatabases(params?: PaginationParams): Promise<PaginatedResponse<Database>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ databases: Database[]; links?: Links; meta?: Meta }>(`/databases${query}`);
    return this.parsePaginatedResponse(response, 'databases');
  }

  async getDatabase(databaseId: string): Promise<Database> {
    const response = await this.request<{ database: Database }>(`/databases/${databaseId}`);
    return response.database;
  }

  async createDatabase(input: DatabaseCreateInput): Promise<Database> {
    const response = await this.request<{ database: Database }>('/databases', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.database;
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}`, { method: 'DELETE' });
  }

  async resizeDatabase(databaseId: string, size: string, numNodes: number): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/resize`, {
      method: 'PUT',
      body: JSON.stringify({ size, num_nodes: numNodes }),
    });
  }

  async migrateDatabase(databaseId: string, region: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/migrate`, {
      method: 'PUT',
      body: JSON.stringify({ region }),
    });
  }

  async listDatabaseBackups(databaseId: string): Promise<unknown[]> {
    const response = await this.request<{ backups: unknown[] }>(`/databases/${databaseId}/backups`);
    return response.backups;
  }

  async getDatabaseCA(databaseId: string): Promise<string> {
    const response = await this.request<{ ca: { certificate: string } }>(`/databases/${databaseId}/ca`);
    return response.ca.certificate;
  }

  async listDatabaseReplicas(databaseId: string): Promise<DatabaseReplica[]> {
    const response = await this.request<{ replicas: DatabaseReplica[] }>(`/databases/${databaseId}/replicas`);
    return response.replicas;
  }

  async getDatabaseReplica(databaseId: string, replicaName: string): Promise<DatabaseReplica> {
    const response = await this.request<{ replica: DatabaseReplica }>(`/databases/${databaseId}/replicas/${replicaName}`);
    return response.replica;
  }

  async createDatabaseReplica(databaseId: string, name: string, size?: string, region?: string, tags?: string[]): Promise<DatabaseReplica> {
    const response = await this.request<{ replica: DatabaseReplica }>(`/databases/${databaseId}/replicas`, {
      method: 'POST',
      body: JSON.stringify({ name, size, region, tags }),
    });
    return response.replica;
  }

  async deleteDatabaseReplica(databaseId: string, replicaName: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/replicas/${replicaName}`, { method: 'DELETE' });
  }

  async promoteDatabaseReplica(databaseId: string, replicaName: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/replicas/${replicaName}/promote`, { method: 'PUT' });
  }

  async listDatabaseUsers(databaseId: string): Promise<DatabaseUser[]> {
    const response = await this.request<{ users: DatabaseUser[] }>(`/databases/${databaseId}/users`);
    return response.users;
  }

  async getDatabaseUser(databaseId: string, username: string): Promise<DatabaseUser> {
    const response = await this.request<{ user: DatabaseUser }>(`/databases/${databaseId}/users/${username}`);
    return response.user;
  }

  async createDatabaseUser(databaseId: string, name: string, mysqlAuthPlugin?: string): Promise<DatabaseUser> {
    const body: Record<string, unknown> = { name };
    if (mysqlAuthPlugin) {
      body.mysql_settings = { auth_plugin: mysqlAuthPlugin };
    }
    const response = await this.request<{ user: DatabaseUser }>(`/databases/${databaseId}/users`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.user;
  }

  async deleteDatabaseUser(databaseId: string, username: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/users/${username}`, { method: 'DELETE' });
  }

  async resetDatabaseUserAuth(databaseId: string, username: string, mysqlAuthPlugin?: string): Promise<DatabaseUser> {
    const body: Record<string, unknown> = {};
    if (mysqlAuthPlugin) {
      body.mysql_settings = { auth_plugin: mysqlAuthPlugin };
    }
    const response = await this.request<{ user: DatabaseUser }>(`/databases/${databaseId}/users/${username}/reset_auth`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.user;
  }

  async listDatabaseDbs(databaseId: string): Promise<{ name: string }[]> {
    const response = await this.request<{ dbs: { name: string }[] }>(`/databases/${databaseId}/dbs`);
    return response.dbs;
  }

  async getDatabaseDb(databaseId: string, dbName: string): Promise<{ name: string }> {
    const response = await this.request<{ db: { name: string } }>(`/databases/${databaseId}/dbs/${dbName}`);
    return response.db;
  }

  async createDatabaseDb(databaseId: string, name: string): Promise<{ name: string }> {
    const response = await this.request<{ db: { name: string } }>(`/databases/${databaseId}/dbs`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response.db;
  }

  async deleteDatabaseDb(databaseId: string, dbName: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/dbs/${dbName}`, { method: 'DELETE' });
  }

  async listDatabasePools(databaseId: string): Promise<DatabasePool[]> {
    const response = await this.request<{ pools: DatabasePool[] }>(`/databases/${databaseId}/pools`);
    return response.pools;
  }

  async getDatabasePool(databaseId: string, poolName: string): Promise<DatabasePool> {
    const response = await this.request<{ pool: DatabasePool }>(`/databases/${databaseId}/pools/${poolName}`);
    return response.pool;
  }

  async createDatabasePool(databaseId: string, name: string, mode: string, size: number, db: string, user: string): Promise<DatabasePool> {
    const response = await this.request<{ pool: DatabasePool }>(`/databases/${databaseId}/pools`, {
      method: 'POST',
      body: JSON.stringify({ name, mode, size, db, user }),
    });
    return response.pool;
  }

  async updateDatabasePool(databaseId: string, poolName: string, mode: string, size: number, db: string, user: string): Promise<DatabasePool> {
    const response = await this.request<{ pool: DatabasePool }>(`/databases/${databaseId}/pools/${poolName}`, {
      method: 'PUT',
      body: JSON.stringify({ mode, size, db, user }),
    });
    return response.pool;
  }

  async deleteDatabasePool(databaseId: string, poolName: string): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/pools/${poolName}`, { method: 'DELETE' });
  }

  async listDatabaseFirewallRules(databaseId: string): Promise<DatabaseFirewallRule[]> {
    const response = await this.request<{ rules: DatabaseFirewallRule[] }>(`/databases/${databaseId}/firewall`);
    return response.rules;
  }

  async updateDatabaseFirewallRules(databaseId: string, rules: Array<{ type: string; value: string }>): Promise<void> {
    await this.request<void>(`/databases/${databaseId}/firewall`, {
      method: 'PUT',
      body: JSON.stringify({ rules }),
    });
  }

  // ===========================================================================
  // Apps (App Platform)
  // ===========================================================================

  async listApps(params?: PaginationParams): Promise<PaginatedResponse<App>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ apps: App[]; links?: Links; meta?: Meta }>(`/apps${query}`);
    return this.parsePaginatedResponse(response, 'apps');
  }

  async getApp(appId: string): Promise<App> {
    const response = await this.request<{ app: App }>(`/apps/${appId}`);
    return response.app;
  }

  async createApp(input: AppCreateInput): Promise<App> {
    const response = await this.request<{ app: App }>('/apps', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.app;
  }

  async updateApp(appId: string, spec: unknown): Promise<App> {
    const response = await this.request<{ app: App }>(`/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify({ spec }),
    });
    return response.app;
  }

  async deleteApp(appId: string): Promise<void> {
    await this.request<void>(`/apps/${appId}`, { method: 'DELETE' });
  }

  async listAppDeployments(appId: string, params?: PaginationParams): Promise<PaginatedResponse<unknown>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ deployments: unknown[]; links?: Links; meta?: Meta }>(`/apps/${appId}/deployments${query}`);
    return this.parsePaginatedResponse(response, 'deployments');
  }

  async getAppDeployment(appId: string, deploymentId: string): Promise<unknown> {
    const response = await this.request<{ deployment: unknown }>(`/apps/${appId}/deployments/${deploymentId}`);
    return response.deployment;
  }

  async createAppDeployment(appId: string, forceBuild?: boolean): Promise<unknown> {
    const response = await this.request<{ deployment: unknown }>(`/apps/${appId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ force_build: forceBuild }),
    });
    return response.deployment;
  }

  async cancelAppDeployment(appId: string, deploymentId: string): Promise<unknown> {
    const response = await this.request<{ deployment: unknown }>(`/apps/${appId}/deployments/${deploymentId}/cancel`, {
      method: 'POST',
    });
    return response.deployment;
  }

  async getAppLogs(appId: string, deploymentId?: string, componentName?: string, type?: string, follow?: boolean): Promise<unknown> {
    const parts = [`/apps/${appId}`];
    if (deploymentId) parts.push(`/deployments/${deploymentId}`);
    if (componentName) parts.push(`/components/${componentName}`);
    parts.push('/logs');
    const query = this.buildQueryString({ type, follow });
    return this.request<unknown>(`${parts.join('')}${query}`);
  }

  async listAppRegions(): Promise<unknown[]> {
    const response = await this.request<{ regions: unknown[] }>('/apps/regions');
    return response.regions;
  }

  async listAppTiers(): Promise<unknown[]> {
    const response = await this.request<{ tiers: unknown[] }>('/apps/tiers');
    return response.tiers;
  }

  async listAppInstanceSizes(): Promise<unknown[]> {
    const response = await this.request<{ instance_sizes: unknown[] }>('/apps/tiers/instance_sizes');
    return response.instance_sizes;
  }

  async proposeApp(spec: unknown): Promise<unknown> {
    return this.request<unknown>('/apps/propose', {
      method: 'POST',
      body: JSON.stringify({ spec }),
    });
  }

  // ===========================================================================
  // Tags
  // ===========================================================================

  async listTags(params?: PaginationParams): Promise<PaginatedResponse<Tag>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ tags: Tag[]; links?: Links; meta?: Meta }>(`/tags${query}`);
    return this.parsePaginatedResponse(response, 'tags');
  }

  async getTag(tagName: string): Promise<Tag> {
    const response = await this.request<{ tag: Tag }>(`/tags/${tagName}`);
    return response.tag;
  }

  async createTag(name: string): Promise<Tag> {
    const response = await this.request<{ tag: Tag }>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response.tag;
  }

  async deleteTag(tagName: string): Promise<void> {
    await this.request<void>(`/tags/${tagName}`, { method: 'DELETE' });
  }

  async tagResources(tagName: string, resources: Array<{ resource_id: string; resource_type: string }>): Promise<void> {
    await this.request<void>(`/tags/${tagName}/resources`, {
      method: 'POST',
      body: JSON.stringify({ resources }),
    });
  }

  async untagResources(tagName: string, resources: Array<{ resource_id: string; resource_type: string }>): Promise<void> {
    await this.request<void>(`/tags/${tagName}/resources`, {
      method: 'DELETE',
      body: JSON.stringify({ resources }),
    });
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async listProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ projects: Project[]; links?: Links; meta?: Meta }>(`/projects${query}`);
    return this.parsePaginatedResponse(response, 'projects');
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await this.request<{ project: Project }>(`/projects/${projectId}`);
    return response.project;
  }

  async getDefaultProject(): Promise<Project> {
    const response = await this.request<{ project: Project }>('/projects/default');
    return response.project;
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const response = await this.request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.project;
  }

  async updateProject(projectId: string, input: Partial<ProjectCreateInput>): Promise<Project> {
    const response = await this.request<{ project: Project }>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request<void>(`/projects/${projectId}`, { method: 'DELETE' });
  }

  async listProjectResources(projectId: string, params?: PaginationParams): Promise<PaginatedResponse<ProjectResource>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ resources: ProjectResource[]; links?: Links; meta?: Meta }>(`/projects/${projectId}/resources${query}`);
    return this.parsePaginatedResponse(response, 'resources');
  }

  async assignResourcesToProject(projectId: string, resources: string[]): Promise<ProjectResource[]> {
    const response = await this.request<{ resources: ProjectResource[] }>(`/projects/${projectId}/resources`, {
      method: 'POST',
      body: JSON.stringify({ resources }),
    });
    return response.resources;
  }

  // ===========================================================================
  // Reserved IPs
  // ===========================================================================

  async listReservedIPs(params?: PaginationParams): Promise<PaginatedResponse<ReservedIP>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ reserved_ips: ReservedIP[]; links?: Links; meta?: Meta }>(`/reserved_ips${query}`);
    return this.parsePaginatedResponse(response, 'reserved_ips');
  }

  async getReservedIP(ip: string): Promise<ReservedIP> {
    const response = await this.request<{ reserved_ip: ReservedIP }>(`/reserved_ips/${ip}`);
    return response.reserved_ip;
  }

  async createReservedIP(region?: string, dropletId?: number, projectId?: string): Promise<ReservedIP> {
    const body: Record<string, unknown> = {};
    if (region) body.region = region;
    if (dropletId) body.droplet_id = dropletId;
    if (projectId) body.project_id = projectId;
    const response = await this.request<{ reserved_ip: ReservedIP }>('/reserved_ips', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.reserved_ip;
  }

  async deleteReservedIP(ip: string): Promise<void> {
    await this.request<void>(`/reserved_ips/${ip}`, { method: 'DELETE' });
  }

  async listReservedIPActions(ip: string, params?: PaginationParams): Promise<PaginatedResponse<Action>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ actions: Action[]; links?: Links; meta?: Meta }>(`/reserved_ips/${ip}/actions${query}`);
    return this.parsePaginatedResponse(response, 'actions');
  }

  async performReservedIPAction(ip: string, action: string, dropletId?: number): Promise<Action> {
    const body: Record<string, unknown> = { type: action };
    if (dropletId) body.droplet_id = dropletId;
    const response = await this.request<{ action: Action }>(`/reserved_ips/${ip}/actions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.action;
  }

  // ===========================================================================
  // Certificates
  // ===========================================================================

  async listCertificates(params?: PaginationParams): Promise<PaginatedResponse<Certificate>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ certificates: Certificate[]; links?: Links; meta?: Meta }>(`/certificates${query}`);
    return this.parsePaginatedResponse(response, 'certificates');
  }

  async getCertificate(certificateId: string): Promise<Certificate> {
    const response = await this.request<{ certificate: Certificate }>(`/certificates/${certificateId}`);
    return response.certificate;
  }

  async createCertificate(input: CertificateCreateInput): Promise<Certificate> {
    const response = await this.request<{ certificate: Certificate }>('/certificates', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.certificate;
  }

  async deleteCertificate(certificateId: string): Promise<void> {
    await this.request<void>(`/certificates/${certificateId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // CDN Endpoints
  // ===========================================================================

  async listCDNEndpoints(params?: PaginationParams): Promise<PaginatedResponse<CDNEndpoint>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ endpoints: CDNEndpoint[]; links?: Links; meta?: Meta }>(`/cdn/endpoints${query}`);
    return this.parsePaginatedResponse(response, 'endpoints');
  }

  async getCDNEndpoint(cdnId: string): Promise<CDNEndpoint> {
    const response = await this.request<{ endpoint: CDNEndpoint }>(`/cdn/endpoints/${cdnId}`);
    return response.endpoint;
  }

  async createCDNEndpoint(input: CDNEndpointCreateInput): Promise<CDNEndpoint> {
    const response = await this.request<{ endpoint: CDNEndpoint }>('/cdn/endpoints', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.endpoint;
  }

  async updateCDNEndpoint(cdnId: string, ttl?: number, certificateId?: string, customDomain?: string): Promise<CDNEndpoint> {
    const response = await this.request<{ endpoint: CDNEndpoint }>(`/cdn/endpoints/${cdnId}`, {
      method: 'PUT',
      body: JSON.stringify({ ttl, certificate_id: certificateId, custom_domain: customDomain }),
    });
    return response.endpoint;
  }

  async deleteCDNEndpoint(cdnId: string): Promise<void> {
    await this.request<void>(`/cdn/endpoints/${cdnId}`, { method: 'DELETE' });
  }

  async purgeCDNCache(cdnId: string, files: string[]): Promise<void> {
    await this.request<void>(`/cdn/endpoints/${cdnId}/cache`, {
      method: 'DELETE',
      body: JSON.stringify({ files }),
    });
  }

  // ===========================================================================
  // Uptime
  // ===========================================================================

  async listUptimeChecks(params?: PaginationParams): Promise<PaginatedResponse<UptimeCheck>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ checks: UptimeCheck[]; links?: Links; meta?: Meta }>(`/uptime/checks${query}`);
    return this.parsePaginatedResponse(response, 'checks');
  }

  async getUptimeCheck(checkId: string): Promise<UptimeCheck> {
    const response = await this.request<{ check: UptimeCheck }>(`/uptime/checks/${checkId}`);
    return response.check;
  }

  async createUptimeCheck(input: UptimeCheckCreateInput): Promise<UptimeCheck> {
    const response = await this.request<{ check: UptimeCheck }>('/uptime/checks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.check;
  }

  async updateUptimeCheck(checkId: string, input: Partial<UptimeCheckCreateInput>): Promise<UptimeCheck> {
    const response = await this.request<{ check: UptimeCheck }>(`/uptime/checks/${checkId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.check;
  }

  async deleteUptimeCheck(checkId: string): Promise<void> {
    await this.request<void>(`/uptime/checks/${checkId}`, { method: 'DELETE' });
  }

  async getUptimeCheckState(checkId: string): Promise<unknown> {
    const response = await this.request<{ state: unknown }>(`/uptime/checks/${checkId}/state`);
    return response.state;
  }

  async listUptimeAlerts(checkId: string, params?: PaginationParams): Promise<PaginatedResponse<UptimeAlert>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ alerts: UptimeAlert[]; links?: Links; meta?: Meta }>(`/uptime/checks/${checkId}/alerts${query}`);
    return this.parsePaginatedResponse(response, 'alerts');
  }

  async getUptimeAlert(checkId: string, alertId: string): Promise<UptimeAlert> {
    const response = await this.request<{ alert: UptimeAlert }>(`/uptime/checks/${checkId}/alerts/${alertId}`);
    return response.alert;
  }

  async createUptimeAlert(checkId: string, input: UptimeAlertCreateInput): Promise<UptimeAlert> {
    const response = await this.request<{ alert: UptimeAlert }>(`/uptime/checks/${checkId}/alerts`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.alert;
  }

  async updateUptimeAlert(checkId: string, alertId: string, input: Partial<UptimeAlertCreateInput>): Promise<UptimeAlert> {
    const response = await this.request<{ alert: UptimeAlert }>(`/uptime/checks/${checkId}/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.alert;
  }

  async deleteUptimeAlert(checkId: string, alertId: string): Promise<void> {
    await this.request<void>(`/uptime/checks/${checkId}/alerts/${alertId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Monitoring
  // ===========================================================================

  async listAlertPolicies(params?: PaginationParams): Promise<PaginatedResponse<AlertPolicy>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ policies: AlertPolicy[]; links?: Links; meta?: Meta }>(`/monitoring/alerts${query}`);
    return this.parsePaginatedResponse(response, 'policies');
  }

  async getAlertPolicy(alertId: string): Promise<AlertPolicy> {
    const response = await this.request<{ policy: AlertPolicy }>(`/monitoring/alerts/${alertId}`);
    return response.policy;
  }

  async createAlertPolicy(input: AlertPolicyCreateInput): Promise<AlertPolicy> {
    const response = await this.request<{ policy: AlertPolicy }>('/monitoring/alerts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.policy;
  }

  async updateAlertPolicy(alertId: string, input: AlertPolicyCreateInput): Promise<AlertPolicy> {
    const response = await this.request<{ policy: AlertPolicy }>(`/monitoring/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.policy;
  }

  async deleteAlertPolicy(alertId: string): Promise<void> {
    await this.request<void>(`/monitoring/alerts/${alertId}`, { method: 'DELETE' });
  }

  async getDropletBandwidthMetrics(hostId: string, start: string, end: string, direction?: string, networkInterface?: string): Promise<unknown> {
    const query = this.buildQueryString({ host_id: hostId, start, end, direction, interface: networkInterface });
    return this.request<unknown>(`/monitoring/metrics/droplet/bandwidth${query}`);
  }

  async getDropletCPUMetrics(hostId: string, start: string, end: string): Promise<unknown> {
    const query = this.buildQueryString({ host_id: hostId, start, end });
    return this.request<unknown>(`/monitoring/metrics/droplet/cpu${query}`);
  }

  async getDropletMemoryMetrics(hostId: string, start: string, end: string, metric: string): Promise<unknown> {
    const query = this.buildQueryString({ host_id: hostId, start, end });
    return this.request<unknown>(`/monitoring/metrics/droplet/memory_${metric}${query}`);
  }

  async getDropletFilesystemMetrics(hostId: string, start: string, end: string, metric: string): Promise<unknown> {
    const query = this.buildQueryString({ host_id: hostId, start, end });
    return this.request<unknown>(`/monitoring/metrics/droplet/filesystem_${metric}${query}`);
  }

  async getDropletLoadMetrics(hostId: string, start: string, end: string, period: string): Promise<unknown> {
    const query = this.buildQueryString({ host_id: hostId, start, end });
    return this.request<unknown>(`/monitoring/metrics/droplet/load_${period}${query}`);
  }

  // ===========================================================================
  // Functions
  // ===========================================================================

  async listFunctionsNamespaces(params?: PaginationParams): Promise<PaginatedResponse<FunctionsNamespace>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ namespaces: FunctionsNamespace[]; links?: Links; meta?: Meta }>(`/functions/namespaces${query}`);
    return this.parsePaginatedResponse(response, 'namespaces');
  }

  async getFunctionsNamespace(namespaceId: string): Promise<FunctionsNamespace> {
    const response = await this.request<{ namespace: FunctionsNamespace }>(`/functions/namespaces/${namespaceId}`);
    return response.namespace;
  }

  async createFunctionsNamespace(input: FunctionsNamespaceCreateInput): Promise<FunctionsNamespace> {
    const response = await this.request<{ namespace: FunctionsNamespace }>('/functions/namespaces', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.namespace;
  }

  async deleteFunctionsNamespace(namespaceId: string): Promise<void> {
    await this.request<void>(`/functions/namespaces/${namespaceId}`, { method: 'DELETE' });
  }

  async listFunctionsTriggers(namespaceId: string): Promise<FunctionsTrigger[]> {
    const response = await this.request<{ triggers: FunctionsTrigger[] }>(`/functions/namespaces/${namespaceId}/triggers`);
    return response.triggers;
  }

  async getFunctionsTrigger(namespaceId: string, triggerName: string): Promise<FunctionsTrigger> {
    const response = await this.request<{ trigger: FunctionsTrigger }>(`/functions/namespaces/${namespaceId}/triggers/${triggerName}`);
    return response.trigger;
  }

  async createFunctionsTrigger(namespaceId: string, input: FunctionsTriggerCreateInput): Promise<FunctionsTrigger> {
    const response = await this.request<{ trigger: FunctionsTrigger }>(`/functions/namespaces/${namespaceId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.trigger;
  }

  async updateFunctionsTrigger(namespaceId: string, triggerName: string, input: Partial<FunctionsTriggerCreateInput>): Promise<FunctionsTrigger> {
    const response = await this.request<{ trigger: FunctionsTrigger }>(`/functions/namespaces/${namespaceId}/triggers/${triggerName}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return response.trigger;
  }

  async deleteFunctionsTrigger(namespaceId: string, triggerName: string): Promise<void> {
    await this.request<void>(`/functions/namespaces/${namespaceId}/triggers/${triggerName}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Container Registry
  // ===========================================================================

  async getContainerRegistry(): Promise<ContainerRegistry> {
    const response = await this.request<{ registry: ContainerRegistry }>('/registry');
    return response.registry;
  }

  async createContainerRegistry(name: string, subscriptionTier: string, region?: string): Promise<ContainerRegistry> {
    const response = await this.request<{ registry: ContainerRegistry }>('/registry', {
      method: 'POST',
      body: JSON.stringify({ name, subscription_tier_slug: subscriptionTier, region }),
    });
    return response.registry;
  }

  async deleteContainerRegistry(): Promise<void> {
    await this.request<void>('/registry', { method: 'DELETE' });
  }

  async getDockerCredentials(readWrite?: boolean, expirySeconds?: number): Promise<unknown> {
    const query = this.buildQueryString({ read_write: readWrite, expiry_seconds: expirySeconds });
    return this.request<unknown>(`/registry/docker-credentials${query}`);
  }

  async validateRegistryName(name: string): Promise<{ name: string; available: boolean }> {
    const response = await this.request<{ name: string; available: boolean }>('/registry/validate-name', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return response;
  }

  async listContainerRepositories(registryName: string, params?: PaginationParams): Promise<PaginatedResponse<ContainerRepository>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ repositories: ContainerRepository[]; links?: Links; meta?: Meta }>(`/registry/${registryName}/repositoriesV2${query}`);
    return this.parsePaginatedResponse(response, 'repositories');
  }

  async listContainerRepositoryTags(registryName: string, repositoryName: string, params?: PaginationParams): Promise<PaginatedResponse<ContainerRepositoryTag>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ tags: ContainerRepositoryTag[]; links?: Links; meta?: Meta }>(`/registry/${registryName}/repositories/${repositoryName}/tags${query}`);
    return this.parsePaginatedResponse(response, 'tags');
  }

  async deleteContainerRepositoryTag(registryName: string, repositoryName: string, tag: string): Promise<void> {
    await this.request<void>(`/registry/${registryName}/repositories/${repositoryName}/tags/${tag}`, { method: 'DELETE' });
  }

  async deleteContainerRepositoryManifest(registryName: string, repositoryName: string, digest: string): Promise<void> {
    await this.request<void>(`/registry/${registryName}/repositories/${repositoryName}/digests/${encodeURIComponent(digest)}`, { method: 'DELETE' });
  }

  async runGarbageCollection(registryName: string): Promise<unknown> {
    return this.request<unknown>(`/registry/${registryName}/garbage-collection`, { method: 'POST' });
  }

  async getGarbageCollection(registryName: string): Promise<unknown> {
    return this.request<unknown>(`/registry/${registryName}/garbage-collection`);
  }

  async listGarbageCollections(registryName: string, params?: PaginationParams): Promise<PaginatedResponse<unknown>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ garbage_collections: unknown[]; links?: Links; meta?: Meta }>(`/registry/${registryName}/garbage-collections${query}`);
    return this.parsePaginatedResponse(response, 'garbage_collections');
  }

  // ===========================================================================
  // Spaces Keys
  // ===========================================================================

  async listSpacesKeys(params?: PaginationParams): Promise<PaginatedResponse<SpacesKey>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ keys: SpacesKey[]; links?: Links; meta?: Meta }>(`/spaces/keys${query}`);
    return this.parsePaginatedResponse(response, 'keys');
  }

  async getSpacesKey(accessKey: string): Promise<SpacesKey> {
    const response = await this.request<{ key: SpacesKey }>(`/spaces/keys/${accessKey}`);
    return response.key;
  }

  async createSpacesKey(input: SpacesKeyCreateInput): Promise<SpacesKey> {
    const response = await this.request<{ key: SpacesKey }>('/spaces/keys', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.key;
  }

  async updateSpacesKey(accessKey: string, name?: string, grants?: unknown[]): Promise<SpacesKey> {
    const response = await this.request<{ key: SpacesKey }>(`/spaces/keys/${accessKey}`, {
      method: 'PUT',
      body: JSON.stringify({ name, grants }),
    });
    return response.key;
  }

  async deleteSpacesKey(accessKey: string): Promise<void> {
    await this.request<void>(`/spaces/keys/${accessKey}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Billing
  // ===========================================================================

  async getBalance(): Promise<Balance> {
    const response = await this.request<Balance>('/customers/my/balance');
    return response;
  }

  async listBillingHistory(params?: PaginationParams): Promise<PaginatedResponse<BillingHistory>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ billing_history: BillingHistory[]; links?: Links; meta?: Meta }>(`/customers/my/billing_history${query}`);
    return this.parsePaginatedResponse(response, 'billing_history');
  }

  async listInvoices(params?: PaginationParams): Promise<PaginatedResponse<Invoice>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ invoices: Invoice[]; links?: Links; meta?: Meta }>(`/customers/my/invoices${query}`);
    return this.parsePaginatedResponse(response, 'invoices');
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.request<Invoice>(`/customers/my/invoices/${invoiceId}`);
    return response;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const response = await this.request<{ invoice_items: InvoiceItem[] }>(`/customers/my/invoices/${invoiceId}/summary`);
    return response.invoice_items;
  }

  async getInvoicePDF(invoiceId: string): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/customers/my/invoices/${invoiceId}/pdf`, {
      headers: this.getAuthHeaders(),
    });
    return response.arrayBuffer();
  }

  async getInvoiceCSV(invoiceId: string): Promise<string> {
    return this.request<string>(`/customers/my/invoices/${invoiceId}/csv`);
  }

  // ===========================================================================
  // Actions
  // ===========================================================================

  async listActions(params?: PaginationParams): Promise<PaginatedResponse<Action>> {
    const query = this.buildQueryString(params || {});
    const response = await this.request<{ actions: Action[]; links?: Links; meta?: Meta }>(`/actions${query}`);
    return this.parsePaginatedResponse(response, 'actions');
  }

  async getAction(actionId: number): Promise<Action> {
    const response = await this.request<{ action: Action }>(`/actions/${actionId}`);
    return response.action;
  }
}

/**
 * Create a DigitalOcean client instance with tenant-specific credentials.
 */
export function createDigitalOceanClient(credentials: TenantCredentials): DigitalOceanClient {
  return new DigitalOceanClientImpl(credentials);
}
