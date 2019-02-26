import { Tuple } from './ingredient'
import { Formula } from './formula'
import { ManufacturingLine } from './manufacturing-line'

export class Sku {
  id: number;
  name: string;
  case_upc: number;
  unit_upc: number;
  unit_size: string;
  count_per_case: number;
  product_line: string;
  formula: Formula;
  formula_scale_factor: string;
  manufacturing_lines: string[];
  manufacturing_rate: string;
  comment: string;
}
