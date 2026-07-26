export interface CreateHolidayRequest {
  name: string;
  date: string;
}

export interface CreateHolidayResponse {
  success: boolean;
  message: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
}

export interface HolidayMonthGroup {
  month: string;
  holidays: Holiday[];
}

export interface GetHolidaysListResponse {
  success: boolean;
  message: string;
  data: HolidayMonthGroup[];
}

export interface DeleteHolidayRequest {
  id: string;
}

export interface DeleteHolidayResponse {
  success: boolean;
  message: string;
}
