/**
 * 게임 통계 더미 데이터
 * 실제 API 연동 전까지 사용
 */

import { subDays, subWeeks, startOfWeek, format, addDays } from 'date-fns';

// 활동 히트맵 데이터 생성 (최근 52주, 일요일 시작, 미래 날짜 포함)
export const generateActivityData = () => {
  const activities = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 정보 제거

  // 이번 주 토요일 찾기 (현재 주를 완성하기 위해)
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const endDate = addDays(currentWeekStart, 6); // 이번 주 토요일

  // 52주 전 일요일부터 시작
  const startDate = subWeeks(currentWeekStart, 51); // 52주 (현재 주 포함)

  // startDate부터 endDate까지 모든 날짜 생성
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const isFuture = currentDate > today;

    if (isFuture) {
      // 미래 날짜는 비활성 상태로
      activities.push({
        date: dateStr,
        matchCount: 0,
        totalKills: 0,
        totalDamage: 0,
        wins: 0,
        playtime: 0,
        isFuture: true
      });
    } else {
      // 과거/오늘 날짜는 랜덤 데이터 생성
      const hasActivity = Math.random() > 0.3;

      if (hasActivity) {
        activities.push({
          date: dateStr,
          matchCount: Math.floor(Math.random() * 12) + 1,
          totalKills: Math.floor(Math.random() * 30) + 5,
          totalDamage: Math.floor(Math.random() * 3000) + 500,
          wins: Math.random() > 0.8 ? 1 : 0,
          playtime: Math.floor(Math.random() * 10000) + 2000,
          isFuture: false
        });
      } else {
        activities.push({
          date: dateStr,
          matchCount: 0,
          totalKills: 0,
          totalDamage: 0,
          wins: 0,
          playtime: 0,
          isFuture: false
        });
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return activities;
};

// 활동 요약 통계
export const activitySummary = {
  totalDays: 365,
  activeDays: 234,
  currentStreak: 7,
  longestStreak: 28,
  totalMatches: 1245
};

// 종합 통계
export const overallStats = {
  totalMatches: 156,
  wins: 28,
  top10: 89,
  top10Rate: 57.05,
  kills: 342,
  assists: 67,
  kd: 2.67,
  winRate: 17.95,
  avgDamage: 456.8,
  headshotRate: 34.5,
  longestKill: 487
};

// 모드별 통계
export const statsByMode = {
  solo: {
    totalMatches: 52,
    wins: 8,
    top10: 28,
    kills: 98,
    deaths: 47,
    kd: 2.1,
    winRate: 15.4,
    avgDamage: 389.2,
    headshotRate: 32.1
  },
  duo: {
    totalMatches: 54,
    wins: 11,
    top10: 32,
    kills: 124,
    deaths: 48,
    kd: 2.6,
    winRate: 20.4,
    avgDamage: 445.6,
    headshotRate: 35.8
  },
  squad: {
    totalMatches: 50,
    wins: 9,
    top10: 29,
    kills: 120,
    deaths: 33,
    kd: 3.1,
    winRate: 18.0,
    avgDamage: 534.1,
    headshotRate: 36.2
  }
};

// 최근 매치 이력
export const recentMatches = [
  {
    matchId: 'match_001',
    playedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    duration: 1845,
    mode: 'squad',
    map: 'Erangel',
    season: '2024-01',
    result: {
      rank: 1,
      teamRank: 1,
      kills: 8,
      deaths: 0,
      assists: 3,
      damage: 892.5,
      survivalTime: 1845,
      dbno: 2,
      revives: 1,
      headshotKills: 3,
      longestKill: 287.5,
      rideDistance: 3245.8,
      walkDistance: 2156.3,
      heals: 12,
      boosts: 8
    },
    teamMembers: [
      { name: 'Teammate1', kills: 6, damage: 745.2 },
      { name: 'Teammate2', kills: 4, damage: 623.8 },
      { name: 'Teammate3', kills: 3, damage: 512.1 }
    ]
  },
  {
    matchId: 'match_002',
    playedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4시간 전
    duration: 1654,
    mode: 'duo',
    map: 'Miramar',
    season: '2024-01',
    result: {
      rank: 2,
      teamRank: 2,
      kills: 6,
      deaths: 1,
      assists: 2,
      damage: 745.2,
      survivalTime: 1654,
      dbno: 1,
      revives: 0,
      headshotKills: 2,
      longestKill: 234.8,
      rideDistance: 4123.5,
      walkDistance: 1876.4,
      heals: 10,
      boosts: 6
    },
    teamMembers: [
      { name: 'Partner1', kills: 5, damage: 689.3 }
    ]
  },
  {
    matchId: 'match_003',
    playedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전
    duration: 1234,
    mode: 'squad',
    map: 'Sanhok',
    season: '2024-01',
    result: {
      rank: 5,
      teamRank: 5,
      kills: 5,
      deaths: 1,
      assists: 1,
      damage: 623.4,
      survivalTime: 1234,
      dbno: 1,
      revives: 2,
      headshotKills: 1,
      longestKill: 156.2,
      rideDistance: 1234.5,
      walkDistance: 1456.7,
      heals: 8,
      boosts: 5
    },
    teamMembers: [
      { name: 'Teammate1', kills: 4, damage: 556.7 },
      { name: 'Teammate2', kills: 3, damage: 445.3 },
      { name: 'Teammate3', kills: 2, damage: 334.2 }
    ]
  },
  {
    matchId: 'match_004',
    playedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    duration: 987,
    mode: 'solo',
    map: 'Erangel',
    season: '2024-01',
    result: {
      rank: 12,
      teamRank: 12,
      kills: 3,
      deaths: 1,
      assists: 0,
      damage: 445.6,
      survivalTime: 987,
      dbno: 0,
      revives: 0,
      headshotKills: 1,
      longestKill: 189.3,
      rideDistance: 2345.6,
      walkDistance: 987.4,
      heals: 5,
      boosts: 3
    }
  },
  {
    matchId: 'match_005',
    playedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1일 전
    duration: 1567,
    mode: 'duo',
    map: 'Vikendi',
    season: '2024-01',
    result: {
      rank: 3,
      teamRank: 3,
      kills: 7,
      deaths: 1,
      assists: 3,
      damage: 834.5,
      survivalTime: 1567,
      dbno: 2,
      revives: 1,
      headshotKills: 4,
      longestKill: 345.6,
      rideDistance: 3567.8,
      walkDistance: 1234.5,
      heals: 11,
      boosts: 7
    },
    teamMembers: [
      { name: 'Partner1', kills: 6, damage: 712.3 }
    ]
  }
];

// 맵별 통계
export const mapStats = [
  {
    name: 'Erangel',
    matches: 45,
    wins: 8,
    top10: 28,
    kills: 98,
    deaths: 37,
    kd: 2.65,
    winRate: 17.8,
    avgRank: 12.4,
    avgDamage: 445.3,
    avgSurvivalTime: 1234,
    favoriteDropZone: 'Pochinki',
    imageUrl: '/maps/erangel.jpg'
  },
  {
    name: 'Miramar',
    matches: 38,
    wins: 7,
    top10: 24,
    kills: 87,
    deaths: 31,
    kd: 2.81,
    winRate: 18.4,
    avgRank: 11.2,
    avgDamage: 478.9,
    avgSurvivalTime: 1456,
    favoriteDropZone: 'Pecado',
    imageUrl: '/maps/miramar.jpg'
  },
  {
    name: 'Sanhok',
    matches: 32,
    wins: 6,
    top10: 18,
    kills: 76,
    deaths: 28,
    kd: 2.71,
    winRate: 18.75,
    avgRank: 13.1,
    avgDamage: 412.7,
    avgSurvivalTime: 876,
    favoriteDropZone: 'Paradise Resort',
    imageUrl: '/maps/sanhok.jpg'
  },
  {
    name: 'Vikendi',
    matches: 28,
    wins: 5,
    top10: 14,
    kills: 62,
    deaths: 24,
    kd: 2.58,
    winRate: 17.86,
    avgRank: 14.3,
    avgDamage: 398.5,
    avgSurvivalTime: 1123,
    favoriteDropZone: 'Castle',
    imageUrl: '/maps/vikendi.jpg'
  },
  {
    name: 'Taego',
    matches: 13,
    wins: 2,
    top10: 5,
    kills: 19,
    deaths: 8,
    kd: 2.38,
    winRate: 15.38,
    avgRank: 18.2,
    avgDamage: 367.2,
    avgSurvivalTime: 1045,
    favoriteDropZone: 'Terminal',
    imageUrl: '/maps/taego.jpg'
  }
];

// 무기별 통계
export const weaponStats = [
  {
    name: 'M416',
    type: 'AR',
    kills: 89,
    headshotKills: 38,
    headshotRate: 42.7,
    avgDamagePerMatch: 156.3,
    totalDamage: 7034.5,
    longestKill: 234.5,
    usageCount: 45
  },
  {
    name: 'Kar98k',
    type: 'SR',
    kills: 67,
    headshotKills: 52,
    headshotRate: 77.6,
    avgDamagePerMatch: 98.4,
    totalDamage: 4428.0,
    longestKill: 487.2,
    usageCount: 38
  },
  {
    name: 'AKM',
    type: 'AR',
    kills: 45,
    headshotKills: 18,
    headshotRate: 40.0,
    avgDamagePerMatch: 134.2,
    totalDamage: 3891.8,
    longestKill: 189.4,
    usageCount: 29
  },
  {
    name: 'UMP45',
    type: 'SMG',
    kills: 34,
    headshotKills: 12,
    headshotRate: 35.3,
    avgDamagePerMatch: 87.6,
    totalDamage: 2193.4,
    longestKill: 78.3,
    usageCount: 25
  },
  {
    name: 'AWM',
    type: 'SR',
    kills: 23,
    headshotKills: 19,
    headshotRate: 82.6,
    avgDamagePerMatch: 112.8,
    totalDamage: 1353.6,
    longestKill: 512.7,
    usageCount: 12
  }
];

// 시즌별 통계 (월 단위)
export const seasonStats = [
  {
    seasonId: '2024-06',
    seasonName: '2024년 6월',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    isCurrent: true,
    stats: {
      totalMatches: 42,
      wins: 8,
      top10: 24,
      kills: 98,
      deaths: 34,
      kd: 2.88,
      winRate: 19.05,
      avgDamage: 485.2,
      bestRank: 1,
      tier: 'Master',
      rp: 4720
    }
  },
  {
    seasonId: '2024-05',
    seasonName: '2024년 5월',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    isCurrent: false,
    stats: {
      totalMatches: 38,
      wins: 6,
      top10: 21,
      kills: 87,
      deaths: 32,
      kd: 2.72,
      winRate: 15.79,
      avgDamage: 468.5,
      bestRank: 2,
      tier: 'Master',
      rp: 4580
    }
  },
  {
    seasonId: '2024-04',
    seasonName: '2024년 4월',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    isCurrent: false,
    stats: {
      totalMatches: 45,
      wins: 7,
      top10: 26,
      kills: 102,
      deaths: 38,
      kd: 2.68,
      winRate: 15.56,
      avgDamage: 472.8,
      bestRank: 1,
      tier: 'Diamond',
      rp: 4380
    }
  },
  {
    seasonId: '2024-03',
    seasonName: '2024년 3월',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    isCurrent: false,
    stats: {
      totalMatches: 51,
      wins: 9,
      top10: 29,
      kills: 112,
      deaths: 42,
      kd: 2.67,
      winRate: 17.65,
      avgDamage: 456.8,
      bestRank: 1,
      tier: 'Diamond',
      rp: 4220
    }
  },
  {
    seasonId: '2024-02',
    seasonName: '2024년 2월',
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    isCurrent: false,
    stats: {
      totalMatches: 36,
      wins: 5,
      top10: 19,
      kills: 78,
      deaths: 31,
      kd: 2.52,
      winRate: 13.89,
      avgDamage: 442.3,
      bestRank: 3,
      tier: 'Platinum',
      rp: 3980
    }
  },
  {
    seasonId: '2024-01',
    seasonName: '2024년 1월',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    isCurrent: false,
    stats: {
      totalMatches: 44,
      wins: 6,
      top10: 22,
      kills: 89,
      deaths: 38,
      kd: 2.34,
      winRate: 13.64,
      avgDamage: 423.5,
      bestRank: 2,
      tier: 'Platinum',
      rp: 3750
    }
  }
];

// 업적 데이터
export const achievements = [
  {
    id: 'chicken_master',
    name: '치킨 마스터',
    description: '10회 이상 우승',
    unlocked: true,
    unlockedAt: '2024-03-15T10:20:00Z',
    progress: 28,
    target: 10,
    rarity: 'rare'
  },
  {
    id: 'killer_instinct',
    name: '킬러 본능',
    description: '총 300킬 달성',
    unlocked: true,
    unlockedAt: '2024-05-20T14:35:00Z',
    progress: 342,
    target: 300,
    rarity: 'rare'
  },
  {
    id: 'sharp_shooter',
    name: '명사수',
    description: '헤드샷 비율 50% 이상 달성 (100킬 이상)',
    unlocked: false,
    progress: 118,
    target: 100,
    progressPercentage: 47.2,
    rarity: 'epic'
  },
  {
    id: 'survivor',
    name: '생존왕',
    description: '평균 생존시간 20분 이상',
    unlocked: false,
    progress: 1245,
    target: 1200,
    progressPercentage: 62.25,
    rarity: 'rare'
  },
  {
    id: 'damage_dealer',
    name: '데미지 딜러',
    description: '한 경기 1500 데미지 이상',
    unlocked: true,
    unlockedAt: '2024-06-10T18:45:00Z',
    progress: 1567.8,
    target: 1500,
    rarity: 'epic'
  },
  {
    id: 'marksman',
    name: '저격수',
    description: '300m 이상 거리에서 10킬 달성',
    unlocked: true,
    unlockedAt: '2024-04-22T09:15:00Z',
    progress: 15,
    target: 10,
    rarity: 'legendary'
  },
  {
    id: 'veteran',
    name: '베테랑',
    description: '100경기 이상 플레이',
    unlocked: true,
    unlockedAt: '2024-02-10T16:30:00Z',
    progress: 156,
    target: 100,
    rarity: 'common'
  },
  {
    id: 'squad_leader',
    name: '스쿼드 리더',
    description: '스쿼드 모드에서 5회 우승',
    unlocked: false,
    progress: 3,
    target: 5,
    rarity: 'epic'
  }
];

// 개인 기록
export const personalRecords = {
  mostKillsInMatch: 15,
  highestDamage: 1567.8,
  longestKill: 487.2,
  longestWinStreak: 5,
  bestRank: 1,
  mostHeadshotsInMatch: 8,
  longestSurvivalTime: 2145,
  mostAssistsInMatch: 7
};

// 성적 추이 데이터 (최근 30일) - 모든 지표를 하나의 배열로
export const performanceTrends = [];

// 최근 30일 데이터 생성
for (let i = 29; i >= 0; i--) {
  const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
  const matches = Math.floor(Math.random() * 5) + 1;

  performanceTrends.push({
    date,
    kd: 2.0 + Math.random() * 1.5,
    winRate: 10 + Math.random() * 15,
    avgDamage: 350 + Math.random() * 200,
    kills: Math.floor(Math.random() * 10) + 3,
    matches
  });
}

// Component prop aliases (컴포넌트에서 사용하는 prop 이름과 일치시키기 위한 별칭)
export const modeComparison = statsByMode; // StatsComparisonBar에서 사용
export const maps = mapStats; // MapStatsGrid에서 사용
export const weapons = weaponStats; // WeaponStatsTable에서 사용
export const seasons = seasonStats; // SeasonComparison에서 사용
