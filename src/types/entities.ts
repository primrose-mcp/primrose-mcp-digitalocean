/**
 * DigitalOcean Entity Types
 *
 * Type definitions for DigitalOcean API resources.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return */
  per_page?: number;
  /** Page number */
  page?: number;
  /** Index signature to allow additional properties */
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  total?: number;
  hasMore: boolean;
  nextPage?: number;
}

export interface Links {
  pages?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

export interface Meta {
  total: number;
}

// =============================================================================
// Account
// =============================================================================

export interface Account {
  uuid: string;
  email: string;
  email_verified: boolean;
  droplet_limit: number;
  floating_ip_limit: number;
  volume_limit: number;
  status: string;
  status_message: string;
  team?: {
    uuid: string;
    name: string;
  };
}

// =============================================================================
// Droplet
// =============================================================================

export interface Droplet {
  id: number;
  name: string;
  memory: number;
  vcpus: number;
  disk: number;
  locked: boolean;
  status: 'new' | 'active' | 'off' | 'archive';
  created_at: string;
  features: string[];
  backup_ids: number[];
  snapshot_ids: number[];
  image: Image;
  volume_ids: string[];
  size: Size;
  size_slug: string;
  networks: Networks;
  region: Region;
  tags: string[];
  vpc_uuid?: string;
}

export interface Networks {
  v4: NetworkInterface[];
  v6: NetworkInterface[];
}

export interface NetworkInterface {
  ip_address: string;
  netmask?: string;
  gateway: string;
  type: 'public' | 'private';
}

export interface DropletCreateInput {
  name: string;
  region: string;
  size: string;
  image: string | number;
  ssh_keys?: (string | number)[];
  backups?: boolean;
  ipv6?: boolean;
  monitoring?: boolean;
  vpc_uuid?: string;
  user_data?: string;
  tags?: string[];
  volumes?: string[];
  with_droplet_agent?: boolean;
}

// =============================================================================
// Image
// =============================================================================

export interface Image {
  id: number;
  name: string;
  type: 'snapshot' | 'backup' | 'custom';
  distribution: string;
  slug?: string;
  public: boolean;
  regions: string[];
  min_disk_size: number;
  size_gigabytes: number;
  created_at: string;
  description?: string;
  tags: string[];
  status: 'available' | 'pending' | 'deleted';
  error_message?: string;
}

// =============================================================================
// Size
// =============================================================================

export interface Size {
  slug: string;
  memory: number;
  vcpus: number;
  disk: number;
  transfer: number;
  price_monthly: number;
  price_hourly: number;
  regions: string[];
  available: boolean;
  description: string;
}

// =============================================================================
// Region
// =============================================================================

export interface Region {
  slug: string;
  name: string;
  sizes: string[];
  available: boolean;
  features: string[];
}

// =============================================================================
// SSH Key
// =============================================================================

export interface SSHKey {
  id: number;
  fingerprint: string;
  public_key: string;
  name: string;
}

export interface SSHKeyCreateInput {
  name: string;
  public_key: string;
}

// =============================================================================
// Domain
// =============================================================================

export interface Domain {
  name: string;
  ttl: number;
  zone_file?: string;
}

export interface DomainRecord {
  id: number;
  type: string;
  name: string;
  data: string;
  priority?: number;
  port?: number;
  ttl: number;
  weight?: number;
  flags?: number;
  tag?: string;
}

export interface DomainRecordCreateInput {
  type: string;
  name: string;
  data: string;
  priority?: number;
  port?: number;
  ttl?: number;
  weight?: number;
  flags?: number;
  tag?: string;
}

// =============================================================================
// Volume
// =============================================================================

export interface Volume {
  id: string;
  region: Region;
  droplet_ids: number[];
  name: string;
  description: string;
  size_gigabytes: number;
  filesystem_type: string;
  filesystem_label: string;
  created_at: string;
  tags: string[];
}

export interface VolumeCreateInput {
  size_gigabytes: number;
  name: string;
  description?: string;
  region: string;
  snapshot_id?: string;
  filesystem_type?: string;
  filesystem_label?: string;
  tags?: string[];
}

// =============================================================================
// Snapshot
// =============================================================================

export interface Snapshot {
  id: string;
  name: string;
  regions: string[];
  created_at: string;
  resource_id: string;
  resource_type: 'droplet' | 'volume';
  min_disk_size: number;
  size_gigabytes: number;
  tags: string[];
}

// =============================================================================
// Firewall
// =============================================================================

export interface Firewall {
  id: string;
  name: string;
  status: 'waiting' | 'succeeded' | 'failed';
  inbound_rules: FirewallRule[];
  outbound_rules: FirewallRule[];
  created_at: string;
  droplet_ids: number[];
  tags: string[];
  pending_changes: FirewallPendingChange[];
}

export interface FirewallRule {
  protocol: 'tcp' | 'udp' | 'icmp';
  ports: string;
  sources?: FirewallRuleTarget;
  destinations?: FirewallRuleTarget;
}

export interface FirewallRuleTarget {
  addresses?: string[];
  droplet_ids?: number[];
  load_balancer_uids?: string[];
  kubernetes_ids?: string[];
  tags?: string[];
}

export interface FirewallPendingChange {
  droplet_id: number;
  removing: boolean;
  status: string;
}

export interface FirewallCreateInput {
  name: string;
  inbound_rules?: FirewallRule[];
  outbound_rules?: FirewallRule[];
  droplet_ids?: number[];
  tags?: string[];
}

// =============================================================================
// Load Balancer
// =============================================================================

export interface LoadBalancer {
  id: string;
  name: string;
  ip: string;
  algorithm: 'round_robin' | 'least_connections';
  status: 'new' | 'active' | 'errored';
  created_at: string;
  forwarding_rules: ForwardingRule[];
  health_check: HealthCheck;
  sticky_sessions: StickySessions;
  region: Region;
  droplet_ids: number[];
  tag?: string;
  vpc_uuid?: string;
  redirect_http_to_https: boolean;
  enable_proxy_protocol: boolean;
  enable_backend_keepalive: boolean;
  disable_lets_encrypt_dns_records: boolean;
  project_id?: string;
  http_idle_timeout_seconds?: number;
  firewall?: LoadBalancerFirewall;
}

export interface ForwardingRule {
  entry_protocol: 'http' | 'https' | 'http2' | 'http3' | 'tcp' | 'udp';
  entry_port: number;
  target_protocol: 'http' | 'https' | 'http2' | 'tcp' | 'udp';
  target_port: number;
  certificate_id?: string;
  tls_passthrough?: boolean;
}

export interface HealthCheck {
  protocol: 'http' | 'https' | 'tcp';
  port: number;
  path?: string;
  check_interval_seconds: number;
  response_timeout_seconds: number;
  unhealthy_threshold: number;
  healthy_threshold: number;
}

export interface StickySessions {
  type: 'none' | 'cookies';
  cookie_name?: string;
  cookie_ttl_seconds?: number;
}

export interface LoadBalancerFirewall {
  deny?: string[];
  allow?: string[];
}

export interface LoadBalancerCreateInput {
  name: string;
  region: string;
  size?: 'lb-small' | 'lb-medium' | 'lb-large';
  size_unit?: number;
  forwarding_rules: ForwardingRule[];
  health_check?: HealthCheck;
  sticky_sessions?: StickySessions;
  droplet_ids?: number[];
  tag?: string;
  redirect_http_to_https?: boolean;
  enable_proxy_protocol?: boolean;
  enable_backend_keepalive?: boolean;
  vpc_uuid?: string;
  project_id?: string;
  http_idle_timeout_seconds?: number;
  firewall?: LoadBalancerFirewall;
}

// =============================================================================
// VPC
// =============================================================================

export interface VPC {
  id: string;
  urn: string;
  name: string;
  description?: string;
  region: string;
  ip_range: string;
  default: boolean;
  created_at: string;
}

export interface VPCCreateInput {
  name: string;
  region: string;
  description?: string;
  ip_range?: string;
}

export interface VPCMember {
  urn: string;
  name: string;
  created_at: string;
}

// =============================================================================
// Kubernetes
// =============================================================================

export interface KubernetesCluster {
  id: string;
  name: string;
  region: string;
  version: string;
  cluster_subnet: string;
  service_subnet: string;
  vpc_uuid: string;
  ipv4: string;
  endpoint: string;
  tags: string[];
  node_pools: KubernetesNodePool[];
  maintenance_policy?: MaintenancePolicy;
  auto_upgrade: boolean;
  status: KubernetesClusterStatus;
  created_at: string;
  updated_at: string;
  surge_upgrade: boolean;
  registry_enabled: boolean;
  ha: boolean;
}

export interface KubernetesNodePool {
  id: string;
  name: string;
  size: string;
  count: number;
  tags: string[];
  labels?: Record<string, string>;
  taints?: KubernetesTaint[];
  auto_scale: boolean;
  min_nodes?: number;
  max_nodes?: number;
  nodes: KubernetesNode[];
}

export interface KubernetesNode {
  id: string;
  name: string;
  status: KubernetesNodeStatus;
  droplet_id: string;
  created_at: string;
  updated_at: string;
}

export interface KubernetesNodeStatus {
  state: 'provisioning' | 'running' | 'draining' | 'deleting';
}

export interface KubernetesClusterStatus {
  state: 'running' | 'provisioning' | 'degraded' | 'error' | 'deleted' | 'upgrading' | 'deleting';
  message?: string;
}

export interface KubernetesTaint {
  key: string;
  value: string;
  effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
}

export interface MaintenancePolicy {
  start_time: string;
  day: 'any' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}

export interface KubernetesClusterCreateInput {
  name: string;
  region: string;
  version: string;
  vpc_uuid?: string;
  tags?: string[];
  node_pools: KubernetesNodePoolCreateInput[];
  maintenance_policy?: MaintenancePolicy;
  auto_upgrade?: boolean;
  surge_upgrade?: boolean;
  ha?: boolean;
}

export interface KubernetesNodePoolCreateInput {
  name: string;
  size: string;
  count: number;
  tags?: string[];
  labels?: Record<string, string>;
  taints?: KubernetesTaint[];
  auto_scale?: boolean;
  min_nodes?: number;
  max_nodes?: number;
}

export interface KubernetesOptions {
  versions: KubernetesVersion[];
  regions: KubernetesRegion[];
  sizes: KubernetesSize[];
}

export interface KubernetesVersion {
  slug: string;
  kubernetes_version: string;
  supported_features: string[];
}

export interface KubernetesRegion {
  name: string;
  slug: string;
}

export interface KubernetesSize {
  name: string;
  slug: string;
}

// =============================================================================
// Database
// =============================================================================

export interface Database {
  id: string;
  name: string;
  engine: 'pg' | 'mysql' | 'redis' | 'mongodb' | 'kafka' | 'opensearch';
  version: string;
  semantic_version?: string;
  connection: DatabaseConnection;
  private_connection?: DatabaseConnection;
  standby_connection?: DatabaseConnection;
  standby_private_connection?: DatabaseConnection;
  users: DatabaseUser[];
  db_names: string[];
  num_nodes: number;
  size: string;
  region: string;
  status: 'creating' | 'online' | 'resizing' | 'migrating' | 'forking';
  created_at: string;
  maintenance_window?: DatabaseMaintenanceWindow;
  private_network_uuid?: string;
  tags: string[];
  project_id?: string;
}

export interface DatabaseConnection {
  uri: string;
  database: string;
  host: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
}

export interface DatabaseUser {
  name: string;
  role: 'primary' | 'normal';
  password?: string;
  mysql_settings?: {
    auth_plugin: 'mysql_native_password' | 'caching_sha2_password';
  };
}

export interface DatabaseMaintenanceWindow {
  day: string;
  hour: string;
  pending: boolean;
  description: string[];
}

export interface DatabaseCreateInput {
  name: string;
  engine: 'pg' | 'mysql' | 'redis' | 'mongodb' | 'kafka' | 'opensearch';
  version?: string;
  size: string;
  region: string;
  num_nodes: number;
  tags?: string[];
  private_network_uuid?: string;
  project_id?: string;
}

export interface DatabaseReplica {
  name: string;
  connection: DatabaseConnection;
  private_connection?: DatabaseConnection;
  region: string;
  status: string;
  created_at: string;
  size?: string;
  tags?: string[];
}

export interface DatabasePool {
  name: string;
  mode: 'transaction' | 'session' | 'statement';
  size: number;
  db: string;
  user: string;
  connection?: DatabaseConnection;
  private_connection?: DatabaseConnection;
}

export interface DatabaseFirewallRule {
  uuid: string;
  cluster_uuid: string;
  type: 'droplet' | 'k8s' | 'ip_addr' | 'tag' | 'app';
  value: string;
  created_at: string;
}

// =============================================================================
// App Platform
// =============================================================================

export interface App {
  id: string;
  owner_uuid: string;
  spec: AppSpec;
  default_ingress?: string;
  created_at: string;
  updated_at: string;
  active_deployment?: AppDeployment;
  in_progress_deployment?: AppDeployment;
  pending_deployment?: AppDeployment;
  last_deployment_created_at?: string;
  live_url?: string;
  live_url_base?: string;
  live_domain?: string;
  region: AppRegion;
  tier_slug: string;
  domains?: AppDomain[];
  pinned_deployment?: AppPinnedDeployment;
  project_id?: string;
}

export interface AppSpec {
  name: string;
  region?: string;
  domains?: AppDomainSpec[];
  services?: AppServiceSpec[];
  static_sites?: AppStaticSiteSpec[];
  jobs?: AppJobSpec[];
  workers?: AppWorkerSpec[];
  functions?: AppFunctionSpec[];
  databases?: AppDatabaseSpec[];
  ingress?: AppIngressSpec;
}

export interface AppServiceSpec {
  name: string;
  git?: GitSourceSpec;
  github?: GitHubSourceSpec;
  gitlab?: GitLabSourceSpec;
  image?: ImageSourceSpec;
  dockerfile_path?: string;
  build_command?: string;
  run_command?: string;
  source_dir?: string;
  envs?: AppEnvVar[];
  environment_slug?: string;
  instance_count?: number;
  instance_size_slug?: string;
  http_port?: number;
  internal_ports?: number[];
  routes?: AppRouteSpec[];
  health_check?: AppHealthCheckSpec;
  cors?: AppCorsSpec;
  alerts?: AppAlertSpec[];
  log_destinations?: AppLogDestinationSpec[];
  autoscaling?: AppAutoscalingSpec;
}

export interface AppStaticSiteSpec {
  name: string;
  git?: GitSourceSpec;
  github?: GitHubSourceSpec;
  gitlab?: GitLabSourceSpec;
  dockerfile_path?: string;
  build_command?: string;
  source_dir?: string;
  output_dir?: string;
  index_document?: string;
  error_document?: string;
  catchall_document?: string;
  envs?: AppEnvVar[];
  routes?: AppRouteSpec[];
  cors?: AppCorsSpec;
}

export interface AppJobSpec {
  name: string;
  git?: GitSourceSpec;
  github?: GitHubSourceSpec;
  gitlab?: GitLabSourceSpec;
  image?: ImageSourceSpec;
  dockerfile_path?: string;
  build_command?: string;
  run_command?: string;
  source_dir?: string;
  envs?: AppEnvVar[];
  environment_slug?: string;
  instance_count?: number;
  instance_size_slug?: string;
  kind: 'UNSPECIFIED' | 'PRE_DEPLOY' | 'POST_DEPLOY' | 'FAILED_DEPLOY';
  alerts?: AppAlertSpec[];
  log_destinations?: AppLogDestinationSpec[];
}

export interface AppWorkerSpec {
  name: string;
  git?: GitSourceSpec;
  github?: GitHubSourceSpec;
  gitlab?: GitLabSourceSpec;
  image?: ImageSourceSpec;
  dockerfile_path?: string;
  build_command?: string;
  run_command?: string;
  source_dir?: string;
  envs?: AppEnvVar[];
  environment_slug?: string;
  instance_count?: number;
  instance_size_slug?: string;
  alerts?: AppAlertSpec[];
  log_destinations?: AppLogDestinationSpec[];
  autoscaling?: AppAutoscalingSpec;
}

export interface AppFunctionSpec {
  name: string;
  git?: GitSourceSpec;
  github?: GitHubSourceSpec;
  gitlab?: GitLabSourceSpec;
  source_dir?: string;
  alerts?: AppAlertSpec[];
  routes?: AppRouteSpec[];
  cors?: AppCorsSpec;
  log_destinations?: AppLogDestinationSpec[];
}

export interface AppDatabaseSpec {
  name: string;
  engine?: 'UNSET' | 'MYSQL' | 'PG' | 'REDIS' | 'MONGODB' | 'KAFKA' | 'OPENSEARCH';
  version?: string;
  size?: string;
  num_nodes?: number;
  production?: boolean;
  cluster_name?: string;
  db_name?: string;
  db_user?: string;
}

export interface GitSourceSpec {
  repo_clone_url: string;
  branch?: string;
}

export interface GitHubSourceSpec {
  repo: string;
  branch?: string;
  deploy_on_push?: boolean;
}

export interface GitLabSourceSpec {
  repo: string;
  branch?: string;
  deploy_on_push?: boolean;
}

export interface ImageSourceSpec {
  registry_type: 'DOCR' | 'DOCKER_HUB' | 'GHCR';
  registry?: string;
  repository: string;
  tag?: string;
  digest?: string;
  registry_credentials?: string;
  deploy_on_push?: {
    enabled?: boolean;
  };
}

export interface AppEnvVar {
  key: string;
  value?: string;
  scope?: 'RUN_TIME' | 'BUILD_TIME' | 'RUN_AND_BUILD_TIME';
  type?: 'GENERAL' | 'SECRET';
}

export interface AppRouteSpec {
  path?: string;
  preserve_path_prefix?: boolean;
}

export interface AppHealthCheckSpec {
  http_path?: string;
  initial_delay_seconds?: number;
  period_seconds?: number;
  timeout_seconds?: number;
  success_threshold?: number;
  failure_threshold?: number;
  port?: number;
}

export interface AppCorsSpec {
  allow_origins?: AppCorsOrigin[];
  allow_methods?: string[];
  allow_headers?: string[];
  expose_headers?: string[];
  max_age?: string;
  allow_credentials?: boolean;
}

export interface AppCorsOrigin {
  exact?: string;
  prefix?: string;
  regex?: string;
}

export interface AppAlertSpec {
  rule: 'UNSPECIFIED_RULE' | 'CPU_UTILIZATION' | 'MEM_UTILIZATION' | 'RESTART_COUNT' | 'DEPLOYMENT_FAILED' | 'DEPLOYMENT_LIVE' | 'DEPLOYMENT_STARTED' | 'DEPLOYMENT_CANCELED' | 'DOMAIN_FAILED' | 'DOMAIN_LIVE' | 'FUNCTIONS_ACTIVATION_COUNT' | 'FUNCTIONS_AVERAGE_DURATION_MS' | 'FUNCTIONS_ERROR_RATE_PER_MINUTE' | 'FUNCTIONS_AVERAGE_WAIT_DURATION_MS' | 'FUNCTIONS_ERROR_COUNT' | 'FUNCTIONS_GB_RATE_PER_SECOND';
  disabled?: boolean;
  operator?: 'UNSPECIFIED_OPERATOR' | 'GREATER_THAN' | 'LESS_THAN';
  value?: number;
  window?: 'UNSPECIFIED_WINDOW' | 'FIVE_MINUTES' | 'TEN_MINUTES' | 'THIRTY_MINUTES' | 'ONE_HOUR';
}

export interface AppLogDestinationSpec {
  name: string;
  papertrail?: {
    endpoint: string;
  };
  datadog?: {
    endpoint?: string;
    api_key: string;
  };
  logtail?: {
    token: string;
  };
  open_search?: {
    endpoint: string;
    basic_auth?: {
      user?: string;
      password?: string;
    };
    index_name: string;
    cluster_name?: string;
  };
}

export interface AppAutoscalingSpec {
  min_instance_count: number;
  max_instance_count: number;
  metrics: AppAutoscalingMetricSpec;
}

export interface AppAutoscalingMetricSpec {
  cpu?: {
    percent: number;
  };
}

export interface AppDomainSpec {
  domain: string;
  type?: 'UNSPECIFIED' | 'DEFAULT' | 'PRIMARY' | 'ALIAS';
  wildcard?: boolean;
  zone?: string;
  minimum_tls_version?: string;
}

export interface AppIngressSpec {
  rules?: AppIngressSpecRule[];
}

export interface AppIngressSpecRule {
  match?: {
    path?: {
      prefix?: string;
    };
  };
  component?: {
    name?: string;
    preserve_path_prefix?: boolean;
    rewrite?: string;
  };
  redirect?: {
    uri?: string;
    authority?: string;
    port?: number;
    scheme?: string;
    redirect_code?: number;
  };
  cors?: AppCorsSpec;
}

export interface AppDeployment {
  id: string;
  spec: AppSpec;
  services?: AppDeploymentService[];
  static_sites?: AppDeploymentStaticSite[];
  workers?: AppDeploymentWorker[];
  jobs?: AppDeploymentJob[];
  functions?: AppDeploymentFunctions[];
  phase: 'UNKNOWN' | 'PENDING_BUILD' | 'BUILDING' | 'PENDING_DEPLOY' | 'DEPLOYING' | 'ACTIVE' | 'SUPERSEDED' | 'ERROR' | 'CANCELED';
  phase_last_updated_at: string;
  created_at: string;
  updated_at: string;
  cause: string;
  cloned_from?: string;
  progress?: AppDeploymentProgress;
  timing?: AppDeploymentTiming;
}

export interface AppDeploymentService {
  name: string;
  source_commit_hash?: string;
}

export interface AppDeploymentStaticSite {
  name: string;
  source_commit_hash?: string;
}

export interface AppDeploymentWorker {
  name: string;
  source_commit_hash?: string;
}

export interface AppDeploymentJob {
  name: string;
  source_commit_hash?: string;
}

export interface AppDeploymentFunctions {
  name: string;
  source_commit_hash?: string;
  namespace?: string;
}

export interface AppDeploymentProgress {
  pending_steps: number;
  running_steps: number;
  success_steps: number;
  error_steps: number;
  total_steps: number;
  steps: AppDeploymentProgressStep[];
}

export interface AppDeploymentProgressStep {
  name: string;
  status: 'UNKNOWN' | 'PENDING' | 'RUNNING' | 'ERROR' | 'SUCCESS';
  component_name?: string;
  message_base?: string;
  reason?: AppDeploymentProgressStepReason;
  started_at?: string;
  ended_at?: string;
}

export interface AppDeploymentProgressStepReason {
  code?: string;
  message?: string;
}

export interface AppDeploymentTiming {
  pending?: string;
  building?: string;
  deploying?: string;
}

export interface AppRegion {
  slug: string;
  label: string;
  flag: string;
  continent: string;
  data_centers: string[];
  disabled: boolean;
  reason?: string;
  default: boolean;
}

export interface AppDomain {
  id: string;
  spec: AppDomainSpec;
  phase: 'UNKNOWN' | 'PENDING' | 'CONFIGURING' | 'ACTIVE' | 'ERROR';
  progress?: AppDomainProgress;
  validation?: AppDomainValidation;
  rotate_validation_records?: boolean;
  certificate_expires_at?: string;
}

export interface AppDomainProgress {
  steps: AppDomainProgressStep[];
}

export interface AppDomainProgressStep {
  name: string;
  status: 'UNKNOWN' | 'PENDING' | 'RUNNING' | 'ERROR' | 'SUCCESS';
  started_at?: string;
  ended_at?: string;
  reason?: {
    code?: string;
    message?: string;
  };
}

export interface AppDomainValidation {
  txt_name?: string;
  txt_value?: string;
}

export interface AppPinnedDeployment {
  id: string;
  cause: string;
  cause_details?: AppPinnedDeploymentCauseDetails;
}

export interface AppPinnedDeploymentCauseDetails {
  type: string;
  digital_ocean_user_action?: {
    name: string;
    email: string;
  };
}

export interface AppCreateInput {
  spec: AppSpec;
  project_id?: string;
}

// =============================================================================
// Tag
// =============================================================================

export interface Tag {
  name: string;
  resources: TagResources;
}

export interface TagResources {
  count: number;
  last_tagged_uri?: string;
  droplets?: { count: number; last_tagged_uri?: string };
  images?: { count: number; last_tagged_uri?: string };
  volumes?: { count: number; last_tagged_uri?: string };
  volume_snapshots?: { count: number; last_tagged_uri?: string };
  databases?: { count: number; last_tagged_uri?: string };
}

// =============================================================================
// Project
// =============================================================================

export interface Project {
  id: string;
  owner_uuid: string;
  owner_id: number;
  name: string;
  description: string;
  purpose: string;
  environment: 'Development' | 'Staging' | 'Production';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectResource {
  urn: string;
  assigned_at: string;
  links: {
    self: string;
  };
  status: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  purpose: string;
  environment: 'Development' | 'Staging' | 'Production';
}

// =============================================================================
// Reserved IP
// =============================================================================

export interface ReservedIP {
  ip: string;
  region: Region;
  droplet?: Droplet;
  locked: boolean;
  project_id?: string;
}

// =============================================================================
// Certificate
// =============================================================================

export interface Certificate {
  id: string;
  name: string;
  not_after: string;
  sha1_fingerprint: string;
  created_at: string;
  dns_names: string[];
  state: 'pending' | 'verified' | 'error';
  type: 'custom' | 'lets_encrypt';
}

export interface CertificateCreateInput {
  name: string;
  type: 'custom' | 'lets_encrypt';
  dns_names?: string[];
  private_key?: string;
  leaf_certificate?: string;
  certificate_chain?: string;
}

// =============================================================================
// CDN Endpoint
// =============================================================================

export interface CDNEndpoint {
  id: string;
  origin: string;
  endpoint: string;
  created_at: string;
  certificate_id?: string;
  custom_domain?: string;
  ttl: number;
}

export interface CDNEndpointCreateInput {
  origin: string;
  ttl?: number;
  certificate_id?: string;
  custom_domain?: string;
}

// =============================================================================
// Uptime
// =============================================================================

export interface UptimeCheck {
  id: string;
  name: string;
  type: 'ping' | 'http' | 'https';
  target: string;
  regions: string[];
  enabled: boolean;
}

export interface UptimeCheckCreateInput {
  name: string;
  type: 'ping' | 'http' | 'https';
  target: string;
  regions?: string[];
  enabled?: boolean;
}

export interface UptimeAlert {
  id: string;
  name: string;
  type: 'latency' | 'down' | 'down_global' | 'ssl_expiry';
  threshold?: number;
  comparison?: 'greater_than' | 'less_than';
  notifications: UptimeAlertNotifications;
  period: string;
}

export interface UptimeAlertNotifications {
  email?: string[];
  slack?: UptimeSlackDetails[];
}

export interface UptimeSlackDetails {
  channel: string;
  url: string;
}

export interface UptimeAlertCreateInput {
  name: string;
  type: 'latency' | 'down' | 'down_global' | 'ssl_expiry';
  threshold?: number;
  comparison?: 'greater_than' | 'less_than';
  notifications: UptimeAlertNotifications;
  period: string;
}

// =============================================================================
// Monitoring
// =============================================================================

export interface AlertPolicy {
  uuid: string;
  type: string;
  description: string;
  compare: 'GreaterThan' | 'LessThan';
  value: number;
  window: string;
  entities: string[];
  tags: string[];
  alerts: AlertPolicyAlerts;
  enabled: boolean;
}

export interface AlertPolicyAlerts {
  email?: string[];
  slack?: AlertPolicySlackDetails[];
}

export interface AlertPolicySlackDetails {
  channel: string;
  url: string;
}

export interface AlertPolicyCreateInput {
  type: string;
  description: string;
  compare: 'GreaterThan' | 'LessThan';
  value: number;
  window: string;
  entities: string[];
  tags?: string[];
  alerts: AlertPolicyAlerts;
  enabled?: boolean;
}

// =============================================================================
// Functions
// =============================================================================

export interface FunctionsNamespace {
  api_host: string;
  namespace: string;
  created_at: string;
  updated_at: string;
  label: string;
  region: string;
  uuid: string;
}

export interface FunctionsNamespaceCreateInput {
  region: string;
  label: string;
}

export interface FunctionsTrigger {
  name: string;
  function: string;
  type: 'SCHEDULED';
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  scheduled_details?: {
    cron: string;
    body?: Record<string, unknown>;
  };
  scheduled_runs?: {
    last_run_at?: string;
    next_run_at?: string;
  };
}

export interface FunctionsTriggerCreateInput {
  name: string;
  function: string;
  type: 'SCHEDULED';
  is_enabled: boolean;
  scheduled_details: {
    cron: string;
    body?: Record<string, unknown>;
  };
}

// =============================================================================
// Container Registry
// =============================================================================

export interface ContainerRegistry {
  name: string;
  created_at: string;
  storage_usage_bytes: number;
  storage_usage_bytes_updated_at: string;
  subscription?: ContainerRegistrySubscription;
  region: string;
}

export interface ContainerRegistrySubscription {
  tier: ContainerRegistryTier;
  created_at: string;
  updated_at: string;
}

export interface ContainerRegistryTier {
  name: string;
  slug: string;
  included_repositories: number;
  included_storage_bytes: number;
  allow_storage_overage: boolean;
  included_bandwidth_bytes: number;
  monthly_price_in_cents: number;
  storage_overage_price_in_cents?: number;
}

export interface ContainerRepository {
  registry_name: string;
  name: string;
  latest_manifest?: ContainerRepositoryManifest;
  tag_count: number;
  manifest_count: number;
}

export interface ContainerRepositoryManifest {
  registry_name: string;
  repository: string;
  digest: string;
  compressed_size_bytes: number;
  size_bytes: number;
  updated_at: string;
  tags: string[];
  blobs: ContainerRepositoryBlob[];
}

export interface ContainerRepositoryBlob {
  digest: string;
  compressed_size_bytes: number;
}

export interface ContainerRepositoryTag {
  registry_name: string;
  repository: string;
  tag: string;
  manifest_digest: string;
  compressed_size_bytes: number;
  size_bytes: number;
  updated_at: string;
}

// =============================================================================
// Spaces Keys
// =============================================================================

export interface SpacesKey {
  name: string;
  access_key: string;
  secret_key?: string;
  grants: SpacesGrant[];
}

export interface SpacesGrant {
  bucket?: string;
  permission: 'read' | 'readwrite' | 'fullaccess';
}

export interface SpacesKeyCreateInput {
  name: string;
  grants: SpacesGrant[];
}

// =============================================================================
// Action
// =============================================================================

export interface Action {
  id: number;
  status: 'in-progress' | 'completed' | 'errored';
  type: string;
  started_at: string;
  completed_at?: string;
  resource_id: number;
  resource_type: string;
  region?: Region;
  region_slug?: string;
}

// =============================================================================
// Billing
// =============================================================================

export interface Balance {
  month_to_date_balance: string;
  account_balance: string;
  month_to_date_usage: string;
  generated_at: string;
}

export interface BillingHistory {
  description: string;
  amount: string;
  invoice_id?: string;
  invoice_uuid?: string;
  date: string;
  type: 'ACHFailure' | 'Adjustment' | 'AttemptedPayment' | 'Authorization' | 'CreditExpiration' | 'Invoice' | 'Payment' | 'Refund' | 'Reversal';
}

export interface Invoice {
  invoice_uuid: string;
  amount: string;
  invoice_period: string;
  updated_at: string;
}

export interface InvoiceItem {
  product: string;
  resource_uuid: string;
  resource_id: string;
  group_description: string;
  description: string;
  amount: string;
  duration: string;
  duration_unit: string;
  start_time: string;
  end_time: string;
  project_name: string;
  category: string;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
