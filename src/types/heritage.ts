import {CalendarType,SortBy, MediaType, OccurrenceType,FestivalFrequency } from "../types/enum";

export interface Heritage {
  id: number;
  name: string;
  lat: number;
  lng: number;
  image: string;
  description: string;
  location: string;
  date: string;
  rating: number;
  views: number;
  comments?: number;
  hasVR?: boolean;
  trending?: boolean;
  type: "festival" | "performance",
    isHot: boolean,
    category: string;
}

export interface HeritageSearchRequest {
  keyword?: string;

  categoryIds?: number[];
  tagIds?: number[];
  locations?: string[];

  lat?: number;
  lng?: number;
  radius?: number;

  startDay?: number;
  startMonth?: number;
  endDay?: number;
  endMonth?: number;

  calendarType?: CalendarType; 
  sortBy?: SortBy;            

  page?: number;
  pageSize?: number;
}


export interface HeritageOccurrence {
  id: number;
  occurrenceTypeName: string; 
  calendarTypeName: string;   
  startDay: number;
  startMonth: number;
  endDay: number;
  endMonth: number;
  frequencyName: string;      
  description: string;
}

export interface HeritageMedia {
  id: number;
  mediaTypeName: string; 
  url: string;
  description: string;
}

export interface HeritageTag {
  id: number;
  name: string;
}

export interface HeritageLocation {
  id: number;
  province: string,
  district: string,
  ward: string,
  addressDetail: string,
  latitude: number;
  longitude: number;  
}


export interface HeritageSearchResponse {
  id: number;
  name: string;
  description: string;
  content: string;
  categoryName: string;
  isSave: boolean;
  isFeatured: boolean;
  heritageOccurrences: HeritageOccurrence[];
  media: HeritageMedia;
  heritageTags: string[]; 
  heritageTagIds: number[];
  heritageLocations: HeritageLocation[];   
}

export interface HeritageDetailResponse {
  id: number;
  name: string;
  description: string;
  content: string;
  categoryIds: number;
  categoryName: string;
  isSave: boolean;
  isFeatured: boolean;
  heritageOccurrences: HeritageOccurrence[];
  media: HeritageMedia[];
  heritageTags: string[]; 
  heritageTagIds: number[];
  heritageLocations: HeritageLocation[]; 
}


export interface HeritageDescriptionBlock {
  Type: "paragraph" | "list";
  Content?: string;
  Items?: string[];
}
export interface HeritageDescription {
  History: HeritageDescriptionBlock[];
  Rituals: HeritageDescriptionBlock[];
  Values: HeritageDescriptionBlock[];
  Preservation: HeritageDescriptionBlock[];
}

export interface HeritageAdmin {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  mapUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  description: string;
  media: { id: number; url: string; mediaType: string }[];
  tags: any[];
  locations: any[];
  occurrences: any[];
}

export interface HeritageApiResponse {
  currentPages: number;
  pageSizes: number;
  totalPages: number;
  totalElements: number;
  items: HeritageAdmin[];
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  loading?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}


export interface HeritageDetail {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  isSave: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  media: { id: number; url: string; mediaType: string }[];
  tags: { id: number; name: string }[];
  locations: {
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
    latitude: number;
    longitude: number;
  }[];
  occurrences: {
    id: number;
    occurrenceType: string;
    calendarType: string;
    startDay: number;
    startMonth: number;
    endDay: number;
    endMonth: number;
    frequency: string;
    description: string;
  }[];
}

export interface HeritageName {
  id: number;
  name: string;
  nameUnsigned: string;
}

export interface ContributionHeritageTag {
  heritageId: number;
  heritageName: string;
  count: number
}


export interface ContentBlock {
  type: string;
  content?: string;
  items?: string[];
}

export interface HeritageContentRequest {
  history: ContentBlock[];
  rituals: ContentBlock[];
  values: ContentBlock[];
  preservation: ContentBlock[];
}

export interface MediaRequest {
  url: string;
  mediaType: MediaType; 
  description?: string;
}

export interface LocationRequest {
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  latitude: number;
  longitude: number;
}

export interface OccurrenceRequest {
  occurrenceType: OccurrenceType;   
  calendarType?: CalendarType;   
  startDay?: number;
  startMonth?: number;
  endDay?: number;
  endMonth?: number;
  frequency?: FestivalFrequency;     
  recurrenceRule?: string;
  description?: string;
}


export interface HeritageCreateRequest {
  name: string;
  description: string;
  content: HeritageContentRequest;
  categoryId: number;
  media: MediaRequest[];
  tagIds?: number[];
  locations?: LocationRequest[];
  occurrences: OccurrenceRequest[];
}

export interface HeritageCreateResponse {
  id: number
  name: string;
}


export interface HeritageRelatedResponse {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  media: HeritageMedia;
  heritageTags: string[]; 
  heritageLocations: HeritageLocation[];   
}

export interface HeritageRelatedRequest {
  keyword?: string;
  categoryIds?: number;
  tagIds?: number[];
  locations?: string[];
  heritageId: number;
  quantity?: number;
}

export interface HeritageUpdateRequest {
  id: number;
  name: string;
  description: string;
  content: HeritageContentRequest;
  categoryId: number;
  media: MediaRequest[];
  tagIds?: number[];
  locations?: LocationRequest[];
  occurrences: OccurrenceRequest[];
}

export interface HeritageOverviewSearchRequest {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: number;
  tagIds?: number[];
  sortBy?: SortBy;
}

export interface HeritageResponse {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  mapUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
  media: HeritageMedia[];
  tags: HeritageTag[];
  locations: HeritageLocation[];
  occurrences: HeritageOccurrence[];
  content: string;
  contentBlocks?: ContentBlock[];
}
