import {Sku} from './sku'

export class SkuNameQuantity {
  sku: Sku;
  case_quantity: number;
}

export class ManufacturingGoal {
  name: string;
  user: string;
  sku_tuples: SkuNameQuantity[];
  deadline: Date;
}
