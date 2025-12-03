import {PremiumType,SortBy, PanoramaStatus} from "../types/enum";
import { HeritageLocation} from "../types/heritage";
import {SubscriptionDto} from "./subscription"

export interface PanoramaTourSearchRequest {
    keyword?: string; 
    categoryIds?: number[];    
    sortBy?: SortBy;             
    page?: number;
    pageSize?: number;
}

export interface PanoramaTourSearchResponse {
    id: number,
    heritageId: number,
    heritageName: string,
    name: string,
    thumbnailUrl: string,
    description: string,
    status: number,
    premiumType: number,
    heritageLocations: HeritageLocation[],
    numberOfScenes: number 
}

export interface PanoramaTourSearchForAdminResponse {
    id: number,
    heritageId: number,
    heritageName: string,
    name: string,
    status: number,
    premiumType: number,  
    numberOfScenes: number,
    createdAt: string;
    updatedAt: string;
}

export interface PanoramaTourDetailResponse {
    id: number,
    heritageId: number,
    heritageName: string,
    name: string,
    description: string,
    status: number,
    premiumType: number,  
    scenes: PanoramaSceneResponse[], 
    subscription: SubscriptionDto;
}

export interface PanoramaTourDetailForAdminResponse {
    id: number,
    heritageId: number,
    heritageName: string,
    name: string,
    thumbnailUrl: string,
    description: string,
    status: number,
    premiumType: number,
    scenes: PanoramaSceneResponse[], 
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PanoramaSceneResponse {  
    id: number,
    panoramaTourId: number,
    sceneName: string,
    sceneThumbnail: string,
    panoramaUrl?: string,
    description: string,
    status: number,
    premiumType: number    
}


export interface PanoramaTourCreationRequest {  
    heritageId?: number,
    name: string,
    thumbnailUrl: string,
    premiumType: PremiumType,
    description?: string,
    status: PanoramaStatus,
    scenes: PanoramaSceneCreationRequest[]  
}

export interface PanoramaSceneCreationRequest {  
    panoramaTourId?: number,
    sceneName: string,
    sceneThumbnail: string,
    panoramaUrl: string,
    description?: string,
    status: PanoramaStatus,
    premiumType: PremiumType
}

export interface TempScene {
  tempId?: string;
  sceneName: string;
  sceneThumbnail: string;
  panoramaUrl: string;
  description?: string;
  status: number;
  premiumType: number;

  thumbnailMode?: "url" | "file";
  localSceneThumbnail?: File | null;

  id?: number; 
  panoramaTourId?: number;
}