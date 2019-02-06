export class Tuple {
    ingredient_name: string;
    quantity: number;
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
