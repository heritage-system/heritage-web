import { DateInfo } from '../types/doctor';

export const formatDate = (date: Date): DateInfo => {
    return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
    };
};

export const formatDateString = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const getNextDays = (count: number = 14): Date[] => {
    const today = new Date();
    return Array.from({ length: count }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i + 1);
        return date;
    });
};

export const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};