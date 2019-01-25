import { Ingredient } from './ingredient'

export class Sku {
  id: number;
  name: string;
  case_upc: number;
  unit_upc: number;
  unit_size: number;
  count_per_case: number;
  product_line: string;
  ingredient_quantity: Array<[Ingredient, number]>;
  comment: string;
}
