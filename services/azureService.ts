
import { AzureConnectionConfig, TopologyData, TopologyNode, TopologyLink, ResourceType, AzureRawResource } from '../types';

// Map Azure Resource Types to our internal simplified types
const mapAzureTypeToInternal = (azureType: string): ResourceType => {
  const lower = azureType.toLowerCase();
  if (lower.includes('microsoft.compute/virtualmachines')) return ResourceType.VM;
  if (lower.includes('microsoft.network/virtualnetworks')) return ResourceType.VNET;
  if (lower.includes('microsoft.network/loadbalancers')) return ResourceType.LOAD_BALANCER;
  if (lower.includes('microsoft.network/azurefirewalls')) return ResourceType.FIREWALL;
  if (lower.includes('microsoft.sql/servers')) return ResourceType.SQL;
  if (lower.includes('microsoft.storage/storageaccounts')) return ResourceType.STORAGE;
  if (lower.includes('microsoft.keyvault/vaults')) return ResourceType.KEYVAULT;
  return ResourceType.UNKNOWN;
};

export const connectAndFetch = async (
  config: AzureConnectionConfig,
  onDataUpdate?: (data: TopologyData) => void
): Promise<TopologyData> => {
  console.log('connectAndFetch called with config:', {
    tenantId: config.tenantId,
    clientId: config.clientId,
    subscriptionId: config.subscriptionId,
    hasProxyUrl: !!config.proxyUrl
  });

  try {
    // 1. Authenticate - Get Access Token
    const token = await getAccessToken(config);

    // 2. Query Azure Resource Graph
    const resources = await fetchAzureResources(token, config);

    // 3. Transform Data to Topology
    const topology = transformResourcesToTopology(resources, config.subscriptionId);

    console.log('Topology created with subscriptionId:', topology.subscriptionId);

    // 4. Enrich with Cost Data (async, don't block, with timeout)
    Promise.race([
      enrichTopologyWithCosts(topology, token, config),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Cost fetch timeout')), 10000))
    ])
      .then(() => {
        // Success: Trigger update
        if (onDataUpdate) onDataUpdate({ ...topology });
      })
      .catch(err => {
        console.warn('Failed to fetch cost data:', err.message || err);
        // Set all resource costs to 'Unavailable' if fetch fails
        topology.nodes.forEach(node => {
          if (!node.cost && node.type !== ResourceType.SUBSCRIPTION && node.type !== ResourceType.RESOURCE_GROUP) {
            node.cost = 'Unavailable';
          }
        });
        // Trigger update even on failure so UI shows "Unavailable"
        if (onDataUpdate) onDataUpdate({ ...topology });
      });

    return topology;
  } catch (error: any) {
    console.warn("Azure Connection Failed (Likely CORS or Auth). Switching to Simulation Mode.", error);

    // Fallback to a generated simulation so the user can still experience the app
    // This is necessary because browsers block direct requests to login.microsoftonline.com without a backend proxy
    return generateSimulatedTopology(config.subscriptionId || 'demo-subscription');
  }
};

const getProxiedUrl = (targetUrl: string, proxyUrl?: string) => {
  // 1. If user explicitly provides a proxy (e.g. for local dev), use it.
  if (proxyUrl) {
    const normalizedProxy = proxyUrl.endsWith('/') ? proxyUrl : `${proxyUrl}/`;
    return `${normalizedProxy}${targetUrl}`;
  }

  // 2. If no proxy provided, assume we are in a deployment environment (or capable one)
  // and use our internal serverless proxy.
  // Note: This will fail locally without 'vercel dev', which is expected.
  // The user can use the Advanced Settings for local dev.
  return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
};

const getAccessToken = async (config: AzureConnectionConfig): Promise<string> => {
  const targetUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const url = getProxiedUrl(targetUrl, config.proxyUrl);

  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', config.clientId);
  body.append('client_secret', config.clientSecret);
  body.append('scope', 'https://management.azure.com/.default');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Auth Failed: ${err.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
};

const enrichTopologyWithCosts = async (topology: TopologyData, token: string, config: AzureConnectionConfig): Promise<void> => {
  const subscriptionId = topology.subscriptionId || config.subscriptionId;

  if (!subscriptionId) {
    console.log('Cost enrichment skipped: no subscription ID');
    return;
  }

  console.log('Starting cost enrichment for subscription:', subscriptionId);

  try {
    // Query Azure Cost Management API for current month costs by resource
    const targetUrl = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;
    const url = getProxiedUrl(targetUrl, config.proxyUrl);

    console.log('Cost API URL:', url);

    const now = new Date();
    // Get last complete month for more accurate monthly cost representation
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

    const costQuery = {
      type: "ActualCost",
      timeframe: "Custom",
      timePeriod: {
        from: lastMonthStart.toISOString().split('T')[0],
        to: lastMonthEnd.toISOString().split('T')[0]
      },
      dataset: {
        granularity: "None",
        aggregation: {
          totalCost: {
            name: "Cost",
            function: "Sum"
          }
        },
        grouping: [
          {
            type: "Dimension",
            name: "ResourceId"
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(costQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Cost query failed:', response.status, errorText);
      return;
    }

    const costData = await response.json();

    console.log('Cost API Response structure:', {
      hasProperties: !!costData.properties,
      hasRows: !!costData.properties?.rows,
      rowCount: costData.properties?.rows?.length || 0,
      columns: costData.properties?.columns,
      sampleRows: costData.properties?.rows?.slice(0, 5)
    });

    // Detect currency from the first row or default to USD
    const currencyCode = costData.properties?.rows?.[0]?.[2] || 'USD';
    const currencySymbol = currencyCode === 'EUR' ? '€' : (currencyCode === 'USD' ? '$' : currencyCode + ' ');

    console.log(`Detected Currency: ${currencyCode} (${currencySymbol})`);

    // Map costs to resources
    const costMap = new Map<string, number>();
    if (costData.properties?.rows) {
      costData.properties.rows.forEach((row: any[]) => {
        const cost = row[0]; // Cost value
        const resourceId = row[1]?.toLowerCase(); // Resource ID
        if (resourceId && cost > 0) {
          costMap.set(resourceId, cost);
          // Log first few entries to debug
          if (costMap.size <= 5) {
            console.log('Sample cost entry:', { resourceId: row[1], cost, currency: currencyCode });
          }
        }
      });
    }

    console.log(`Fetched costs for ${costMap.size} resources`);

    // Calculate total subscription cost from ALL resources (not just visualized ones)
    let totalSubscriptionCost = 0;
    costMap.forEach((cost) => {
      totalSubscriptionCost += cost;
    });

    topology.totalCost = totalSubscriptionCost;
    topology.currency = currencySymbol;

    console.log(`Total Subscription Cost: ${currencySymbol}${totalSubscriptionCost.toFixed(2)}`);

    // Apply costs to topology nodes
    let matchedCount = 0;
    topology.nodes.forEach(node => {
      const lowerId = node.id.toLowerCase();

      // Direct match
      if (costMap.has(lowerId)) {
        const cost = costMap.get(lowerId);
        node.cost = `${currencySymbol}${cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        matchedCount++;
      }
      // Parent match (for sub-resources like extensions)
      else {
        // Try to find if this node's ID starts with a known parent ID that has cost
        // This is a heuristic: if we can't find direct cost, look for parent
        // For now, let's just mark unavailable if not found
        if (node.type !== ResourceType.SUBSCRIPTION && node.type !== ResourceType.RESOURCE_GROUP) {
          node.cost = 'Unavailable';
        }
      }
    });

    console.log(`Matched costs for ${matchedCount} nodes out of ${topology.nodes.length}`);

  } catch (error: any) {
    console.warn('Error enriching with costs:', error.message || error);
  }
};

const fetchAzureResources = async (token: string, config: AzureConnectionConfig): Promise<AzureRawResource[]> => {
  const targetUrl = `https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01`;
  const url = getProxiedUrl(targetUrl, config.proxyUrl);

  let query = `Resources | project id, name, type, location, resourceGroup, subscriptionId, tags, properties | limit 500`;

  if (config.subscriptionId) {
    query = `Resources | where subscriptionId == '${config.subscriptionId}' | project id, name, type, location, resourceGroup, subscriptionId, tags, properties | limit 500`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query
    })
  });

  if (!response.ok) {
    throw new Error(`Query Failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
};

const transformResourcesToTopology = (resources: AzureRawResource[], rootSubId: string): TopologyData => {
  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];
  const addedGroups = new Set<string>();

  const subNodeId = rootSubId || (resources[0]?.subscriptionId) || 'root-sub';
  nodes.push({
    id: subNodeId,
    name: 'Subscription',
    type: ResourceType.SUBSCRIPTION,
    group: 'root',
    status: 'OK',
    val: 30
  });

  resources.forEach(res => {
    const internalType = mapAzureTypeToInternal(res.type);
    if (internalType === ResourceType.UNKNOWN) return;

    const rgName = res.resourceGroup;
    const rgId = `rg-${rgName.toLowerCase()}`;

    if (!addedGroups.has(rgName)) {
      nodes.push({
        id: rgId,
        name: rgName,
        type: ResourceType.RESOURCE_GROUP,
        group: subNodeId,
        status: 'OK',
        val: 20,
        location: res.location
      });
      links.push({ source: subNodeId, target: rgId, type: 'contains' });
      addedGroups.add(rgName);
    }

    // Determine status from properties if available
    let status: 'Running' | 'Stopped' | 'Degraded' | 'OK' = 'Running';
    if (res.properties?.provisioningState === 'Failed') {
      status = 'Degraded';
    } else if (res.properties?.powerState?.includes('stopped')) {
      status = 'Stopped';
    } else if (internalType === ResourceType.VM && res.properties?.powerState) {
      status = res.properties.powerState.includes('running') ? 'Running' : 'Stopped';
    } else if ([ResourceType.VNET, ResourceType.SUBNET, ResourceType.RESOURCE_GROUP, ResourceType.SUBSCRIPTION].includes(internalType)) {
      status = 'OK';
    }

    nodes.push({
      id: res.id,
      name: res.name,
      type: internalType,
      group: rgId,
      status: status,
      val: 10,
      location: res.location,
      properties: res.properties
    });

    links.push({ source: rgId, target: res.id, type: 'contains' });
  });

  return { nodes, links, isSimulated: false, subscriptionId: rootSubId };
};

const generateSimulatedTopology = (subId: string): TopologyData => {
  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];

  // Root
  const subNode = { id: subId, name: 'Azure Subscription (Simulated)', type: ResourceType.SUBSCRIPTION, group: 'root', status: 'OK', val: 35 } as TopologyNode;
  nodes.push(subNode);

  // Helper
  const createRG = (name: string, status: 'OK' | 'Degraded' = 'OK') => {
    const id = `rg-${name}`;
    nodes.push({ id, name: name, type: ResourceType.RESOURCE_GROUP, group: subId, status, val: 25 } as TopologyNode);
    links.push({ source: subId, target: id, type: 'contains' });
    return id;
  };

  const createVNet = (rgId: string, name: string) => {
    const id = `vnet-${name}`;
    nodes.push({ id, name, type: ResourceType.VNET, group: rgId, status: 'OK', val: 20 } as TopologyNode);
    links.push({ source: rgId, target: id, type: 'contains' });
    return id;
  };

  // Structure 1: Production App
  const rgProd = createRG('RG-Production-US');
  const vnetProd = createVNet(rgProd, 'VNet-Prod');

  const subWeb = `subnet-web`;
  nodes.push({ id: subWeb, name: 'Subnet-Web', type: ResourceType.SUBNET, group: vnetProd, status: 'OK', val: 15 } as TopologyNode);
  links.push({ source: vnetProd, target: subWeb, type: 'contains' });

  const subData = `subnet-data`;
  nodes.push({ id: subData, name: 'Subnet-Data', type: ResourceType.SUBNET, group: vnetProd, status: 'OK', val: 15 } as TopologyNode);
  links.push({ source: vnetProd, target: subData, type: 'contains' });

  // Resources
  nodes.push({ id: 'vm-prod-01', name: 'VM-Web-01', type: ResourceType.VM, group: subWeb, status: 'Running', val: 10, location: 'eastus', cost: '$145.20' } as TopologyNode);
  links.push({ source: subWeb, target: 'vm-prod-01', type: 'contains' });

  nodes.push({ id: 'vm-prod-02', name: 'VM-Web-02', type: ResourceType.VM, group: subWeb, status: 'Running', val: 10, location: 'eastus', cost: '$145.20' } as TopologyNode);
  links.push({ source: subWeb, target: 'vm-prod-02', type: 'contains' });

  nodes.push({ id: 'sql-primary', name: 'SQL-Primary', type: ResourceType.SQL, group: subData, status: 'OK', val: 12, location: 'eastus', cost: '$320.50' } as TopologyNode);
  links.push({ source: subData, target: 'sql-primary', type: 'contains' });

  // Connections
  links.push({ source: 'vm-prod-01', target: 'sql-primary', type: 'connects' });
  links.push({ source: 'vm-prod-02', target: 'sql-primary', type: 'connects' });

  // Structure 2: Shared Services
  const rgShared = createRG('RG-Shared-Services');
  const vnetHub = createVNet(rgShared, 'VNet-Hub');
  nodes.push({ id: 'fw-hub', name: 'Azure-Firewall', type: ResourceType.FIREWALL, group: vnetHub, status: 'OK', val: 18, location: 'eastus', cost: '$1,250.00' } as TopologyNode);
  links.push({ source: vnetHub, target: 'fw-hub', type: 'contains' });

  // Structure 3: Legacy with issues
  const rgLegacy = createRG('RG-Legacy-Apps', 'Degraded');
  const vnetLegacy = createVNet(rgLegacy, 'VNet-Legacy');
  nodes.push({ id: 'vm-legacy-01', name: 'VM-Legacy', type: ResourceType.VM, group: vnetLegacy, status: 'Degraded', val: 10, location: 'westus', cost: '$89.40' } as TopologyNode);
  links.push({ source: vnetLegacy, target: 'vm-legacy-01', type: 'contains' });

  // Peering
  links.push({ source: vnetProd, target: vnetHub, type: 'connects' });
  links.push({ source: vnetLegacy, target: vnetHub, type: 'connects' });

  return { nodes, links, isSimulated: true, subscriptionId: subId };
};
