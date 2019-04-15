import { Sku } from './sku';

export class Activity {
  sku: Sku;
  manufacturing_goal: string;
  duration: number;
  committed?: boolean;
}
