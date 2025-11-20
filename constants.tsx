import React from 'react';
import { ResourceType, TopologyData, Alert } from './types';

// Icon paths for D3 nodes and UI
export const ICONS: Record<ResourceType, React.ReactElement> = {
  [ResourceType.SUBSCRIPTION]: <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />,
  [ResourceType.RESOURCE_GROUP]: <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1h18V7c0-1.1-.9-2-2-2zm-8 8h6v-2h-6v2zm-2 2H3v6h6v-6zm8 2h6v-2h-6v2zm0 2h6v2h-6v-2z" />,
  [ResourceType.VNET]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />,
  [ResourceType.SUBNET]: <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z" />,
  [ResourceType.VM]: <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm0-7H9v-2h6v2z" />,
  [ResourceType.SQL]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />,
  [ResourceType.STORAGE]: <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
  [ResourceType.KEYVAULT]: <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />,
  [ResourceType.LOAD_BALANCER]: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 7l-3 4h2v3h2v-3h2l-3-4zM8 7h8v2H8V7z" />,
  [ResourceType.FIREWALL]: <path d="M19.48,12.35c-1.57-4.08-7.16-4.3-5.81-10.23c0.1-0.44-0.37-0.78-0.75-0.55C9.29,3.71,6.68,8,8.87,13.62 c0.18,0.46-0.36,0.89-0.75,0.59c-1.81-1.37-2-3.34-1.84-4.75c0.06-0.52-0.62-0.77-0.91-0.34C4.69,10.16,4,11.84,4,14.37 c0.38,5.6,5.11,7.32,6.81,7.54c2.43,0.31,5.06-0.14,6.95-1.87C19.84,18.11,20.6,15.03,19.48,12.35z M10.2,17.38 c1.44-0.35,2.18-1.39,2.38-2.31c0.24-1.14-0.25-2.34-0.56-3.01c-0.27-0.57,0.55-0.99,0.92-0.48c0.52,0.71,1.5,2.49,0.87,4.8 c-0.14,0.51-0.62,1.01-1.36,1.17c-1.25,0.26-2.49-0.55-2.7-1.66C9.62,15.22,10.05,14.78,10.2,17.38z" />,
  [ResourceType.UNKNOWN]: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
};

export const DEFAULT_TOPOLOGY: TopologyData = {
  nodes: [
    { id: 'sub-1', name: 'Production Sub', type: ResourceType.SUBSCRIPTION, group: 'root', status: 'OK', val: 20 },
    { id: 'rg-core', name: 'RG-Core-US', type: ResourceType.RESOURCE_GROUP, group: 'sub-1', status: 'OK', val: 15 },
    { id: 'vnet-1', name: 'VNet-Primary', type: ResourceType.VNET, group: 'rg-core', status: 'OK', val: 12 },
    { id: 'subnet-web', name: 'Subnet-Web', type: ResourceType.SUBNET, group: 'vnet-1', status: 'OK', val: 8 },
    { id: 'subnet-db', name: 'Subnet-DB', type: ResourceType.SUBNET, group: 'vnet-1', status: 'OK', val: 8 },
    { id: 'vm-web-01', name: 'VM-Web-01', type: ResourceType.VM, group: 'subnet-web', status: 'Running', val: 5 },
    { id: 'vm-web-02', name: 'VM-Web-02', type: ResourceType.VM, group: 'subnet-web', status: 'Running', val: 5 },
    { id: 'sql-prod', name: 'SQL-Prod-Primary', type: ResourceType.SQL, group: 'subnet-db', status: 'OK', val: 7 },
    { id: 'rg-data', name: 'RG-Data', type: ResourceType.RESOURCE_GROUP, group: 'sub-1', status: 'OK', val: 15 },
    { id: 'st-logs', name: 'stlogs001', type: ResourceType.STORAGE, group: 'rg-data', status: 'OK', val: 6 },
  ],
  links: [
    { source: 'sub-1', target: 'rg-core', type: 'contains' },
    { source: 'sub-1', target: 'rg-data', type: 'contains' },
    { source: 'rg-core', target: 'vnet-1', type: 'contains' },
    { source: 'vnet-1', target: 'subnet-web', type: 'contains' },
    { source: 'vnet-1', target: 'subnet-db', type: 'contains' },
    { source: 'subnet-web', target: 'vm-web-01', type: 'contains' },
    { source: 'subnet-web', target: 'vm-web-02', type: 'contains' },
    { source: 'subnet-db', target: 'sql-prod', type: 'contains' },
    { source: 'vm-web-01', target: 'sql-prod', type: 'connects' },
    { source: 'vm-web-02', target: 'sql-prod', type: 'connects' },
    { source: 'rg-data', target: 'st-logs', type: 'contains' },
    { source: 'vm-web-01', target: 'st-logs', type: 'connects' },
  ],
  subscriptionId: 'demo-subscription'
};

export const MOCK_ALERTS: Alert[] = [
  { id: '1', severity: 'Critical', message: 'SQL Database high CPU utilization > 90%', resourceId: 'sql-prod', date: '2023-10-24 14:30' },
  { id: '2', severity: 'Warning', message: 'VM-Web-01 memory usage at 75%', resourceId: 'vm-web-01', date: '2023-10-24 12:15' },
  { id: '3', severity: 'Info', message: 'Backup completed successfully', resourceId: 'st-logs', date: '2023-10-24 08:00' },
];