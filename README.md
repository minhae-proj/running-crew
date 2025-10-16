# 🏃‍♂️ 러닝 크루 모집 플랫폼

함께 달릴 멤버를 모집하는 웹 플랫폼입니다.

## 📋 프로젝트 개요

- **기술 스택**: HTML, CSS, JavaScript (ES6 Modules)
- **백엔드**: Supabase (PostgreSQL + REST API)
- **배포**: Vercel
- **디자인**: 옵션 A (단일 페이지, 아코디언 방식)

## ✨ 주요 기능

- 다양한 러닝 코스 목록 표시
- 날짜/장소/레벨/거리별 필터링
- 코스 상세 정보 확인
- 실시간 신청 및 참가자 목록
- 인원 제한 및 중복 방지
- 반응형 디자인

## 🚀 로컬 개발 환경 설정

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd minhae-proj
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 계정 생성
2. 새 프로젝트 생성
3. SQL Editor에서 `supabase-schema.sql` 파일 실행

```bash
# supabase-schema.sql의 내용을 Supabase SQL Editor에 복사하여 실행
```

4. 프로젝트 설정에서 API URL과 Anon Key 복사
5. `.env.example`을 `.env`로 복사하고 값 입력

```bash
cp .env.example .env
# .env 파일을 열어 SUPABASE_URL과 SUPABASE_ANON_KEY 입력
```

### 3. 로컬 서버 실행

```bash
# Python 3 사용
python3 -m http.server 8000

# 또는 npm 스크립트 사용
npm run dev
```

브라우저에서 `http://localhost:8000` 접속

## 📦 Vercel 배포

### 1. Git 저장소 초기화

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com) 계정 생성/로그인
2. "New Project" 클릭
3. Git 저장소 연결
4. 프로젝트 Import

### 3. 환경 변수 설정

Vercel 프로젝트 설정 > Environment Variables에서:

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key

### 4. 배포

```bash
# 자동 배포 (git push 시)
git push origin main

# 또는 Vercel CLI 사용
npm i -g vercel
vercel --prod
```

## 📂 프로젝트 구조

```
minhae-proj/
├── index.html              # 메인 HTML 파일
├── js/
│   ├── config.js          # Supabase 설정
│   ├── api.js             # API 호출 로직
│   ├── ui.js              # UI 렌더링 로직
│   └── main.js            # 메인 로직
├── public/
│   └── styles.css         # 스타일시트
├── supabase-schema.sql    # 데이터베이스 스키마
├── package.json           # 패키지 설정
├── vercel.json            # Vercel 설정
├── .env.example           # 환경 변수 예시
├── .gitignore             # Git 무시 파일
└── README.md              # 프로젝트 문서

문서/
├── chat-history.md        # 개발 히스토리
├── running-crew-plan.md   # 프로젝트 계획서
├── design-option-a.md     # 디자인 옵션 A 상세
└── deployment-plan.md     # 배포 계획서
```

## 🗄️ 데이터베이스 스키마

### courses 테이블
- id, title, location, date, time
- level, distance, max_participants
- description, created_at, updated_at

### participants 테이블
- id, course_id, name, contact
- level, joined_at

### courses_with_count 뷰
- 코스 + 현재 참가자 수 + 마감 여부

## 🔧 개발 가이드

### 코스 추가

Supabase Dashboard > Table Editor > courses 테이블에서 직접 추가하거나, SQL Editor에서:

```sql
INSERT INTO courses (title, location, date, time, level, distance, max_participants, description)
VALUES ('코스 제목', '장소', '2025-10-30', '07:00', '초급', '5km', 10, '코스 설명');
```

### API 엔드포인트

모든 API는 Supabase REST API를 통해 자동 생성됩니다:

- `GET /courses_with_count` - 코스 목록 조회
- `GET /participants?course_id=eq.1` - 참가자 조회
- `POST /rpc/add_participant` - 참가자 추가

## 🎨 디자인 커스터마이징

`public/styles.css`에서 색상 변경:

```css
/* 주요 그라데이션 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 원하는 색상으로 변경 */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

## 📝 TODO

- [ ] 관리자 인증 추가
- [ ] 신청 취소 기능
- [ ] 이메일 알림
- [ ] 지도 통합
- [ ] 실시간 업데이트 (Supabase Realtime)

## 📄 라이센스

MIT

## 👥 기여

이슈 및 PR 환영합니다!

## 📞 문의

문의사항이 있으시면 이슈를 등록해주세요.
