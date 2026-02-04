export interface NodeTask {
  action: string;       // 평상시 표시 (짧은 설명)
  emoji: string;
  commands: string[];   // command mode에서 순차 표시할 프롬프트
}

/** 노드 variant/type별 실제 작업 목록 */
export const NODE_TASKS: Record<string, NodeTask[]> = {
  // === Servers ===
  'web': [
    {
      action: 'Nginx 설정 변경',
      emoji: '🌐',
      commands: [
        '$ ssh admin@WEB-SRV',
        '$ vim /etc/nginx/nginx.conf',
        '$ nginx -t',
        '$ systemctl reload nginx',
        '$ curl -I localhost',
        '200 OK',
      ],
    },
    {
      action: 'SSL 인증서 갱신',
      emoji: '🔐',
      commands: [
        '$ certbot renew --dry-run',
        'Processing /etc/letsencrypt/renewal/',
        '$ certbot renew',
        'Congratulations, renewed!',
        '$ systemctl reload nginx',
      ],
    },
    {
      action: '접속 로그 분석',
      emoji: '📊',
      commands: [
        '$ tail -f /var/log/nginx/access.log',
        '192.168.1.53 GET /api/v2 200',
        '10.0.3.22 POST /auth 401',
        '$ awk \'{print $1}\' access.log | sort | uniq -c | sort -rn | head',
        '  4821 10.0.3.22',
        '  2103 192.168.1.53',
      ],
    },
    {
      action: '배포 롤아웃',
      emoji: '🚀',
      commands: [
        '$ git pull origin main',
        'Updating a1b2c3d..e4f5g6h',
        '$ docker build -t web:v2.4.1 .',
        'Successfully built 7a8b9c0d',
        '$ docker-compose up -d',
        'Recreating web_app_1 ... done',
      ],
    },
  ],
  'app': [
    {
      action: 'JVM 힙 모니터링',
      emoji: '☕',
      commands: [
        '$ jstat -gcutil $(pgrep java) 1000',
        'S0  S1  E   O   M   YGC YGCT FGC',
        '0.00 87.4 62.1 43.2 97.1 142 1.23 3',
        '$ jmap -histo:live $(pgrep java) | head',
      ],
    },
    {
      action: 'API 응답시간 체크',
      emoji: '⏱️',
      commands: [
        '$ curl -w "%{time_total}" -o /dev/null -s http://localhost:8080/health',
        '0.003241',
        '$ ab -n 1000 -c 50 http://localhost:8080/api/v1/',
        'Requests per second: 3842.17',
        'Time per request:   13.013ms',
      ],
    },
  ],
  'bigdata': [
    {
      action: 'HDFS 상태 점검',
      emoji: '🗄️',
      commands: [
        '$ hdfs dfsadmin -report',
        'Live datanodes (3):',
        'DFS Used: 2.31 TB (38.42%)',
        '$ hdfs fsck / -files -blocks',
        'Status: HEALTHY',
        'Total blocks: 142,831',
      ],
    },
    {
      action: 'Spark 잡 실행',
      emoji: '⚡',
      commands: [
        '$ spark-submit --master yarn \\',
        '  --deploy-mode cluster \\',
        '  traffic_analysis.py',
        'INFO: Running Spark v3.4.1',
        'Stage 1: =====>            (2/8)',
        'Stage 1: ================> (8/8)',
      ],
    },
    {
      action: 'Impala 쿼리 최적화',
      emoji: '🔍',
      commands: [
        '$ impala-shell',
        '[impala] > EXPLAIN SELECT src_ip, COUNT(*)',
        '  FROM network_logs',
        '  WHERE ts > now() - interval 1 hour',
        '  GROUP BY src_ip ORDER BY 2 DESC;',
        'PLAN: 3 nodes, est. 2.1M rows',
      ],
    },
  ],
  'ai': [
    {
      action: 'ML 모델 재학습',
      emoji: '🤖',
      commands: [
        '$ python train_ddos_detector.py',
        'Epoch 1/50 loss=0.4231 acc=0.891',
        'Epoch 25/50 loss=0.0312 acc=0.978',
        'Epoch 50/50 loss=0.0089 acc=0.985',
        '$ mv model_v4.h5 /models/production/',
        'Model deployed: accuracy 98.5%',
      ],
    },
    {
      action: 'EDR 룰 업데이트',
      emoji: '🛡️',
      commands: [
        '$ edr-cli rules update',
        'Downloading threat signatures...',
        'New rules: 847 added, 23 modified',
        '$ edr-cli scan --quick /opt/',
        'Scanned 12,481 files in 3.2s',
        'Threats found: 0',
      ],
    },
    {
      action: '이상 트래픽 분석',
      emoji: '📈',
      commands: [
        '$ python anomaly_detect.py --live',
        'Loading model: autoencoder_v3.h5',
        'Monitoring 10.0.0.0/8...',
        'ALERT: 10.0.3.22 score=0.94',
        '  -> 3,241 SYN packets in 1s',
        '$ iptables -A INPUT -s 10.0.3.22 -j DROP',
      ],
    },
  ],
  'cloud': [
    {
      action: 'OpenStack 인스턴스 관리',
      emoji: '☁️',
      commands: [
        '$ openstack server list',
        '+------+--------+--------+',
        '| web-1 | ACTIVE | 4vCPU  |',
        '| web-2 | ACTIVE | 4vCPU  |',
        '| db-1  | ACTIVE | 8vCPU  |',
        '$ openstack server migrate web-1',
      ],
    },
    {
      action: 'K8s 파드 점검',
      emoji: '⎈',
      commands: [
        '$ kubectl get pods -A',
        'NAMESPACE   NAME          READY STATUS',
        'prod  api-deploy-7b4  1/1 Running',
        'prod  worker-5c8     1/1 Running',
        'mon   prometheus-0   1/1 Running',
        '$ kubectl top nodes',
      ],
    },
  ],
  'security': [
    {
      action: 'IDS 로그 분석',
      emoji: '🔎',
      commands: [
        '$ suricata -c /etc/suricata/suricata.yaml',
        '$ tail -f /var/log/suricata/fast.log',
        '[**] ET SCAN Potential SSH Scan',
        '  10.0.3.44:52341 -> 10.0.1.1:22',
        '$ fail2ban-client status sshd',
        'Currently banned: 3',
      ],
    },
  ],
  'generic': [
    {
      action: '시스템 점검',
      emoji: '🖥️',
      commands: [
        '$ uptime',
        ' 14:32:01 up 142 days, 3:21',
        '$ free -h',
        'Mem: 62G total, 8.2G free',
        '$ df -h /',
        '/dev/sda1  500G  312G  188G  63%',
      ],
    },
    {
      action: '패치 적용',
      emoji: '📦',
      commands: [
        '$ apt update && apt list --upgradable',
        '42 packages can be upgraded.',
        '$ apt upgrade -y',
        'Setting up linux-image-5.15...',
        '$ needrestart -r a',
        'Restarting services...',
      ],
    },
  ],

  // === Routers ===
  'router': [
    {
      action: 'BGP 세션 점검',
      emoji: '🔀',
      commands: [
        '# show ip bgp summary',
        'Neighbor  AS  MsgRcvd Up/Down State',
        '10.0.0.1  64512  48291 2d03h  Estab',
        '10.0.0.2  64513  38712 2d03h  Estab',
        '# show ip route summary',
        'Total: 842,371 routes',
      ],
    },
    {
      action: 'OSPF 네이버 확인',
      emoji: '🌐',
      commands: [
        '# show ip ospf neighbor',
        'ID       Pri State    Interface',
        '10.0.1.1  1  FULL/DR  Gi0/0',
        '10.0.1.2  1  FULL/BDR Gi0/1',
        '# show ip ospf database | i Link',
        'Router Link States: 24',
      ],
    },
    {
      action: 'ACL 룰 업데이트',
      emoji: '🚧',
      commands: [
        '# conf t',
        '(config)# ip access-list extended BLOCK_BAD',
        '(config-ext-nacl)# deny tcp any host 10.0.3.22',
        '(config-ext-nacl)# permit ip any any',
        '(config-ext-nacl)# exit',
        '# write memory',
      ],
    },
  ],

  // === Firewall ===
  'firewall': [
    {
      action: '방화벽 룰 점검',
      emoji: '🧱',
      commands: [
        '$ iptables -L -n --line-numbers',
        'Chain INPUT (policy DROP)',
        '1 ACCEPT tcp -- 0.0.0.0/0 :22',
        '2 ACCEPT tcp -- 0.0.0.0/0 :443',
        '3 DROP   all -- 10.0.3.0/24',
        '$ iptables -L -n -v | grep DROP',
      ],
    },
    {
      action: 'DDoS 룰 업데이트',
      emoji: '🌊',
      commands: [
        '$ conntrack -L | wc -l',
        '238,471 connections tracked',
        '$ iptables -A INPUT -p tcp --syn \\',
        '  -m limit --limit 100/s -j ACCEPT',
        '$ iptables -A INPUT -p tcp --syn -j DROP',
        'Rule added. Rate limit: 100 SYN/s',
      ],
    },
  ],

  // === Switch ===
  'switch': [
    {
      action: 'VLAN 설정 점검',
      emoji: '🔌',
      commands: [
        '# show vlan brief',
        'VLAN Name              Status',
        '10   MGMT              active',
        '20   SERVER             active',
        '30   DMZ                active',
        '# show mac address-table count',
      ],
    },
    {
      action: '포트 상태 확인',
      emoji: '📡',
      commands: [
        '# show interfaces status',
        'Port  Name    Status  Vlan Speed',
        'Gi0/1 UPLINK  conn    trunk 10G',
        'Gi0/2 SRV-01  conn    20    1G',
        'Gi0/3 SRV-02  conn    20    1G',
        '# show spanning-tree summary',
      ],
    },
  ],

  // === Database ===
  'database': [
    {
      action: 'DB 클러스터 상태 점검',
      emoji: '💾',
      commands: [
        'SQL> SELECT instance_name, status',
        '  FROM gv$instance;',
        'INST  STATUS',
        'rac1  OPEN',
        'rac2  OPEN',
        'SQL> SELECT * FROM v$recovery_file_dest;',
      ],
    },
    {
      action: '슬로우 쿼리 튜닝',
      emoji: '🐌',
      commands: [
        'SQL> SELECT sql_id, elapsed_time/1e6',
        '  FROM v$sql',
        '  ORDER BY elapsed_time DESC',
        '  FETCH FIRST 5 ROWS ONLY;',
        'SQL_ID: a1b2c3 elapsed: 12.3s',
        'SQL> @tune_sql a1b2c3',
      ],
    },
    {
      action: '백업 상태 확인',
      emoji: '💿',
      commands: [
        '$ rman target /',
        'RMAN> LIST BACKUP SUMMARY;',
        'BS Key Type LV Status  Device',
        '142    Full    AVAILABLE DISK',
        'RMAN> BACKUP INCREMENTAL LEVEL 1',
        '  DATABASE PLUS ARCHIVELOG;',
      ],
    },
  ],

  // === Load Balancer ===
  'loadbalancer': [
    {
      action: '로드밸런서 풀 점검',
      emoji: '⚖️',
      commands: [
        '$ haproxy -c -f /etc/haproxy/haproxy.cfg',
        'Configuration file is valid',
        '$ echo "show stat" | socat stdio /var/run/haproxy.sock',
        'web_back,srv1,UP,142,3,0',
        'web_back,srv2,UP,138,2,0',
        'web_back,BACKEND,UP,280,5,0',
      ],
    },
    {
      action: '헬스체크 설정 변경',
      emoji: '❤️',
      commands: [
        '$ vim /etc/haproxy/haproxy.cfg',
        '  option httpchk GET /health',
        '  http-check expect status 200',
        '  default-server inter 3s fall 3 rise 2',
        '$ systemctl reload haproxy',
        'haproxy reloaded successfully',
      ],
    },
  ],

  // === Monitor Wall ===
  'monitorwall': [
    {
      action: '대시보드 점검',
      emoji: '📺',
      commands: [
        '$ grafana-cli plugins update-all',
        'Updated 3 plugins',
        '$ curl localhost:3000/api/health',
        '{"database":"ok","version":"10.2.1"}',
        '$ promtool check rules /etc/prometheus/rules.yml',
        'SUCCESS: 24 rules found',
      ],
    },
    {
      action: '알림 임계값 조정',
      emoji: '🔔',
      commands: [
        '$ vim /etc/prometheus/alerts.yml',
        '- alert: HighCPU',
        '  expr: cpu_usage > 85',
        '  for: 5m',
        '$ promtool check rules alerts.yml',
        '$ systemctl reload prometheus',
      ],
    },
  ],
};

// === 장애 유형별 진단 + 수리 커맨드 ===

export interface IncidentRepairTask {
  diagAction: string;
  diagEmoji: string;
  diagCommands: string[];
  repairAction: string;
  repairEmoji: string;
  repairCommands: string[];
  verifyCommands: string[];
}

export const INCIDENT_REPAIR_TASKS: Record<string, IncidentRepairTask[]> = {
  ddos: [
    {
      diagAction: 'DDoS 트래픽 분석',
      diagEmoji: '🔍',
      diagCommands: [
        '$ netstat -an | grep SYN_RECV | wc -l',
        '38,472 connections',
        '$ tcpdump -i eth0 -nn -c 100 | awk \'{print $3}\' | sort | uniq -c | sort -rn',
        '  28471 10.0.3.22',
        '$ whois 10.0.3.22',
        'Origin: AS64666 (suspicious)',
      ],
      repairAction: 'DDoS 차단 적용',
      repairEmoji: '🛡️',
      repairCommands: [
        '$ iptables -A INPUT -s 10.0.3.0/24 -j DROP',
        '$ conntrack -D -s 10.0.3.22',
        'Deleted 28,471 entries',
        '$ sysctl -w net.ipv4.tcp_syncookies=1',
        '$ systemctl restart nginx',
      ],
      verifyCommands: [
        '$ netstat -an | grep SYN_RECV | wc -l',
        '12 connections',
        '$ curl -s -o /dev/null -w "%{http_code}" localhost',
        '200 OK — 서비스 정상 복구',
      ],
    },
  ],
  cable_cut: [
    {
      diagAction: '케이블 상태 진단',
      diagEmoji: '🔌',
      diagCommands: [
        '$ ethtool eth0',
        'Link detected: no',
        '$ ip link show | grep DOWN',
        'eth0: <NO-CARRIER,BROADCAST> state DOWN',
        '$ dmesg | tail -3',
        'e1000: eth0 NIC Link is Down',
      ],
      repairAction: '케이블 교체 작업',
      repairEmoji: '🔧',
      repairCommands: [
        '(케이블 분리 중...)',
        '(새 Cat6 케이블 연결 중...)',
        '$ ethtool eth0',
        'Link detected: yes',
        '$ ip link set eth0 up',
      ],
      verifyCommands: [
        '$ ping -c 3 gateway',
        '3 packets transmitted, 3 received, 0% loss',
        '$ ip route show',
        'default via 10.0.0.1 dev eth0 — 복구 완료',
      ],
    },
  ],
  rm_rf: [
    {
      diagAction: '파일시스템 피해 분석',
      diagEmoji: '💀',
      diagCommands: [
        '$ ls /etc/',
        'ls: cannot access: No such file',
        '$ df -h',
        '/dev/sda1  500G  12G  488G  3%',
        '$ last | head -5',
        'newbie pts/2 10.0.1.42 14:31',
      ],
      repairAction: '백업 복원 진행',
      repairEmoji: '💿',
      repairCommands: [
        '$ mount /dev/sdb1 /backup',
        '$ rsync -av /backup/etc/ /etc/',
        'sent 142,381 files',
        '$ rsync -av /backup/var/ /var/',
        '$ ldconfig',
        '$ systemctl daemon-reload',
      ],
      verifyCommands: [
        '$ systemctl list-units --failed',
        '0 loaded units listed',
        '$ ls /etc/passwd /etc/shadow',
        'OK — 시스템 파일 복원 완료',
      ],
    },
  ],
  power_outage: [
    {
      diagAction: 'UPS/전원 상태 점검',
      diagEmoji: '⚡',
      diagCommands: [
        '$ apcaccess status',
        'STATUS: ONBATT',
        'BCHARGE: 42.0 Percent',
        'TIMELEFT: 18.2 Minutes',
        '$ ipmitool sensor list | grep Voltage',
        'PS1 Status: Presence detected',
      ],
      repairAction: '전원 복구 작업',
      repairEmoji: '🔌',
      repairCommands: [
        '(PDU 회로 차단기 확인 중...)',
        '(배전반 리셋...)',
        '$ apcaccess status',
        'STATUS: ONLINE',
        '$ ipmitool power status',
        'Chassis Power is on',
      ],
      verifyCommands: [
        '$ uptime',
        'up 0 min, load average: 0.12',
        '$ systemctl --failed',
        'OK — 전원 복구, 모든 서비스 정상',
      ],
    },
  ],
  overload: [
    {
      diagAction: 'CPU/프로세스 분석',
      diagEmoji: '📊',
      diagCommands: [
        '$ top -bn1 | head -20',
        'PID USER %CPU COMMAND',
        '3842 app  98.2 java -jar api.jar',
        '$ jstack 3842 | grep -c BLOCKED',
        '47 blocked threads',
        '$ ss -s',
        'TCP: 48291 (estab 38412)',
      ],
      repairAction: '부하 분산 조치',
      repairEmoji: '⚖️',
      repairCommands: [
        '$ kill -QUIT 3842',
        '$ systemctl restart api-server',
        '$ echo 2 > /proc/sys/vm/drop_caches',
        '$ sysctl -w net.core.somaxconn=4096',
      ],
      verifyCommands: [
        '$ uptime',
        'load average: 1.23, 2.41, 8.72',
        '$ curl localhost:8080/health',
        '{"status":"UP"} — 부하 정상화',
      ],
    },
  ],
  memory_leak: [
    {
      diagAction: '메모리 누수 추적',
      diagEmoji: '💧',
      diagCommands: [
        '$ free -h',
        'Mem: 62G total, 1.2G free',
        '$ ps aux --sort=-%mem | head -5',
        'app 3842 78.3 java -jar api.jar',
        '$ jmap -histo 3842 | head -10',
        'Total: 2,481,293 instances, 4.2GB',
      ],
      repairAction: '메모리 정리 및 재시작',
      repairEmoji: '🧹',
      repairCommands: [
        '$ jcmd 3842 GC.run',
        'Command executed successfully',
        '$ systemctl restart api-server',
        '$ echo 3 > /proc/sys/vm/drop_caches',
      ],
      verifyCommands: [
        '$ free -h',
        'Mem: 62G total, 48.1G free',
        '$ jstat -gcutil $(pgrep java)',
        'O: 23.1% — 메모리 정상화',
      ],
    },
  ],
  ransomware: [
    {
      diagAction: '랜섬웨어 격리 분석',
      diagEmoji: '🔒',
      diagCommands: [
        '$ find / -name "*.encrypted" | wc -l',
        '3,841 files',
        '$ strings /tmp/.payload | head',
        'ENCRYPTED_BY_RANSOM_V3',
        '$ netstat -tlnp | grep ESTABLISHED',
        '10.0.3.22:4444 ESTABLISHED (suspicious)',
      ],
      repairAction: '랜섬웨어 제거 및 복원',
      repairEmoji: '🛡️',
      repairCommands: [
        '$ iptables -A OUTPUT -d 10.0.3.22 -j DROP',
        '$ kill -9 $(pgrep payload)',
        '$ find / -name "*.encrypted" -exec rm {} \\;',
        '$ rsync -av /backup/latest/ /',
        '$ rkhunter --check',
        '$ clamscan -r / --remove',
      ],
      verifyCommands: [
        '$ find / -name "*.encrypted" | wc -l',
        '0 files',
        '$ rkhunter --check',
        'No warnings — 시스템 정상 복구',
      ],
    },
  ],
  misconfiguration: [
    {
      diagAction: '설정 오류 분석',
      diagEmoji: '🔄',
      diagCommands: [
        '$ journalctl -u network -n 20',
        'BGP: route loop detected',
        '$ show ip bgp | grep loop',
        '10.0.0.0/8 via 10.0.1.1 (loop)',
        '$ diff /etc/network/current.conf /etc/network/last-good.conf',
      ],
      repairAction: '설정 롤백',
      repairEmoji: '↩️',
      repairCommands: [
        '$ cp /etc/network/last-good.conf /etc/network/current.conf',
        '$ systemctl restart networking',
        '$ show ip bgp summary',
        'All neighbors Established',
      ],
      verifyCommands: [
        '$ traceroute 8.8.8.8',
        '1 10.0.0.1 1ms 2ms 1ms',
        '2 ISP-GW 5ms 4ms 5ms',
        'OK — 라우팅 정상 복구',
      ],
    },
  ],
  hacker: [
    {
      diagAction: '침입 흔적 분석',
      diagEmoji: '🕵️',
      diagCommands: [
        '$ last -f /var/log/wtmp | head',
        'unknown pts/9 10.0.3.22 14:32',
        '$ cat /var/log/auth.log | grep Failed',
        '1,847 failed password attempts',
        '$ find / -newer /tmp/.marker -perm -4000',
      ],
      repairAction: '침입 차단 및 복구',
      repairEmoji: '🔐',
      repairCommands: [
        '$ iptables -A INPUT -s 10.0.3.22 -j DROP',
        '$ passwd -l unknown',
        '$ find / -perm -4000 -newer /tmp/.marker -exec rm {} \\;',
        '$ systemctl restart sshd',
        '$ fail2ban-client set sshd banip 10.0.3.22',
      ],
      verifyCommands: [
        '$ ss -tlnp | grep -v 22',
        '$ fail2ban-client status sshd',
        'Currently banned: 1',
        'OK — 보안 복구 완료',
      ],
    },
  ],
};

// === 사전 모니터링 커맨드 ===

export const MONITORING_TASKS: NodeTask[] = [
  {
    action: '헬스체크 모니터링',
    emoji: '💓',
    commands: [
      '$ curl -s localhost/health',
      '{"status":"UP","uptime":"142d"}',
      '$ systemctl is-active nginx mysql',
      'active active',
    ],
  },
  {
    action: '로그 워치',
    emoji: '👁️',
    commands: [
      '$ tail -f /var/log/syslog',
      'No anomalies detected',
      '$ journalctl --since "5 min ago" -p err',
      'No entries',
    ],
  },
  {
    action: '디스크/메모리 체크',
    emoji: '📋',
    commands: [
      '$ df -h / | tail -1',
      '/dev/sda1  500G  312G  63%',
      '$ free -h | grep Mem',
      'Mem: 62G total, 28G free',
    ],
  },
];

// === 휴식 커맨드 ===

export const BREAK_TASKS: NodeTask[] = [
  {
    action: '커피 브레이크',
    emoji: '☕',
    commands: [
      '(자판기에서 커피 뽑는 중...)',
      '(호... 한 모금)',
      '$ echo "잠깐 쉬자..."',
    ],
  },
  {
    action: '잠깐 휴식',
    emoji: '😮‍💨',
    commands: [
      '(벤치에 앉는 중...)',
      '$ uptime --human',
      '"나도 142일째 연속 근무인데..."',
    ],
  },
];

/** 노드 label → task key 매핑 */
export function getTaskKeyForNode(label: string, variant?: string): string {
  // variant가 있으면 우선
  if (variant && NODE_TASKS[variant]) return variant;

  // label 패턴으로 매칭
  if (label.startsWith('FW-')) return 'firewall';
  if (label.startsWith('CORE-RTR') || label.startsWith('EDGE-RTR')) return 'router';
  if (label.startsWith('DIST-SW') || label.startsWith('ACC-SW')) return 'switch';
  if (label.startsWith('ORA-') || label.startsWith('MARIA-')) return 'database';
  if (label.startsWith('LB-')) return 'loadbalancer';
  if (label.startsWith('MON-')) return 'monitorwall';
  if (label.startsWith('IDS-')) return 'security';
  if (label.startsWith('DNS-') || label.startsWith('MAIL-') || label.startsWith('BACKUP-')) return 'generic';

  return 'generic';
}
