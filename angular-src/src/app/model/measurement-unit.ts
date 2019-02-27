export enum MeasurementUnit {
  ounce = "oz",
  pound = "lb",
  ton = "ton",
  gram = "g",
  kilogram = "kg",
  fluid_once = "floz",
  pint = "pt",
  quart = "qt",
  gallon = "gal",
  milliliter = "ml",
  liter = "l",
  count = "count"
}

export namespace MeasurementUnit {

  export function values() {
    return Object.keys(MeasurementUnit).filter(
      (type) => isNaN(<any>type) && type !== 'values'
    ).map(key => MeasurementUnit[key]);
  }
}
