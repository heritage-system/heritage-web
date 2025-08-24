export interface PageResponse<T> {
    currentPages: number,
    pageSizes: number,
    totalPages: number,
    totalElements: number,
    items: T[]
}