# Vercel + Supabase 배포 계획서

## 🎯 배포 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   사용자                        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              Vercel (Frontend)                  │
│  - Next.js / React / Vanilla HTML               │
│  - 정적 파일 호스팅                             │
│  - 자동 HTTPS                                   │
│  - CDN 배포                                     │
└─────────────────┬───────────────────────────────┘
                  │
                  │ API 호출
                  ▼
┌─────────────────────────────────────────────────┐
│            Supabase (Backend)                   │
│  - PostgreSQL Database                          │
│  - RESTful API (자동 생성)                      │
│  - 실시간 구독                                  │
│  - 인증 (선택사항)                              │
└─────────────────────────────────────────────────┘
```

## 📊 Supabase 데이터베이스 스키마

### 1. courses (코스) 테이블

```sql
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('초급', '중급', '고급')),
  distance VARCHAR(10) NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_courses_date ON courses(date);
CREATE INDEX idx_courses_location ON courses(location);
CREATE INDEX idx_courses_level ON courses(level);
```

### 2. participants (참가자) 테이블

```sql
CREATE TABLE participants (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('초급', '중급', '고급')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 방지: 같은 코스에 같은 이름 중복 불가
  UNIQUE(course_id, name)
);

-- 인덱스 생성
CREATE INDEX idx_participants_course_id ON participants(course_id);
```

### 3. 뷰 (View): 코스 + 참가자 수

```sql
CREATE VIEW courses_with_count AS
SELECT
  c.*,
  COUNT(p.id) as current_participants,
  CASE
    WHEN COUNT(p.id) >= c.max_participants THEN true
    ELSE false
  END as is_closed
FROM courses c
LEFT JOIN participants p ON c.id = p.course_id
GROUP BY c.id;
```

## 🔧 Supabase 설정

### 1. Row Level Security (RLS) 정책

```sql
-- courses 테이블: 모든 사용자가 읽기 가능
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read courses"
ON courses FOR SELECT
TO public
USING (true);

-- 관리자만 코스 추가/수정/삭제 (나중에 구현)
-- CREATE POLICY "Only admins can insert courses"
-- ON courses FOR INSERT
-- TO authenticated
-- USING (auth.role() = 'admin');

-- participants 테이블: 모든 사용자가 읽기 가능, 추가 가능
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read participants"
ON participants FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert participants"
ON participants FOR INSERT
TO public
WITH CHECK (true);
```

### 2. 데이터베이스 함수

```sql
-- 코스에 참가자 추가 (인원 제한 체크)
CREATE OR REPLACE FUNCTION add_participant(
  p_course_id BIGINT,
  p_name VARCHAR,
  p_contact VARCHAR,
  p_level VARCHAR
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_count INTEGER;
  v_max_participants INTEGER;
  v_participant_id BIGINT;
BEGIN
  -- 현재 참가자 수와 최대 인원 확인
  SELECT
    COUNT(p.id),
    c.max_participants
  INTO
    v_current_count,
    v_max_participants
  FROM courses c
  LEFT JOIN participants p ON c.id = p.course_id
  WHERE c.id = p_course_id
  GROUP BY c.max_participants;

  -- 인원 초과 체크
  IF v_current_count >= v_max_participants THEN
    RETURN json_build_object(
      'success', false,
      'message', '모집 인원이 마감되었습니다.'
    );
  END IF;

  -- 참가자 추가
  INSERT INTO participants (course_id, name, contact, level)
  VALUES (p_course_id, p_name, p_contact, p_level)
  RETURNING id INTO v_participant_id;

  RETURN json_build_object(
    'success', true,
    'message', '신청이 완료되었습니다.',
    'participant_id', v_participant_id
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'message', '이미 신청한 이름입니다.'
    );
END;
$$;
```

## 🚀 프론트엔드 (Vercel)

### 1. 프로젝트 구조

```
minhae-proj/
├── index.html              # 메인 페이지
├── css/
│   └── styles.css          # 스타일시트
├── js/
│   ├── supabase-client.js  # Supabase 클라이언트 설정
│   ├── courses.js          # 코스 관련 로직
│   └── main.js             # 메인 로직
├── vercel.json             # Vercel 설정
└── package.json            # 패키지 정보 (필요시)
```

### 2. Supabase 클라이언트 연동

```javascript
// js/supabase-client.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 3. 주요 API 호출

```javascript
// 코스 목록 조회
const { data: courses, error } = await supabase
  .from('courses_with_count')
  .select('*')
  .order('date', { ascending: true })

// 참가자 추가 (함수 호출)
const { data, error } = await supabase
  .rpc('add_participant', {
    p_course_id: courseId,
    p_name: name,
    p_contact: contact,
    p_level: level
  })

// 특정 코스의 참가자 목록
const { data: participants, error } = await supabase
  .from('participants')
  .select('*')
  .eq('course_id', courseId)
  .order('joined_at', { ascending: false })
```

## 📦 배포 단계

### Phase 1: Supabase 설정
1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 스키마 생성
3. ✅ RLS 정책 설정
4. ✅ 샘플 데이터 입력
5. ✅ API 키 확인

### Phase 2: 프론트엔드 개발
1. ✅ HTML 구조 리팩토링
2. ✅ Supabase 클라이언트 연동
3. ✅ API 호출 로직 구현
4. ✅ 에러 핸들링
5. ✅ 로컬 테스트

### Phase 3: Vercel 배포
1. ✅ Git 저장소 연결
2. ✅ 환경 변수 설정
3. ✅ Vercel 프로젝트 생성
4. ✅ 자동 배포 설정
5. ✅ 커스텀 도메인 연결 (선택사항)

## 🔐 환경 변수

### Vercel 환경 변수 설정

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## 🌐 API 엔드포인트

### Supabase REST API

```
# 코스 목록 조회
GET https://your-project.supabase.co/rest/v1/courses_with_count

# 참가자 목록 조회
GET https://your-project.supabase.co/rest/v1/participants?course_id=eq.1

# 참가자 추가 (RPC 함수)
POST https://your-project.supabase.co/rest/v1/rpc/add_participant
Content-Type: application/json
{
  "p_course_id": 1,
  "p_name": "홍길동",
  "p_contact": "010-1234-5678",
  "p_level": "초급"
}
```

## 📋 체크리스트

### Supabase
- [ ] 프로젝트 생성
- [ ] 데이터베이스 스키마 생성
- [ ] RLS 정책 설정
- [ ] 함수 생성
- [ ] 샘플 데이터 입력
- [ ] API 테스트

### Frontend
- [ ] Supabase 클라이언트 설정
- [ ] API 연동
- [ ] 에러 핸들링
- [ ] 로딩 상태 처리
- [ ] 반응형 테스트

### Vercel
- [ ] Git 저장소 생성
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정
- [ ] 배포 테스트
- [ ] 도메인 연결 (선택)

## 🔄 개발 워크플로우

```
1. 로컬 개발
   ↓
2. Git commit & push
   ↓
3. Vercel 자동 빌드
   ↓
4. Preview 배포 (PR)
   ↓
5. main 브랜치 머지
   ↓
6. Production 배포
```

## 💡 추가 고려사항

### 1. 성능 최적화
- Supabase Connection Pooling
- CDN 캐싱 (Vercel)
- 이미지 최적화

### 2. 모니터링
- Vercel Analytics
- Supabase Dashboard
- Error Tracking (Sentry 등)

### 3. 보안
- API Rate Limiting
- CORS 설정
- Environment Variables 관리

### 4. 향후 확장
- 사용자 인증 (Supabase Auth)
- 관리자 페이지
- 이메일 알림
- 실시간 업데이트 (Supabase Realtime)

## 📚 참고 문서

- Supabase 문서: https://supabase.com/docs
- Vercel 문서: https://vercel.com/docs
- Supabase JavaScript Client: https://supabase.com/docs/reference/javascript

---

**작성일**: 2025-10-16
**버전**: 1.0
**상태**: 계획 단계
