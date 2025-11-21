
export enum ResourceType {
  SUBSCRIPTION = 'Subscription',
  RESOURCE_GROUP = 'ResourceGroup',
  VNET = 'VirtualNetwork',
  SUBNET = 'Subnet',
  VM = 'VirtualMachine',
  SQL = 'SQLDatabase',
  STORAGE = 'StorageAccount',
  KEYVAULT = 'KeyVault',
  LOAD_BALANCER = 'LoadBalancer',
  FIREWALL = 'Firewall',
  UNKNOWN = 'Unknown'
}

export interface AzureResource {
  id: string;
  name: string;
  type: ResourceType;
  region: string;
  tags?: Record<string, string>;
  status?: 'Running' | 'Stopped' | 'Degraded' | 'OK';
  costMonthToDate?: number;
  properties?: Record<string, any>;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: ResourceType;
  group: string; // Usually Resource Group Name
  status: 'Running' | 'Stopped' | 'Degraded' | 'OK';
  val: number; // For sizing
  location?: string;
  cost?: string;
  properties?: any;
  // d3-force specific properties
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface TopologyLink {
  source: string | TopologyNode;
  target: string | TopologyNode;
  type: 'contains' | 'connects';
  // d3-force specific properties
  index?: number;
}

export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
  isSimulated?: boolean;
  subscriptionId?: string;
  totalCost?: number;
  currency?: string;
  rawCostItems?: any[]; // Full list of cost items
  analysis?: {
    cost?: any;
    security?: any;
  };
  costHistory?: { date: string; cost: number }[];
}

export interface CostItem {
  id: string;
  name: string;
  type: string;
  cost: number;
  currency: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  resourceId: string;
  date: string;
}

export interface AzureConnectionConfig {
  id?: string;
  name?: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId: string;
  proxyUrl?: string; // New optional field for CORS proxy
}

// Raw Azure Resource Graph Response Type
export interface AzureRawResource {
  id: string;
  name: string;
  type: string;
  location: string;
  resourceGroup: string;
  subscriptionId: string;
  tags?: Record<string, string>;
  properties?: any;
}
