import { MeasurementUnit } from './measurement-unit'

export class Tuple {
    ingredient_name: string;
    quantity: number;
}

export class NumberUnit {
  number: number;
  unit: MeasurementUnit;
}

export class Ingredient {
  id: string;
  name: string;
  vendor_info: string;
  package_size: string;
  cost_per_package: number;
  skus: [Tuple];
  comment: string;
}
