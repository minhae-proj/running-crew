// UI 렌더링 로직

// 날짜 포맷팅
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
}

// 코스 카드 생성
export function createCourseCard(course) {
    const participantPercentage = (course.current_participants / course.max_participants) * 100;
    const isClosed = course.is_closed;
    const levelClass = course.level === '중급' ? 'medium' : course.level === '고급' ? 'high' : '';

    return `
        <div class="course-card ${isClosed ? 'closed' : ''}" data-id="${course.id}">
            <div class="course-basic" onclick="window.toggleCard(${course.id})">
                <div class="course-location">📍 ${course.location}</div>
                <h3 class="course-title">${course.title}</h3>

                <div class="course-info-grid">
                    <div class="course-info-item">
                        <strong>📅 일정:</strong><br>${formatDate(course.date)}
                    </div>
                    <div class="course-info-item">
                        <strong>🕐 시간:</strong><br>${course.time.substring(0, 5)}
                    </div>
                    <div class="course-info-item">
                        <strong>🏃 레벨:</strong><br>
                        <span class="badge badge-level ${levelClass}">${course.level}</span>
                    </div>
                    <div class="course-info-item">
                        <strong>📏 거리:</strong><br>${course.distance}
                    </div>
                </div>

                <div class="course-participants">
                    <div class="participants-bar">
                        <div class="participants-fill" style="width: ${participantPercentage}%"></div>
                    </div>
                    <div class="participants-text">
                        ${course.current_participants} / ${course.max_participants}명
                    </div>
                </div>

                <button class="course-toggle-btn" onclick="event.stopPropagation(); window.toggleCard(${course.id})">
                    ${isClosed ? '마감' : '자세히 보기 ▼'}
                </button>
            </div>

            <div class="course-details">
                <div class="course-details-content">
                    <div class="details-section">
                        <h3>📝 코스 설명</h3>
                        <p class="course-description">${course.description || '코스 설명이 없습니다.'}</p>
                    </div>

                    ${!isClosed ? `
                    <div class="details-section">
                        <h3>✍️ 신청하기</h3>
                        <form class="apply-form" onsubmit="window.submitApplication(event, ${course.id})">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>이름 *</label>
                                    <input type="text" name="name" required placeholder="이름을 입력하세요">
                                </div>
                                <div class="form-group">
                                    <label>연락처 *</label>
                                    <input type="tel" name="contact" required placeholder="010-1234-5678">
                                </div>
                                <div class="form-group">
                                    <label>러닝 레벨 *</label>
                                    <select name="level" required>
                                        <option value="">선택하세요</option>
                                        <option value="초급">초급</option>
                                        <option value="중급">중급</option>
                                        <option value="고급">고급</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="submit-btn">신청하기</button>
                        </form>
                    </div>
                    ` : ''}

                    <div class="details-section">
                        <h3>👥 참가 멤버 (<span id="participants-count-${course.id}">${course.current_participants}</span>명)</h3>
                        <div class="participants-list" id="participants-list-${course.id}">
                            <div class="loading">참가자 목록을 불러오는 중...</div>
                        </div>
                    </div>

                    <button class="course-toggle-btn" onclick="window.toggleCard(${course.id})">
                        접기 ▲
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 참가자 목록 렌더링
export function renderParticipants(participants, courseId) {
    const container = document.getElementById(`participants-list-${courseId}`);

    if (!participants || participants.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>아직 신청한 멤버가 없습니다.</p></div>';
        return;
    }

    container.innerHTML = participants.map(p => `
        <div class="participant-item">
            <div class="participant-avatar">${p.name.charAt(0)}</div>
            <div class="participant-info">
                <div class="participant-name">${p.name}</div>
                <div class="participant-level">${p.level}</div>
            </div>
            <div class="participant-date">${formatDate(p.joined_at.split('T')[0])} 신청</div>
        </div>
    `).join('');
}

// 로딩 상태 표시
export function showLoading(element) {
    element.innerHTML = '<div class="loading">로딩 중...</div>';
}

// 에러 메시지 표시
export function showError(element, message) {
    element.innerHTML = `<div class="error-state"><p>❌ ${message}</p></div>`;
}

// 필터 옵션 채우기
export function populateDateFilter(dates) {
    const select = document.getElementById('filter-date');
    select.innerHTML = '<option value="">전체</option>';

    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDate(date);
        select.appendChild(option);
    });
}

export function populateLocationFilter(locations) {
    const select = document.getElementById('filter-location');
    select.innerHTML = '<option value="">전체</option>';

    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        select.appendChild(option);
    });
}
