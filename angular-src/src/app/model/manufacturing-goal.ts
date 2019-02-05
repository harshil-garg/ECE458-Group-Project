export class SkuNameQuantity {
  sku_name: string;
  sku_quantity: number;
}

export class ManufacturingGoal {
  name: string;
  user: string;
  skus: SkuNameQuantity[];
}
