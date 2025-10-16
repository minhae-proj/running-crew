# 🚀 Vercel + Supabase 배포 가이드 (상세 버전)

## 📝 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 설정](#2-데이터베이스-설정)
3. [GitHub 저장소 생성](#3-github-저장소-생성)
4. [Vercel 배포](#4-vercel-배포)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [배포 확인](#6-배포-확인)

---

## 1. Supabase 프로젝트 생성

### Step 1-1: Supabase 회원가입/로그인
1. 브라우저에서 https://supabase.com 접속
2. 우측 상단 **"Start your project"** 또는 **"Sign In"** 클릭
3. GitHub, Google, 또는 이메일로 가입/로그인

### Step 1-2: 새 프로젝트 생성
1. 로그인 후 Dashboard에서 **"New Project"** 클릭
2. 프로젝트 정보 입력:
   ```
   Organization: [기존 조직 선택 또는 새로 생성]
   Name: running-crew (또는 원하는 이름)
   Database Password: [강력한 비밀번호 생성 - 저장해두세요!]
   Region: Northeast Asia (Seoul) [한국에 가장 가까운 리전]
   Pricing Plan: Free
   ```
3. **"Create new project"** 클릭
4. ⏱️ 프로젝트 생성 대기 (약 1-2분 소요)

---

## 2. 데이터베이스 설정

### Step 2-1: SQL Editor 열기
1. 왼쪽 사이드바에서 **"SQL Editor"** 클릭
2. 또는 상단 메뉴에서 **"SQL"** 클릭

### Step 2-2: 스키마 파일 열기
1. 로컬 컴퓨터에서 `/Users/minhae/Documents/minhae-proj/supabase-schema.sql` 파일 열기
2. 파일 내용 전체 복사 (Cmd+A → Cmd+C)

### Step 2-3: SQL 실행
1. SQL Editor의 빈 공간에 붙여넣기 (Cmd+V)
2. 우측 하단 **"Run"** 버튼 클릭 (또는 Cmd+Enter)
3. ✅ 성공 메시지 확인:
   ```
   Success. No rows returned
   ```

### Step 2-4: 테이블 확인
1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. 생성된 테이블 확인:
   - ✅ `courses` (8개 샘플 데이터)
   - ✅ `participants` (3개 샘플 데이터)

### Step 2-5: API 키 복사
1. 왼쪽 사이드바에서 **"Settings"** (톱니바퀴 아이콘) 클릭
2. **"API"** 메뉴 클릭
3. **Project URL** 복사 (예: `https://xxxxxxxxxxxxx.supabase.co`)
   - 📝 메모장에 저장: `SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co`
4. **Project API keys** 섹션에서 **"anon public"** 키 복사
   - 📝 메모장에 저장: `SUPABASE_ANON_KEY=eyJhbGc...`

⚠️ **중요**: 이 두 값을 안전하게 보관하세요!

---

## 3. GitHub 저장소 생성

### Step 3-1: GitHub에 로그인
1. https://github.com 접속
2. 로그인 (계정이 없으면 회원가입)

### Step 3-2: 새 저장소 생성
1. 우측 상단 **"+"** 버튼 → **"New repository"** 클릭
2. 저장소 정보 입력:
   ```
   Repository name: running-crew
   Description: 러닝 크루 모집 플랫폼
   Public or Private: Public (또는 Private)
   ❌ Initialize this repository with: 아무것도 체크 안함
   ```
3. **"Create repository"** 클릭

### Step 3-3: Git 초기화 및 Push
터미널에서 다음 명령어 실행:

```bash
# 1. 프로젝트 폴더로 이동
cd /Users/minhae/Documents/minhae-proj

# 2. Git 초기화 (이미 했다면 생략)
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 커밋
git commit -m "Initial commit: 러닝 크루 모집 플랫폼"

# 5. 브랜치 이름을 main으로 변경
git branch -M main

# 6. GitHub 저장소 연결 (아래 URL을 본인의 것으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/running-crew.git

# 7. Push
git push -u origin main
```

⚠️ **주의**: `YOUR_USERNAME`을 본인의 GitHub 사용자명으로 변경하세요!

### Step 3-4: Push 확인
1. GitHub 저장소 페이지 새로고침
2. 파일들이 업로드되었는지 확인

---

## 4. Vercel 배포

### Step 4-1: Vercel 회원가입/로그인
1. https://vercel.com 접속
2. **"Sign Up"** 또는 **"Login"** 클릭
3. **"Continue with GitHub"** 선택 (GitHub 계정으로 로그인)
4. Vercel이 GitHub 접근 권한 요청 → **"Authorize"** 클릭

### Step 4-2: 새 프로젝트 생성
1. Vercel Dashboard에서 **"Add New..."** → **"Project"** 클릭
2. **"Import Git Repository"** 섹션에서 방금 만든 `running-crew` 저장소 찾기
3. 저장소 오른쪽의 **"Import"** 버튼 클릭

### Step 4-3: 프로젝트 설정
1. **Configure Project** 화면에서:
   ```
   Project Name: running-crew (또는 원하는 이름)
   Framework Preset: Other (선택하지 않아도 됨)
   Root Directory: ./ (기본값)
   Build Command: (비워두기)
   Output Directory: (비워두기)
   Install Command: (비워두기)
   ```

2. **Environment Variables** 섹션 펼치기

---

## 5. 환경 변수 설정

### Step 5-1: 환경 변수 추가
**Environment Variables** 섹션에서:

1. **첫 번째 환경 변수**:
   ```
   Name: SUPABASE_URL
   Value: [Step 2-5에서 복사한 Project URL]
   ```
   - **"Add"** 버튼 클릭

2. **두 번째 환경 변수**:
   ```
   Name: SUPABASE_ANON_KEY
   Value: [Step 2-5에서 복사한 anon public 키]
   ```
   - **"Add"** 버튼 클릭

### Step 5-2: 배포 시작
1. 모든 설정 확인
2. 하단의 **"Deploy"** 버튼 클릭
3. ⏱️ 배포 진행 (약 30초~1분)

---

## 6. 배포 확인

### Step 6-1: 배포 완료 확인
1. 축하 화면과 함께 폭죽 애니메이션 표시 🎉
2. 배포 URL 확인 (예: `https://running-crew-xxxxx.vercel.app`)
3. **"Visit"** 또는 **"Continue to Dashboard"** 클릭

### Step 6-2: 사이트 테스트
1. 배포된 사이트 접속
2. 다음 기능 테스트:
   - ✅ 페이지 로딩
   - ✅ 코스 목록 표시 (8개 코스)
   - ✅ 필터 작동
   - ✅ 코스 카드 확장
   - ✅ 참가자 목록 표시
   - ✅ 신청 폼 제출

### Step 6-3: 신청 테스트
1. 아무 코스의 **"자세히 보기"** 클릭
2. 신청 폼 작성:
   ```
   이름: 테스트 사용자
   연락처: 010-1234-5678
   레벨: 초급
   ```
3. **"신청하기"** 클릭
4. "신청이 완료되었습니다!" 알림 확인
5. 참가자 목록에 추가되었는지 확인

---

## 🎉 배포 완료!

축하합니다! 다음 URL에서 사이트를 확인하세요:
- **Production URL**: `https://your-project-name.vercel.app`

---

## 📝 추가 작업

### 커스텀 도메인 연결 (선택사항)
1. Vercel Dashboard → 프로젝트 선택
2. **"Settings"** → **"Domains"**
3. **"Add Domain"** 클릭
4. 본인의 도메인 입력 (예: `runningcrew.com`)
5. DNS 설정 안내에 따라 도메인 제공업체에서 설정

### 자동 배포 설정 (이미 완료됨)
- GitHub에 push할 때마다 자동으로 Vercel에 배포됩니다
- `git push origin main` → 자동 배포 트리거

---

## 🔧 문제 해결

### Supabase 연결 오류
**증상**: "데이터를 불러오는데 실패했습니다"

**해결방법**:
1. Vercel Dashboard → 프로젝트 → **"Settings"** → **"Environment Variables"**
2. `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 값 확인
3. 값이 정확한지 Supabase Dashboard에서 재확인
4. 수정했다면 **"Redeploy"** 클릭

### 빈 코스 목록
**증상**: "조건에 맞는 코스가 없습니다"

**해결방법**:
1. Supabase Dashboard → **"Table Editor"**
2. `courses` 테이블에 데이터가 있는지 확인
3. 없다면 SQL Editor에서 다시 실행:
   ```sql
   -- supabase-schema.sql의 샘플 데이터 부분만 복사하여 실행
   ```

### 신청 버튼 작동 안 함
**증상**: 신청해도 아무 반응 없음

**해결방법**:
1. 브라우저 개발자 도구 (F12) → Console 탭 확인
2. 에러 메시지 확인
3. Supabase Dashboard → **"SQL Editor"**
4. `add_participant` 함수가 생성되었는지 확인:
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_name = 'add_participant';
   ```

---

## 📞 도움이 필요하신가요?

- Supabase 문서: https://supabase.com/docs
- Vercel 문서: https://vercel.com/docs
- GitHub 이슈: https://github.com/YOUR_USERNAME/running-crew/issues

---

**작성일**: 2025-10-16
**마지막 업데이트**: 2025-10-16
