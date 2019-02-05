export class SkuNameQuantity {
  sku_name: string;
  case_quantity: number;
}

export class ManufacturingGoal {
  name: string;
  user: string;
  skus: SkuNameQuantity[];
}
