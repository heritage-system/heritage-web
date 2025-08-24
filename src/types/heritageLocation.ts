export interface CoordinateDto {
  latitude: number;
  longitude: number;
}

export interface LocationDto {
  locationId: number;
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
