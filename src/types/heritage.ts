import {CalendarType,SortBy } from "../types/enum";

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
  categoryIds: number;
  categoryName: string;
  mapUrl: string;
  isFeatured: boolean;
  heritageOccurrences: HeritageOccurrence[];
  media: HeritageMedia[];
  heritageTags: string[]; 
  heritageTagIds: number[];
  heritageLocations: HeritageLocation[]; 
  nameUnsigned: string;
  descriptionUnsigned: string;
}


export interface HeritageDescriptionBlock {
  type: "paragraph" | "list";
  content?: string;
  items?: string[];
}
export interface HeritageDescription {
  history: HeritageDescriptionBlock[];
  rituals: HeritageDescriptionBlock[];
  values: HeritageDescriptionBlock[];
  preservation: HeritageDescriptionBlock[];
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
  mapUrl: string;
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
export interface PredictResponse {
  matches: {
    heritage_id: number;
    score: number;
    name: string | null;
    description: string | null;
    evidence: {
      score: number;
      media_id: number;
      heritage_id: number;
      url: string;
      is_video: boolean;
      frame_idx: number | null;
      note: string | null;
      meta_index: number;
    }[];
  }[];
}