export enum MeasurementUnit {
  oz = "oz",
  ounce = "ounce",
  lb = "lb",
  pound = "pound",
  ton = "ton",
  g = "g",
  gram = "gram",
  kg = "kg",
  kilogram = "kilogram",
  floz = "floz",
  fluidounce = "fluidounce",
  pt = "pt",
  pint = "pint",
  qt = "qt",
  quart = "quart",
  gal = "gal",
  gallon = "gallon",
  ml = "ml",
  milliliter = "milliliter",
  l = "l",
  liter = "liter",
  ct = "ct",
  count = "count"
}

export namespace MeasurementUnit {

  export function values() {
    return Object.keys(MeasurementUnit).filter(
      (type) => isNaN(<any>type) && type !== 'values'
    ).map(key => MeasurementUnit[key]);
  }
}
