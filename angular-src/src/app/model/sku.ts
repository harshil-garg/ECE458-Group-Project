import { Tuple } from './ingredient'

export class Sku {
  id: number;
  name: string;
  case_upc: number;
  unit_upc: number;
  unit_size: string;
  count_per_case: number;
  product_line: string;
  ingredient_quantity: Tuple[];
  comment: string;
}
