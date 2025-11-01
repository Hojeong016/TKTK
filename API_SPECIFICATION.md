# API 명세서 - Member Management System

## 개요
이 문서는 React 프론트엔드와 Spring Boot 백엔드 간의 API 통신 규격을 정의합니다.

## Base URL
```
개발 환경: http://localhost:3001
프로덕션: https://your-api-domain.com
```

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "success"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

## API 엔드포인트

### 1. 멤버 목록 조회
**GET** `/api/members`

**설명**: 모든 멤버 목록을 조회합니다.

**Request Parameters**: 없음

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "PlayerName",
    "info": {
      "discordname": "discord#1234",
      "gamename": "GameName",
      "koreaname": "한글이름",
      "birthday": "1990-01-01",
      "description": "설명"
    },
    "discord": {
      "right": ["member", "admin"],
      "join": "2024-01-01T00:00:00Z"
    },
    "game": {
      "tier": "Master",
      "gamename": "GameName"
    },
    "streaming": {
      "soop": "https://soop.url",
      "chzzk": "https://chzzk.url"
    },
    "memberofthestaff": {
      "name": "StaffName"
    }
  }
]
```

---

### 2. 특정 멤버 조회
**GET** `/api/members/{id}`

**설명**: ID로 특정 멤버를 조회합니다.

**Path Parameters**:
- `id` (Long): 멤버 ID

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "PlayerName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "GameName",
    "koreaname": "한글이름",
    "birthday": "1990-01-01",
    "description": "설명"
  },
  "discord": {
    "right": ["member", "admin"],
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Master",
    "gamename": "GameName"
  },
  "streaming": {
    "soop": "https://soop.url",
    "chzzk": "https://chzzk.url"
  },
  "memberofthestaff": {
    "name": "StaffName"
  }
}
```

**Error**: `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "해당 ID의 멤버를 찾을 수 없습니다."
  }
}
```

---

### 3. 멤버 생성
**POST** `/api/members`

**설명**: 새로운 멤버를 생성합니다.

**Request Body**:
```json
{
  "name": "PlayerName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "GameName",
    "koreaname": "한글이름",
    "birthday": "1990-01-01",
    "description": "설명"
  },
  "discord": {
    "right": ["member"],
    "discordTierId": null,
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Master",
    "gamename": "GameName"
  },
  "streaming": {
    "soop": "https://soop.url",
    "chzzk": "https://chzzk.url"
  },
  "memberofthestaff": {
    "name": "StaffName"
  },
  "tktkTier": "1tier"
}
```

**Response**: `201 Created`
```json
{
  "name": "PlayerName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "GameName",
    "koreaname": "한글이름",
    "birthday": "1990-01-01"
  },
  "discord": {
    "right": ["member"],
    "discordTierId": null,
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Master",
    "gamename": "GameName"
  },
  "streaming": {
    "soop": "https://soop.url",
    "chzzk": "https://chzzk.url"
  },
  "memberofthestaff": {
    "name": "StaffName"
  }
}
```

**Error**: `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "필수 입력값이 누락되었습니다."
  }
}
```

---

### 4. 멤버 전체 수정
**PUT** `/api/members/{id}`

**설명**: 멤버 정보를 전체적으로 수정합니다. (모든 필드 필요)

**Path Parameters**:
- `id` (Long): 멤버 ID

**Request Body**:
```json
{
  "name": "UpdatedName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "UpdatedGameName",
    "koreaname": "수정된이름",
    "birthday": "1990-01-01",
    "description": "수정된 설명"
  },
  "discord": {
    "right": ["member", "admin"],
    "discordTierId": 1,
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Ace",
    "gamename": "UpdatedGameName"
  },
  "streaming": {
    "soop": "https://new-soop.url",
    "chzzk": "https://new-chzzk.url"
  },
  "memberofthestaff": {
    "name": "NewStaffName"
  }
}
```

**Response**: `200 OK`
```json
{
  "name": "UpdatedName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "UpdatedGameName",
    "koreaname": "수정된이름",
    "birthday": "1990-01-01"
  },
  "discord": {
    "right": ["member", "admin"],
    "discordTierId": 1,
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Ace",
    "gamename": "UpdatedGameName"
  },
  "streaming": {
    "soop": "https://new-soop.url",
    "chzzk": "https://new-chzzk.url"
  },
  "memberofthestaff": {
    "name": "NewStaffName"
  }
}
```

---

### 5. 멤버 부분 수정
**PATCH** `/api/members/{id}`

**설명**: 멤버 정보를 부분적으로 수정합니다. (일부 필드만 전송 가능)

**Path Parameters**:
- `id` (Long): 멤버 ID

**Request Body**: (수정할 필드만 포함)
```json
{
  "game": {
    "tier": "Conqueror"
  },
  "discord": {
    "right": ["member", "admin", "moderator"],
    "discordTierId": 2
  }
}
```

**Response**: `200 OK`
```json
{
  "name": "PlayerName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "GameName",
    "koreaname": "한글이름",
    "birthday": "1990-01-01"
  },
  "discord": {
    "right": ["member", "admin", "moderator"],
    "discordTierId": 2,
    "join": "2024-01-01T00:00:00Z"
  },
  "game": {
    "tier": "Conqueror",
    "gamename": "GameName"
  },
  "streaming": {
    "soop": "https://soop.url",
    "chzzk": "https://chzzk.url"
  },
  "memberofthestaff": {
    "name": "StaffName"
  }
}
```

---

### 6. 멤버 삭제
**DELETE** `/api/members/{id}`

**설명**: 멤버를 삭제합니다.

**Path Parameters**:
- `id` (Long): 멤버 ID

**Response**: `204 No Content`

**Error**: `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "해당 ID의 멤버를 찾을 수 없습니다."
  }
}
```

---

### 7. 필터링된 멤버 조회
**GET** `/api/members?rights={rights}&tiers={tiers}`

**설명**: 권한 또는 티어로 필터링된 멤버 목록을 조회합니다.

**Query Parameters**:
- `rights` (String, optional): 쉼표로 구분된 권한 목록 (예: `admin,member`)
- `tiers` (String, optional): 쉼표로 구분된 티어 목록 (예: `Master,Ace`)

**예시**:
```
GET /api/members?rights=admin,member
GET /api/members?tiers=Master,Ace,Conqueror
GET /api/members?rights=admin&tiers=Master
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "PlayerName",
    "info": { ... },
    "discord": { ... },
    "game": { ... },
    "streaming": { ... },
    "memberofthestaff": { ... }
  }
]
```

---

## 데이터 타입

### PUBG Tier (게임 티어)
- `Conqueror`
- `Master`
- `Ace`
- `Crown`
- `Diamond`
- `Platinum`
- `Gold`
- `Silver`
- `Bronze`
- `Free`

### TKTK Tier (클랜 티어)
- `1tier`
- `2tier`
- `3tier`
- `4tier`

### Right (권한)
권한은 동적으로 관리되며, 일반적으로:
- `admin` - 관리자
- `member` - 일반 멤버
- `moderator` - 운영진
- `streamer` - 스트리머

---

## CORS 설정
프론트엔드가 `http://localhost:3000`에서 실행되므로, Spring Boot에서 CORS 설정이 필요합니다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `MEMBER_NOT_FOUND` | 요청한 ID의 멤버를 찾을 수 없음 |
| `INVALID_INPUT` | 입력 데이터가 유효하지 않음 |
| `DUPLICATE_MEMBER` | 이미 존재하는 멤버 |
| `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

---

---

## 프론트엔드 실제 구현

### 멤버 생성 (AddMemberModal.js)
```javascript
// POST /api/members
{
  "name": "PlayerName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "GameName",
    "koreaname": "한글이름",
    "birthday": "1990-01-01",
    "description": ""
  },
  "discord": {
    "right": ["member", "admin"],
    "discordTierId": null,  // 서버에서 처리
    "join": "2025-01-01T00:00:00.000Z"  // 현재 시간
  },
  "game": {
    "tier": "Master",
    "gamename": "GameName"
  },
  "streaming": {
    "soop": "https://soop.url",
    "chzzk": "https://chzzk.url"
  },
  "memberofthestaff": {
    "name": ""
  },
  "tktkTier": "1tier"  // TKTK 티어 이름 (1tier, 2tier, 3tier, 4tier)
}
```

### 멤버 수정 (MemberManagementTable.js)
```javascript
// PUT /api/members/{id}
{
  "name": "UpdatedName",
  "info": {
    "discordname": "discord#1234",
    "gamename": "UpdatedGameName",
    "koreaname": "수정된이름",
    "birthday": "1990-01-01",
    "description": ""  // 원본 유지
  },
  "discord": {
    "right": ["member", "admin", "moderator"],
    "discordTierId": 1,  // 원본 유지
    "join": "2024-01-01T00:00:00Z"  // 원본 유지
  },
  "game": {
    "tier": "Ace",
    "gamename": "UpdatedGameName"
  },
  "streaming": {
    "soop": "https://new-soop.url",
    "chzzk": "https://new-chzzk.url"
  },
  "memberofthestaff": {
    "name": ""  // 원본 유지
  }
}
```

### 멤버 삭제 (MemberManagementTable.js)
```javascript
// DELETE /api/members/{id}
// Body 없음
```

---

## 참고사항

1. **날짜 형식**: ISO 8601 형식 사용 (`2024-01-01T00:00:00Z`)
2. **Content-Type**: `application/json`
3. **문자 인코딩**: UTF-8
4. **타임아웃**: 10초 (프론트엔드 설정)
5. **권한 필드**: 반드시 배열로 전송 (`["member"]`, `["admin", "member"]`)
6. **가입일**: 생성 시 자동으로 현재 시간 설정
7. **TKTK 티어**: 티어 이름으로 전송 (`1tier`, `2tier`, `3tier`, `4tier`)
