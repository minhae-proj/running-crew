// 메인 로직
import * as api from './api.js';
import * as ui from './ui.js';

let allCourses = [];
let currentExpandedId = null;

// 페이지 초기화
async function init() {
    console.log('🚀 앱 초기화 시작');

    // 로딩 상태
    const grid = document.getElementById('courses-grid');
    ui.showLoading(grid);

    try {
        // 코스 목록 조회
        const result = await api.fetchCourses();

        if (!result.success) {
            ui.showError(grid, result.error);
            return;
        }

        allCourses = result.data;
        console.log('✅ 코스 조회 완료:', allCourses.length, '개');

        // 필터 옵션 채우기
        await populateFilters();

        // 코스 렌더링
        renderCourses(allCourses);
    } catch (error) {
        console.error('❌ 초기화 오류:', error);
        ui.showError(grid, '데이터를 불러오는데 실패했습니다.');
    }
}

// 필터 옵션 채우기
async function populateFilters() {
    const datesResult = await api.fetchUniqueDates();
    const locationsResult = await api.fetchUniqueLocations();

    if (datesResult.success) {
        ui.populateDateFilter(datesResult.data);
    }

    if (locationsResult.success) {
        ui.populateLocationFilter(locationsResult.data);
    }
}

// 코스 렌더링
function renderCourses(courses) {
    const grid = document.getElementById('courses-grid');
    const countBadge = document.getElementById('courses-count');

    countBadge.textContent = `${courses.length}개`;

    if (courses.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>조건에 맞는 코스가 없습니다.</p></div>';
        return;
    }

    grid.innerHTML = courses.map(course => ui.createCourseCard(course)).join('');
}

// 필터 적용
async function applyFilters() {
    const filters = {
        date: document.getElementById('filter-date').value,
        location: document.getElementById('filter-location').value,
        level: document.getElementById('filter-level').value,
        distance: document.getElementById('filter-distance').value
    };

    console.log('🔍 필터 적용:', filters);

    const grid = document.getElementById('courses-grid');
    ui.showLoading(grid);

    const result = await api.fetchFilteredCourses(filters);

    if (result.success) {
        renderCourses(result.data);
    } else {
        ui.showError(grid, result.error);
    }
}

// 필터 초기화
function resetFilters() {
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-location').value = '';
    document.getElementById('filter-level').value = '';
    document.getElementById('filter-distance').value = '';
    renderCourses(allCourses);
}

// 카드 토글
async function toggleCard(courseId) {
    const card = document.querySelector(`[data-id="${courseId}"]`);
    const isClosed = card.classList.contains('closed');

    if (isClosed) return;

    if (currentExpandedId === courseId) {
        card.classList.remove('expanded');
        currentExpandedId = null;
    } else {
        // 다른 카드 닫기
        document.querySelectorAll('.course-card.expanded').forEach(c => {
            c.classList.remove('expanded');
        });

        card.classList.add('expanded');
        currentExpandedId = courseId;

        // 참가자 목록 로드
        await loadParticipants(courseId);

        // 부드럽게 스크롤
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// 참가자 목록 로드
async function loadParticipants(courseId) {
    console.log('👥 참가자 목록 로드:', courseId);

    const result = await api.fetchParticipants(courseId);

    if (result.success) {
        ui.renderParticipants(result.data, courseId);
    } else {
        const container = document.getElementById(`participants-list-${courseId}`);
        ui.showError(container, '참가자 목록을 불러오는데 실패했습니다.');
    }
}

// 신청 제출
async function submitApplication(event, courseId) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const contact = formData.get('contact').trim();
    const level = formData.get('level');

    console.log('📝 신청 제출:', { courseId, name, contact, level });

    // 버튼 비활성화
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '처리 중...';

    try {
        // API 호출
        const result = await api.addParticipant(courseId, name, contact, level);

        if (result.success) {
            alert(result.message);

            // 폼 초기화
            form.reset();

            // 코스 목록 새로고침
            const coursesResult = await api.fetchCourses();
            if (coursesResult.success) {
                allCourses = coursesResult.data;
                applyFilters(); // 현재 필터 유지하면서 새로고침
            }

            // 참가자 목록 새로고침
            await loadParticipants(courseId);

            // 카드 다시 확장
            setTimeout(() => {
                toggleCard(courseId);
            }, 100);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('❌ 신청 오류:', error);
        alert('신청 처리 중 오류가 발생했습니다.');
    } finally {
        // 버튼 활성화
        submitBtn.disabled = false;
        submitBtn.textContent = '신청하기';
    }
}

// 전역 함수로 등록 (HTML에서 호출)
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleCard = toggleCard;
window.submitApplication = submitApplication;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

console.log('✅ main.js 로드 완료');
