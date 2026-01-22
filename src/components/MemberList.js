import React from 'react';
import MemberCard from './MemberCard';
import TagFilter from './TagFilter';
import { useFetchItems } from '../api/useFetch';
import useStore from '../store/useStore';

// 임시 더미 데이터 생성 함수
const generateMockMembers = () => {
  const tiers = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];
  const rights = [['MEMBER'], ['OFFICER', 'MEMBER'], ['LEADER', 'OFFICER', 'MEMBER'], ['MEMBER']];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  // 실제 커뮤니티 느낌나는 닉네임들
  const nicknames = [
    '감자왕', '고구마킹', '치킨러버', '피자덕후', '햄버거맨', '라면조아', '떡볶이왕',
    '콜라마왕', '사이다킹', '커피중독', '녹차러버', '밀크티조아', '초코파이',
    '새우깡킹', '포카칩왕', '프링글스', '오징어땅콩', '허니버터', '양파링킹',
    '빼빼로왕', '다이제킹', '초코칩쿠키', '마카롱조아', '와플킹', '팬케익왕',
    '도넛러버', '크루아상', '베이글킹', '머핀조아', '스콘러버', '타르트왕',
    '에클레어', '마들렌킹', '휘낭시에', '카눌레조아', '티라미수', '판나코타',
    '젤라또킹', '소르베조아', '아이스크림왕', '빙수러버', '팥빙수킹', '망고빙수',
    '딸기빙수', '수박화채', '식혜조아', '수정과킹', '매실차러버', '유자차왕',
    '대추차조아', '생강차킹', '쌍화탕러버', '인삼차왕'
  ];

  const gameNames = [
    'xXSniperXx', 'ProGamer_KR', 'NoobMaster', 'HeadshotKing', 'ChickenDinner',
    'BattleRoyale', 'Tactical_Ops', 'SilentKiller', 'RushB_Pro', 'CampingKing',
    'Loot_Master', 'Squad_Leader', 'Solo_Winner', 'Duo_Destroyer', 'Team_Killer',
    'Grenade_God', 'Sniper_Elite', 'Shotgun_Boss', 'Rifle_King', 'SMG_Master',
    'Kar98_Legend', 'AWM_Sniper', 'M416_Pro', 'AKM_Beast', 'Vector_Spray',
    'UMP_King', 'Tommy_Gun', 'VSS_Silent', 'Mini14_Pro', 'SLR_Marksman',
    'DP28_Heavy', 'M249_Support', 'Groza_Beast', 'AUG_Tactical', 'MK14_DMR',
    'SKS_Shooter', 'QBZ_Laser', 'Beryl_Spray', 'G36C_Stable', 'MP5K_Close',
    'UZI_Rush', 'P90_Fast', 'Bizon_Mag', 'Scorpion_Burst', 'Crossbow_Silent',
    'Win94_Cowboy', 'Mosin_Bolt', 'Lynx_Arctic', 'Panzerfaust_AT', 'M79_Boom'
  ];

  const koreanNames = [
    '김민준', '이서준', '박도윤', '최예준', '정시우', '강하준', '조주원', '윤지호',
    '장준서', '임건우', '한현우', '오선우', '신우진', '권승현', '황승우', '안유준',
    '홍연우', '송민재', '전서진', '곽도현', '배은우', '유시후', '표정우', '노준혁',
    '지윤호', '성현준', '탁지훈', '채민성', '최서우', '마준영', '문태윤', '방시온',
    '변하율', '서이준', '소윤우', '손지우', '양태민', '염승민', '오준희', '우건희',
    '유은찬', '윤도훈', '이수호', '임재윤', '장승준', '전민호', '정태양', '조현서',
    '진시원', '차준우'
  ];

  const members = [];

  for (let i = 1; i <= 50; i++) {
    const year = 1990 + Math.floor(Math.random() * 15);
    const month = months[Math.floor(Math.random() * 12)];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

    const joinYear = 2023 + Math.floor(Math.random() * 2);
    const joinMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const joinDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

    const nickname = nicknames[i - 1];
    const gameName = gameNames[i - 1];
    const koreanName = koreanNames[i - 1];
    const discordNum = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    const tier = tiers[i % tiers.length];
    const tierImage = `/assets/tiers/${tier.toLowerCase()}.png`;

    members.push({
      id: i,
      name: nickname,
      discordAvatarUrl: tierImage,
      info: {
        discordname: `${nickname}#${discordNum}`,
        gamename: gameName,
        koreaname: koreanName,
        birthday: `${year}-${month}-${day}`,
        description: `배틀그라운드 ${tier} 플레이어`
      },
      discord: {
        right: rights[i % rights.length],
        join: `${joinYear}-${joinMonth}-${joinDay}T00:00:00Z`
      },
      game: {
        tier: tier,
        gamename: gameName
      },
      streaming: {
        soop: null,
        chzzk: null
      },
      memberofthestaff: null
    });
  }

  return members;
};

const MOCK_MEMBERS = generateMockMembers();

export default function MemberList() {
  const { data, isLoading, isError } = useFetchItems({ requireAuth: false });

  const setSelectedItem = useStore((s) => s.setSelectedItem);
  const selectedTags = useStore((s) => s.selectedTags);

  // derive tag options from data (rights/badges only)
  const tags = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const set = new Set();
    data.forEach((m) => {
      const rightValue = m.discord?.right || [];
      const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
      rights.forEach((r) => {
        if (r) set.add(`right:${String(r)}`);
      });
    });
    return Array.from(set);
  }, [data]);

  const matchTag = React.useCallback((member, tag) => {
    if (!tag) return true;
    if (tag.startsWith('right:')) {
      const rightValue = member.discord?.right || [];
      const rights = Array.isArray(rightValue) ? rightValue : [rightValue];
      return rights.includes(tag.split(':')[1]);
    }
    return false;
  }, []);

  const filtered = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!selectedTags || selectedTags.length === 0) return data;
    return data.filter((m) => selectedTags.some((t) => matchTag(m, t)));
  }, [data, selectedTags, matchTag]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error</p>;
  if (!data) return null;

  return (
    <section>
      <div className="list-controls">
        <TagFilter tags={tags} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-member-state">
          <div className="empty-member-icon">🎮</div>
          <h3 className="empty-member-title">가입하고 첫 멤버로 합류하세요</h3>
          <p className="empty-member-text">클랜의 첫 번째 플레이어가 되어보세요!</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((m) => (
            <MemberCard key={m.id} member={m} onSelect={setSelectedItem} />
          ))}
        </div>
      )}
    </section>
  );
}
