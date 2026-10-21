/** `data` de `activity_calendar` de ZZZ: eventos con las películas que dan y las que ya tienes. */
export interface ZenlessActivityCalendarData {
  activity_list?: {
    name: string;
    start_ts: number;
    end_ts: number;
    monochrome_cnt: number;
    monochrome_got_cnt: number;
  }[];
}
