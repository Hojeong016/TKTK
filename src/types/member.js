/**
 * Member 데이터 타입 정의 (서버 DTO 구조와 일치)
 *
 * @typedef {Object} MemberInfo
 * @property {string} discordname - 디스코드 닉네임
 * @property {string} birthday - 생일 (YYYY-MM-DD 또는 LocalDate)
 *
 * @typedef {Object} DiscordInfo
 * @property {string[]} right - 권한 목록
 *
 * @typedef {Object} GameInfo
 * @property {string} tier - 티어 (PUBGTier)
 * @property {string} gamename - 게임 닉네임
 *
 * @typedef {Object} StreamingInfo
 * @property {string} [soop] - Soop 스트리밍 URL
 * @property {string} [chzzk] - Chzzk 스트리밍 URL
 *
 * @typedef {Object} StaffInfo
 * @property {string} name - 담당 스태프 이름
 *
 * @typedef {Object} Member
 * @property {string} id - 멤버 고유 ID (Hashids로 암호화된 String)
 * @property {string} name - 멤버 이름
 * @property {MemberInfo} info - 멤버 기본 정보
 * @property {DiscordInfo} discord - 디스코드 관련 정보
 * @property {GameInfo} game - 게임 관련 정보
 * @property {StreamingInfo} streaming - 스트리밍 정보
 * @property {StaffInfo} memberofthestaff - 담당 스태프 정보
 */

export const MemberType = {};
