export interface IncidentTemplate {
  type: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  damage: number;
  description: string;
  emoji: string;
}

export const INCIDENT_TEMPLATES: IncidentTemplate[] = [
  {
    type: 'ddos',
    name: 'DDoS 공격',
    severity: 'critical',
    damage: 40,
    description: '대규모 DDoS 트래픽이 감지되었습니다!',
    emoji: '🌊',
  },
  {
    type: 'cable_cut',
    name: '케이블 절단',
    severity: 'high',
    damage: 30,
    description: '네트워크 케이블이 절단되었습니다.',
    emoji: '✂️',
  },
  {
    type: 'rm_rf',
    name: 'rm -rf /',
    severity: 'critical',
    damage: 60,
    description: '누군가 rm -rf /를 실행했습니다!!!',
    emoji: '💀',
  },
  {
    type: 'power_outage',
    name: '정전',
    severity: 'high',
    damage: 50,
    description: 'UPS 배터리로 전환 중...',
    emoji: '⚡',
  },
  {
    type: 'overload',
    name: '서버 과부하',
    severity: 'medium',
    damage: 20,
    description: 'CPU 사용률 99%에 도달했습니다.',
    emoji: '🔥',
  },
  {
    type: 'memory_leak',
    name: '메모리 누수',
    severity: 'medium',
    damage: 15,
    description: '메모리 사용량이 비정상적으로 증가 중입니다.',
    emoji: '💧',
  },
  {
    type: 'ransomware',
    name: '랜섬웨어 탐지',
    severity: 'critical',
    damage: 45,
    description: '랜섬웨어가 탐지되었습니다! 파일 암호화 진행 중...',
    emoji: '🔒',
  },
  {
    type: 'misconfiguration',
    name: '설정 오류',
    severity: 'low',
    damage: 10,
    description: 'BGP 설정 오류로 라우팅 루프 발생.',
    emoji: '🔄',
  },
];
