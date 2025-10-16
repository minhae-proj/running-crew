// API 호출 로직
import { supabase } from './config.js';

// 코스 목록 조회
export async function fetchCourses() {
    try {
        const { data, error } = await supabase
            .from('courses_with_count')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('코스 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 특정 코스의 참가자 목록 조회
export async function fetchParticipants(courseId) {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('course_id', courseId)
            .order('joined_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('참가자 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 참가자 추가 (RPC 함수 호출)
export async function addParticipant(courseId, name, contact, level) {
    try {
        const { data, error } = await supabase.rpc('add_participant', {
            p_course_id: courseId,
            p_name: name,
            p_contact: contact,
            p_level: level
        });

        if (error) throw error;
        return data; // { success: true/false, message: '...' }
    } catch (error) {
        console.error('참가자 추가 오류:', error);
        return {
            success: false,
            message: '오류가 발생했습니다: ' + error.message
        };
    }
}

// 필터링된 코스 조회
export async function fetchFilteredCourses(filters) {
    try {
        let query = supabase
            .from('courses_with_count')
            .select('*');

        // 필터 적용
        if (filters.date) {
            query = query.eq('date', filters.date);
        }
        if (filters.location) {
            query = query.eq('location', filters.location);
        }
        if (filters.level) {
            query = query.eq('level', filters.level);
        }
        if (filters.distance) {
            query = query.eq('distance', filters.distance);
        }

        query = query.order('date', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('필터링된 코스 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 고유한 날짜 목록 조회
export async function fetchUniqueDates() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('date')
            .order('date', { ascending: true });

        if (error) throw error;

        // 중복 제거
        const uniqueDates = [...new Set(data.map(item => item.date))];
        return { success: true, data: uniqueDates };
    } catch (error) {
        console.error('날짜 목록 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

// 고유한 장소 목록 조회
export async function fetchUniqueLocations() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('location')
            .order('location', { ascending: true });

        if (error) throw error;

        // 중복 제거
        const uniqueLocations = [...new Set(data.map(item => item.location))];
        return { success: true, data: uniqueLocations };
    } catch (error) {
        console.error('장소 목록 조회 오류:', error);
        return { success: false, error: error.message };
    }
}
