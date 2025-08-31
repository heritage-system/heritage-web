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
