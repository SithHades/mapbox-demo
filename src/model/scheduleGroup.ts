import { Schedule } from './schedule';

export interface ScheduleGroup {
  method: 'cycling' | 'driving' | 'publicTransport' | 'walking';
  toOffice: boolean;
  schedules: Schedule[];
}
