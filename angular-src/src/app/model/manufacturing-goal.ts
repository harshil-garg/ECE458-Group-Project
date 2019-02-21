export class SkuNameQuantity {
  sku: string;
  case_quantity: number;
}

export class ManufacturingGoal {
  name: string;
  user: string;
  sku_tuples: SkuNameQuantity[];
  deadline: Date;
}
