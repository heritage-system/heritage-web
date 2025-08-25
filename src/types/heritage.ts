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
  type: "festival" | "performance" | "craft",
    isHot: boolean,
    category: string;
}

export interface HeritageSearchRequest {
  keyword?: string;

  categoryIds?: number[];
  tagIds?: number[];
  locationIds?: number[];

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
  name: string;
  code: string;
}

export interface HeritageCoordinate {
  id: number;
  latitude: number;
  longitude: number;
}

export interface HeritageSearchResponse {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  mapUrl: string;
  isFeatured: boolean;
  heritageOccurrences: HeritageOccurrence[];
  media: HeritageMedia[];
  heritageTags: string[]; 
  heritageLocations: HeritageLocation[];
  coordinates: HeritageCoordinate[];
  nameUnsigned: string;
  descriptionUnsigned: string;
}
