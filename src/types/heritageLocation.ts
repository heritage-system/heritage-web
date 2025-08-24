export interface CoordinateDto {
  id: number;
  latitude: number;
  longitude: number;
}

export interface LocationDto {
  id: number;
  name: string;
  code: string;
}

export interface HeritageLocationResponse {
  heritageId: number;
  name: string;
  description: string;
  coordinates: CoordinateDto[];
  locations: LocationDto[];
}
