# TKTK CLAN 서버 API 문서

## 📋 목차
1. [개요](#개요)
2. [데이터 구조](#데이터-구조)
3. [API 엔드포인트](#api-엔드포인트)
4. [Discord Bot 연동](#discord-bot-연동)
5. [인증 및 권한](#인증-및-권한)

---

## 개요

TKTK CLAN 관리 시스템을 위한 백엔드 서버 API 명세서입니다.
React 프론트엔드와 Discord Bot이 이 API를 통해 데이터를 주고받습니다.

### 기술 스택 권장사항
- **언어**: Node.js (Express), Python (FastAPI), 또는 Go
- **데이터베이스**: PostgreSQL 또는 MongoDB
- **캐싱**: Redis (선택사항)
- **인증**: JWT 기반 인증

---

## 데이터 구조

### 1. Member (멤버)

멤버는 시스템의 핵심 데이터입니다.

**데이터베이스 테이블:**

| 구분 | 타입 | 비고 |
| --- | --- | --- |
| pk | Long | 기본키 |
| name | String | 멤버 이름 |
| clantier_id | Long (FK) | Clantier 테이블 참조 |
| game_id | Long (FK) | Game 테이블 참조 |
| rights | String[] | 권한 키 배열 (예: ["master", "3tier"]) |
| birthday | String | 생일 (YYYY-MM-DD) |
| discordname | String | Discord 닉네임 |
| streaming_soop | String | Soop URL (nullable) |
| streaming_chzzk | String | Chzzk URL (nullable) |
| memberofthestaff | String | 담당 스태프 이름 (nullable) |
| join_date | String | Discord 가입일 (YYYY-MM-DD) |

**API 응답 형식:**

```typescript
interface Member {
  id: number;                    // pk
  name: string;                  // 멤버 이름
  clantierId: number;            // Clantier FK
  gameId: number;                // Game FK
  rights: string[];              // 권한 배열 (예: ["master", "3tier"])
  birthday: string;              // 생일 (YYYY-MM-DD)
  discordname: string;           // Discord 닉네임
  streaming_soop: string;        // Soop URL
  streaming_chzzk: string;       // Chzzk URL
  memberofthestaff: string;      // 담당 스태프
  joinDate: string;              // 가입일 (YYYY-MM-DD)

  // 조인된 데이터 (GET 요청 시 포함)
  clantier?: Clantier;           // Clantier 정보
  game?: Game;                   // Game 정보
}
```

**예시 데이터:**
```json
{
  "id": 1,
  "name": "XX_져니",
  "clantierId": 3,
  "gameId": 1,
  "rights": ["master", "3tier"],
  "birthday": "1995-11-09",
  "discordname": "XX_져니",
  "streaming_soop": "https://soop.tv/username",
  "streaming_chzzk": "https://chzzk.naver.com/username",
  "memberofthestaff": "김담당",
  "joinDate": "2021-06-15",
  "clantier": {
    "id": 3,
    "tier_name": "골드",
    "tier_level": "상급",
    "kills": 100,
    "damage": 50000,
    "kills_damage": 150
  },
  "game": {
    "id": 1,
    "gamename": "ZxxxxNxxxx",
    "tier": "master"
  }
}
```

---

### 2. Game (게임 정보)

PUBG 게임 관련 정보를 저장합니다.

**데이터베이스 테이블:**

| 구분 | 타입 | 비고 |
| --- | --- | --- |
| pk | Long | 기본키 |
| gamename | String | 게임 닉네임 |
| tier | Enum | PUBG 티어: "bronze", "silver", "gold", "platinum", "diamond", "crown", "ace", "master", "conqueror" |

**API 응답 형식:**

```typescript
interface Game {
  id: number;                    // pk
  gamename: string;              // 게임 닉네임
  tier: string;                  // 티어 (enum)
}
```

**예시 데이터:**
```json
{
  "id": 1,
  "gamename": "ZxxxxNxxxx",
  "tier": "master"
}
```

---

### 3. Clantier (클랜 티어)

클랜 내부 티어 시스템을 정의합니다.

**데이터베이스 테이블:**

| 구분 | 타입 | 비고 |
| --- | --- | --- |
| pk | Long | 기본키 |
| tier_name | String | 티어 이름 (예: "골드", "플래티넘") |
| tier_level | String | 티어 레벨 (예: "상급", "중급", "하급") |
| kills | Integer | 킬 수 기준 |
| damage | Integer | 데미지 기준 |
| kills_damage | Integer | 킬+데미지 합산 기준 |

**API 응답 형식:**

```typescript
interface Clantier {
  id: number;                    // pk
  tier_name: string;             // 티어 이름
  tier_level: string;            // 티어 레벨
  kills: number;                 // 킬 수 기준
  damage: number;                // 데미지 기준
  kills_damage: number;          // 킬+데미지 합산
}
```

**예시 데이터:**
```json
{
  "id": 3,
  "tier_name": "골드",
  "tier_level": "상급",
  "kills": 100,
  "damage": 50000,
  "kills_damage": 150
}
```

---

### 4. Right (권한)

권한은 멤버의 역할과 배지를 정의합니다.

**데이터베이스 테이블:**

| 구분 | 타입 | 비고 |
| --- | --- | --- |
| pk | Long | 기본키 |
| key | String | 권한 키 (영문 소문자, UNIQUE, 예: "vip", "moderator", "master") |
| label | String | 라벨/표시명 (예: "VIP", "운영자", "MASTER") |
| color | String | 텍스트 색상 (hex 코드, 예: "#dc2626") |
| bgColor | String | 배경 색상 (hex 코드, 예: "#fee2e2") |
| description | String | 권한 설명 (nullable) |

**API 응답 형식:**

```typescript
interface Right {
  id: number;                    // pk
  key: string;                   // 권한 키 (UNIQUE)
  label: string;                 // 표시명
  color: string;                 // 텍스트 색상 (hex)
  bgColor: string;               // 배경 색상 (hex)
  description: string;           // 권한 설명
}
```

**예시 데이터:**
```json
{
  "id": 1,
  "key": "master",
  "label": "MASTER",
  "color": "#dc2626",
  "bgColor": "#fee2e2",
  "description": "서버 마스터 권한"
}
```

---

### 5. Activity (활동 기록)

Reports 페이지에 표시되는 최근 활동 타임라인입니다.

```typescript
interface Activity {
  id: number;                    // 고유 ID
  type: 'win' | 'rank_up' | 'play' | 'achievement';  // 활동 타입
  name: string;                  // 멤버 이름 또는 Discord 닉네임
  description: string;           // 활동 설명
  time: string;                  // 활동 시간 (상대 시간, 예: "3분 전", "1시간 전")
  timestamp: string;             // ISO 8601 형식 타임스탬프 (예: "2024-10-24T10:30:00Z")
}
```

**예시 데이터:**
```json
{
  "id": 1,
  "type": "win",
  "name": "ShadowHunter",
  "description": "치킨 디너 달성 (Squad)",
  "time": "3분 전",
  "timestamp": "2024-10-24T10:30:00Z"
}
```

---

### 6. Birthday (생일자)

Reports 페이지에 표시되는 이번 달 생일자 목록입니다.

```typescript
interface Birthday {
  id: number;                    // 멤버 ID
  discordName: string;           // Discord 닉네임
  birthday: string;              // 생일 (형식: "YYYY-MM-DD")
  avatar: string;                // 아바타 이모지 또는 URL
}
```

**예시 데이터:**
```json
{
  "id": 1,
  "discordName": "치킨러버",
  "birthday": "2024-10-25",
  "avatar": "🎮"
}
```

---

### 7. ClanStats (클랜 통계)

Reports 페이지 상단에 표시되는 클랜 전체 통계입니다.

```typescript
interface ClanStats {
  totalMembers: number;          // 총 멤버 수
  activeMembers: number;         // 활성 멤버 수 (최근 7일 내 활동)
  activeRate: number;            // 활성률 (퍼센트, 0-100)
  avgGameTime: string;           // 평균 게임 시간 (예: "3.2시간")
  popularMode: string;           // 인기 모드 (예: "Squad", "Duo")
}
```

**예시 데이터:**
```json
{
  "totalMembers": 48,
  "activeMembers": 35,
  "activeRate": 73,
  "avgGameTime": "3.2시간",
  "popularMode": "Squad"
}
```

---

### 8. RankingPlayer (랭킹 플레이어)

PubgRank 페이지에 표시되는 실시간 랭킹 데이터입니다.

```typescript
interface RankingPlayer {
  id: string;                    // 고유 ID (예: "master-1")
  rank: number;                  // 현재 순위
  prevRank: number;              // 이전 순위
  rankChange: number;            // 순위 변동 (양수: 상승, 음수: 하락, 0: 유지)
  name: string;                  // 게임 내 닉네임
  discordName: string;           // Discord 닉네임
  tier: string;                  // 티어 (예: "Master", "Gold")
  wins: number;                  // 승리 횟수
  kills: number;                 // 총 킬 수
  kd: string;                    // K/D 비율 (문자열, 예: "2.4")
  winRate: number;               // 승률 (퍼센트)
  score: number;                 // 점수
}
```

**예시 데이터:**
```json
{
  "id": "master-1",
  "rank": 1,
  "prevRank": 3,
  "rankChange": 2,
  "name": "ShadowHunter",
  "discordName": "치킨러버#1234",
  "tier": "Master",
  "wins": 45,
  "kills": 230,
  "kd": "3.2",
  "winRate": 65,
  "score": 1850
}
```

---

## API 엔드포인트

### 베이스 URL
```
http://api.tktk-clan.com/v1
```
또는 로컬 개발 환경:
```
http://localhost:3000/api/v1
```

---

### 1. Members API

#### **GET** `/members`
모든 멤버 목록을 가져옵니다.

**Query Parameters:**
- `tier` (선택): 티어별 필터링 (예: `?tier=master`)
- `right` (선택): 권한별 필터링 (예: `?right=streamer`)
- `search` (선택): 이름 검색 (예: `?search=져니`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "XX_져니",
      "info": { ... },
      "discord": { ... },
      "game": { ... },
      "streaming": { ... },
      "memberofthestaff": { ... }
    }
  ],
  "count": 48
}
```

---

#### **GET** `/members/:id`
특정 멤버의 상세 정보를 가져옵니다.

**Path Parameters:**
- `id`: 멤버 ID (숫자)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "XX_져니",
    "info": { ... },
    "discord": { ... },
    "game": { ... },
    "streaming": { ... },
    "memberofthestaff": { ... }
  }
}
```

---

#### **POST** `/members`
새로운 멤버를 추가합니다.

**Request Body:**
```json
{
  "name": "NewPlayer",
  "info": {
    "discordname": "NewPlayer#1234",
    "gamename": "GameNick",
    "koreaname": "신규",
    "birthday": "2000-01-01"
  },
  "discord": {
    "right": ["3tier"],
    "join": "2024-10-24"
  },
  "game": {
    "tier": "gold",
    "level": "중",
    "gamename": "GameNick"
  },
  "streaming": {
    "soop": "",
    "chzzk": ""
  },
  "memberofthestaff": {
    "name": ""
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "멤버가 성공적으로 추가되었습니다.",
  "data": {
    "id": 7,
    "name": "NewPlayer"
  }
}
```

---

#### **PUT** `/members/:id`
멤버 정보를 수정합니다.

**Path Parameters:**
- `id`: 멤버 ID

**Request Body:** (수정할 필드만 포함)
```json
{
  "game": {
    "tier": "master",
    "level": "상"
  },
  "discord": {
    "right": ["master", "3tier"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "멤버 정보가 수정되었습니다.",
  "data": {
    "id": 1
  }
}
```

---

#### **DELETE** `/members/:id`
멤버를 삭제합니다.

**Path Parameters:**
- `id`: 멤버 ID

**Response:**
```json
{
  "success": true,
  "message": "멤버가 삭제되었습니다."
}
```

---

### 2. Rights API

#### **GET** `/rights`
모든 권한 목록을 가져옵니다.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "master",
      "label": "MASTER",
      "color": "#dc2626",
      "bgColor": "#fee2e2",
      "description": "서버 마스터 권한"
    }
  ]
}
```

---

#### **POST** `/rights`
새로운 권한을 추가합니다.

**Request Body:**
```json
{
  "key": "vip",
  "label": "VIP",
  "color": "#f59e0b",
  "bgColor": "#fef3c7",
  "description": "VIP 멤버 권한"
}
```

**Response:**
```json
{
  "success": true,
  "message": "권한이 추가되었습니다.",
  "data": {
    "id": 4,
    "key": "vip"
  }
}
```

---

#### **PUT** `/rights/:id`
권한 정보를 수정합니다.

**Path Parameters:**
- `id`: 권한 ID

**Request Body:**
```json
{
  "label": "VIP MEMBER",
  "color": "#ea580c"
}
```

**Response:**
```json
{
  "success": true,
  "message": "권한이 수정되었습니다.",
  "data": {
    "id": 4
  }
}
```

---

#### **DELETE** `/rights/:id`
권한을 삭제합니다.

**Path Parameters:**
- `id`: 권한 ID

**Response:**
```json
{
  "success": true,
  "message": "권한이 삭제되었습니다."
}
```

---

### 3. Reports API

#### **GET** `/reports/stats`
클랜 전체 통계를 가져옵니다.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 48,
    "activeMembers": 35,
    "activeRate": 73,
    "avgGameTime": "3.2시간",
    "popularMode": "Squad"
  }
}
```

---

#### **GET** `/reports/birthdays`
이번 달 생일자 목록을 가져옵니다.

**Query Parameters:**
- `month` (선택): 특정 월의 생일자 (예: `?month=11`, 기본값: 현재 월)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "discordName": "치킨러버",
      "birthday": "2024-10-25",
      "avatar": "🎮"
    }
  ]
}
```

---

#### **GET** `/reports/activities`
최근 활동 타임라인을 가져옵니다.

**Query Parameters:**
- `limit` (선택): 가져올 개수 (기본값: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "win",
      "name": "ShadowHunter",
      "description": "치킨 디너 달성 (Squad)",
      "time": "3분 전",
      "timestamp": "2024-10-24T10:30:00Z"
    }
  ]
}
```

---

### 4. Rankings API

#### **GET** `/rankings`
실시간 랭킹 목록을 가져옵니다.

**Query Parameters:**
- `tier` (선택): 티어별 필터링 (예: `?tier=master`, 기본값: `all`)
- `limit` (선택): 가져올 개수 (기본값: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "master-1",
      "rank": 1,
      "prevRank": 3,
      "rankChange": 2,
      "name": "ShadowHunter",
      "discordName": "치킨러버#1234",
      "tier": "Master",
      "wins": 45,
      "kills": 230,
      "kd": "3.2",
      "winRate": 65,
      "score": 1850
    }
  ]
}
```

---

## Discord Bot 연동

Discord Bot은 서버 API와 연동하여 멤버 정보를 자동으로 동기화합니다.

### Bot이 수집 가능한 정보

1. **Discord API로 직접 가져올 수 있는 정보:**
   - `discordname`: Discord 사용자명 (예: "Username#1234")
   - `joinDate`: 서버 가입일 (서버에 처음 조인한 날짜)
   - `rights`: Discord 역할 기반 권한 (서버 역할과 매핑, 예: ["master", "3tier"])

2. **Bot 명령어로 수집해야 하는 정보:**
   - `name`: 멤버 이름 (사용자가 직접 등록)
   - `game.gamename`: PUBG 게임 닉네임 (사용자가 직접 등록)
   - `birthday`: 생일 (사용자가 직접 등록, YYYY-MM-DD)
   - `game.tier`: PUBG 티어 (PUBG API 연동 또는 사용자 입력)
   - `streaming_soop`, `streaming_chzzk`: 스트리밍 URL (사용자가 직접 등록)
   - `memberofthestaff`: 담당 스태프 (관리자가 지정)
   - `clantierId`: 클랜 티어 (관리자가 지정 또는 자동 계산)

### Bot 명령어 예시

```
!register 이름 게임닉네임 생년월일
예: !register 홍길동 ShadowHunter 1995-11-09

!tier 티어
예: !tier master

!streaming soop https://soop.tv/username
!streaming chzzk https://chzzk.naver.com/username
```

### Bot → API 자동 동기화

Bot은 다음과 같은 이벤트를 감지하고 API를 호출해야 합니다:

1. **멤버 가입**: `POST /members` 호출
2. **멤버 탈퇴**: `DELETE /members/:id` 호출
3. **역할 변경**: `PUT /members/:id` 호출 (rights 배열 업데이트)
4. **게임 활동 감지**: `POST /reports/activities` 호출

---

## 인증 및 권한

### 인증 방식
JWT (JSON Web Token) 기반 인증을 권장합니다.

#### 로그인 (관리자용)
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### 인증 헤더
모든 보호된 엔드포인트는 다음 헤더를 요구합니다:
```
Authorization: Bearer <token>
```

### 권한 레벨
1. **PUBLIC**: 인증 불필요 (`GET /members`, `GET /rankings`)
2. **USER**: 일반 사용자 (자기 정보 수정)
3. **ADMIN**: 관리자 (모든 CRUD 작업 가능)
4. **BOT**: Discord Bot 전용 (자동 동기화용)

---

## 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "해당 ID의 멤버를 찾을 수 없습니다.",
    "details": {}
  }
}
```

### 주요 에러 코드
- `VALIDATION_ERROR`: 요청 데이터 검증 실패
- `MEMBER_NOT_FOUND`: 멤버를 찾을 수 없음
- `RIGHT_NOT_FOUND`: 권한을 찾을 수 없음
- `DUPLICATE_ENTRY`: 중복 데이터
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 부족
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류

---

## 배포 고려사항

### 환경 변수
```env
# 서버 설정
PORT=3000
NODE_ENV=production

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tktk_clan
DB_USER=admin
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id

# PUBG API (선택)
PUBG_API_KEY=your_pubg_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3001,https://tktk-clan.com
```

### 데이터베이스 스키마 (PostgreSQL 예시)
```sql
-- Game 테이블
CREATE TABLE game (
  id SERIAL PRIMARY KEY,
  gamename VARCHAR(255) NOT NULL,
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'crown', 'ace', 'master', 'conqueror')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clantier 테이블
CREATE TABLE clantier (
  id SERIAL PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL,
  tier_level VARCHAR(50),
  kills INT DEFAULT 0,
  damage INT DEFAULT 0,
  kills_damage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members 테이블
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  clantier_id INT REFERENCES clantier(id) ON DELETE SET NULL,
  game_id INT REFERENCES game(id) ON DELETE SET NULL,
  rights TEXT[], -- PostgreSQL 배열 타입 (또는 JSON)
  birthday DATE,
  discordname VARCHAR(255) NOT NULL,
  streaming_soop TEXT,
  streaming_chzzk TEXT,
  memberofthestaff VARCHAR(255),
  join_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rights 테이블
CREATE TABLE rights (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#000000',
  bg_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities 테이블
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('win', 'rank_up', 'play', 'achievement')),
  member_id INT REFERENCES members(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rankings 테이블 (캐시용)
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES members(id) ON DELETE CASCADE,
  tier VARCHAR(50),
  rank INT NOT NULL,
  prev_rank INT,
  wins INT DEFAULT 0,
  kills INT DEFAULT 0,
  kd DECIMAL(3,1) DEFAULT 0.0,
  win_rate INT DEFAULT 0,
  score INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX idx_members_discordname ON members(discordname);
CREATE INDEX idx_members_clantier ON members(clantier_id);
CREATE INDEX idx_members_game ON members(game_id);
CREATE INDEX idx_rights_key ON rights(key);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_rankings_tier ON rankings(tier);
```

---

## 추가 기능 제안

1. **실시간 업데이트**: WebSocket 또는 Server-Sent Events (SSE)를 통한 실시간 랭킹 업데이트
2. **캐싱**: Redis를 활용한 랭킹 데이터 캐싱 (5분 TTL)
3. **PUBG API 연동**: 공식 PUBG API를 통한 실시간 전적 동기화
4. **파일 업로드**: 멤버 프로필 이미지 업로드 (AWS S3 또는 Cloudinary)
5. **알림 시스템**: 생일, 승급, 이벤트 알림을 Discord 채널로 전송
6. **통계 분석**: 멤버별/티어별 상세 통계 대시보드

---

## 문의
프로젝트 관련 문의사항은 개발팀에 문의해주세요.

**문서 버전**: 1.0.0
**최종 수정일**: 2024-10-24
