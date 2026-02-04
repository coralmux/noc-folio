export interface ResumeEntry {
  title: string;
  period: string;
  organization: string;
  description: string;
  techStack: string[];
  highlights: string[];
}

export const RESUME_DATA: Record<string, ResumeEntry> = {
  firewall: {
    title: 'DDoS Detection & Blocking System',
    period: '2018 - 2020',
    organization: 'KT',
    description: 'Real-time DDoS detection system capable of processing 800K packets/min',
    techStack: ['C/C++', 'DPDK', 'Python', 'Netfilter'],
    highlights: [
      '800K packets/min real-time processing',
      'ML-based anomaly traffic detection',
      'Auto-blocking rule generation engine',
    ],
  },
  bigdata: {
    title: 'Big Data Analytics Platform',
    period: '2019 - 2021',
    organization: 'KT',
    description: 'Network log analysis cluster built on Hadoop/Kudu/Impala',
    techStack: ['Hadoop', 'Kudu', 'Impala', 'Spark', 'Python'],
    highlights: [
      '10TB daily network log collection & analysis',
      'Kudu + Impala real-time query optimization',
      'Spark-based batch analysis pipeline',
    ],
  },
  ai: {
    title: 'AI EDR / ML DDoS Detection',
    period: '2020 - 2022',
    organization: 'KT',
    description: 'AI-powered endpoint detection & response system, ML DDoS detection patent',
    techStack: ['Python', 'TensorFlow', 'Scikit-learn', 'FastAPI'],
    highlights: [
      'AI EDR system patent registered',
      'ML-based DDoS attack classification model (98.5% accuracy)',
      'Real-time threat scoring engine',
    ],
  },
  cloud: {
    title: 'Cloud Transition Research',
    period: '2021 - 2023',
    organization: 'KT',
    description: 'OpenStack-based private cloud transition research & PoC',
    techStack: ['OpenStack', 'Kubernetes', 'Terraform', 'Ansible'],
    highlights: [
      'OpenStack private cloud PoC',
      'K8s-based microservice migration',
      'IaC-based infrastructure automation',
    ],
  },
  monitor: {
    title: 'Monitoring Dashboards',
    period: '2017 - 2023',
    organization: 'Railway / Military / Telecom',
    description: 'Railway control, military network, and telecom infrastructure monitoring systems',
    techStack: ['React', 'D3.js', 'Grafana', 'Prometheus', 'SNMP'],
    highlights: [
      'Real-time railway control dashboard',
      'Military network monitoring system',
      'Integrated NOC dashboard design & implementation',
    ],
  },
  router: {
    title: 'Network Automation',
    period: '2019 - 2022',
    organization: 'NIA / KT',
    description: 'NIA school network deployment, SNMP-based device automation',
    techStack: ['Python', 'SNMP', 'Netmiko', 'Ansible', 'REST API'],
    highlights: [
      'NIA nationwide school network design',
      'SNMP-based management of 3,000+ devices',
      'Automated network provisioning system',
    ],
  },
  database: {
    title: 'Database High-Availability',
    period: '2018 - 2022',
    organization: 'KT',
    description: 'High-availability DB design & operation with Oracle RAC and MariaDB clustering',
    techStack: ['Oracle RAC', 'MariaDB', 'Galera Cluster', 'Redis'],
    highlights: [
      'Oracle RAC cluster (99.99% availability)',
      'MariaDB Galera Cluster replication',
      'Automated DB failover system',
    ],
  },
};
