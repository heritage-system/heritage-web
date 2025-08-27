export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards: Ward[] | null;
}

export interface Province {
  name: string;
  code: number;
  division_type: string;
  phone_code: number;
  codename: string;
  districts: District[];
}