import { Activity } from './activity'

export class ManufacturingScheduleEvent {
  activity: Activity;
  manufacturing_line: string;
  start_date: Date;
  duration: number;
  duration_override: boolean;
}
