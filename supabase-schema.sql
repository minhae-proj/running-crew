-- 러닝 크루 모집 프로젝트 - Supabase 스키마
-- 작성일: 2025-10-16

-- 1. courses (코스) 테이블 생성
CREATE TABLE IF NOT EXISTS courses (
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

-- 2. participants (참가자) 테이블 생성
CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  level VARCHAR(20) NOT NULL CHECK (level IN ('초급', '중급', '고급')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 방지: 같은 코스에 같은 이름 중복 불가
  UNIQUE(course_id, name)
);

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_courses_date ON courses(date);
CREATE INDEX IF NOT EXISTS idx_courses_location ON courses(location);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_participants_course_id ON participants(course_id);

-- 4. 뷰 생성: 코스 + 참가자 수
CREATE OR REPLACE VIEW courses_with_count AS
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

-- 5. Row Level Security (RLS) 설정

-- courses 테이블: 모든 사용자가 읽기 가능
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read courses" ON courses;
CREATE POLICY "Anyone can read courses"
ON courses FOR SELECT
TO public
USING (true);

-- participants 테이블: 모든 사용자가 읽기 가능, 추가 가능
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read participants" ON participants;
CREATE POLICY "Anyone can read participants"
ON participants FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Anyone can insert participants" ON participants;
CREATE POLICY "Anyone can insert participants"
ON participants FOR INSERT
TO public
WITH CHECK (true);

-- 6. 함수 생성: 참가자 추가 (인원 제한 체크)
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
  GROUP BY c.id, c.max_participants;

  -- 코스가 없는 경우
  IF v_max_participants IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', '존재하지 않는 코스입니다.'
    );
  END IF;

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
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', '오류가 발생했습니다: ' || SQLERRM
    );
END;
$$;

-- 7. 샘플 데이터 입력
INSERT INTO courses (title, location, date, time, level, distance, max_participants, description)
VALUES
  ('한강 여의도 아침 러닝', '여의도', '2025-10-18', '07:00', '초급', '5km', 10,
   '초보자도 편하게 달릴 수 있는 평탄한 코스입니다. 여의도 공원을 한 바퀴 도는 루트로 아침 공기를 마시며 가볍게 달리기 좋습니다.'),

  ('올림픽공원 주말 러닝', '올림픽공원', '2025-10-19', '06:00', '중급', '10km', 15,
   '올림픽공원의 넓은 코스를 활용한 중급자용 러닝입니다. 약간의 언덕이 있어 체력 향상에 좋습니다.'),

  ('탄천 고급 러너 코스', '탄천', '2025-10-20', '19:00', '고급', '15km', 8,
   '탄천 종주 코스로 장거리 러닝에 도전하는 고급 러너를 위한 코스입니다.'),

  ('반포 저녁 러닝', '반포', '2025-10-21', '20:00', '초급', '3km', 10,
   '퇴근 후 가볍게 달리기 좋은 짧은 코스입니다. 반포한강공원의 야경을 즐기며 달릴 수 있습니다.'),

  ('뚝섬 아침 러닝', '뚝섬', '2025-10-22', '07:00', '중급', '7km', 12,
   '뚝섬한강공원의 아름다운 코스를 따라 달리는 중급 러닝입니다.'),

  ('망원 주말 러닝', '망원', '2025-10-23', '06:00', '초급', '5km', 10,
   '망원한강공원에서 여유롭게 달리는 초급 코스입니다.'),

  ('잠실 석촌호수 러닝', '잠실', '2025-10-24', '19:00', '초급', '3km', 8,
   '석촌호수를 한 바퀴 도는 편안한 코스입니다.'),

  ('서울숲 자연 러닝', '서울숲', '2025-10-25', '07:00', '중급', '7km', 12,
   '서울숲 공원을 중심으로 자연을 느끼며 달리는 코스입니다.');

-- 8. 샘플 참가자 데이터
INSERT INTO participants (course_id, name, contact, level)
VALUES
  (2, '김철수', '010-1234-5678', '중급'),
  (2, '이영희', '010-2345-6789', '중급'),
  (5, '박민수', '010-3456-7890', '중급');

-- 완료 메시지
SELECT '✅ Supabase 스키마 생성 완료!' as message;
SELECT 'courses 테이블: ' || COUNT(*) || '개 코스' as courses FROM courses;
SELECT 'participants 테이블: ' || COUNT(*) || '명 참가자' as participants FROM participants;
