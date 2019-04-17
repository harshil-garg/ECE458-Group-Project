import { Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddIngredientDialogComponent } from './add-ingredient-dialog/add-ingredient-dialog.component';
import { CrudIngredientsService, Response } from '../crud-ingredients.service';
import { IngredientsTableComponent } from '../ingredients-table.component';
import { ResponseDialogComponent } from './response-dialog/response-dialog.component';

import { Ingredient } from '../../model/ingredient';

@Component({
  selector: 'app-add-ingredient',
  templateUrl: './add-ingredient.component.html',
  styleUrls: ['./add-ingredient.component.css']
})
export class AddIngredientComponent {

    ingredient: Ingredient = new Ingredient();
    @Input() disabled = false;

    constructor(public dialog: MatDialog, public crudIngredientsService: CrudIngredientsService,
      public ingredientsTableComponent: IngredientsTableComponent, public resultDialog: MatDialog, private snackBar: MatSnackBar) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddIngredientDialogComponent, {
        height: '800px',
        width: '500px',
        data: this.ingredient
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != null) {
          this.ingredient = result;
          console.log(this.ingredient);
          this.add(this.ingredient);
        }
      });
    }

    add(ingredient: Ingredient) {
      let parseable = this.parse_package_size(ingredient.package_size);
      if (!parseable.success) {
        this.handleResponse(parseable);
        return;
      }
      this.crudIngredientsService.add({
          name : ingredient.name,
          number : ingredient.id,
          vendor_info : ingredient.vendor_info,
          package_size: parseable["number"],
          unit: parseable["unit"],
          cost : ingredient.cost_per_package,
          comment : ingredient.comment
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    private cleanUnit(unit: string){
      let unit_regex = /\s|\./g;
      let trailing_s = /s+$/;

      unit = unit.replace(unit_regex, '');
      unit = unit.toLowerCase();
      unit = unit.replace(trailing_s, '');
      return unit
    }

    private parse_package_size(package_size: string) {
      // var units = ["oz.", "ounce", "lb", "pound", "ton", "g", "gram", "kg", "kilogram", "floz", "fluidounce", "pt", "pint", "qt", "quart", "gal", "gallon", "ml", "milliliter", "l", "liter", "ct", "count"];
      let regex = /^(\d*\.?\d+)\s*(\D.*|)$/;
      var failure = {
        success: false,
        message: "The package size was not numeric or parseable"
      }
      if (package_size) {
        console.log(package_size)
        let match = package_size.match(regex);
        console.log(match)
        let number = (match != null) ? match[1] : false;
        let unit = (match != null) ? match[2] : false;

        if(number && unit){
          unit = this.cleanUnit(unit);
          return {
            success: true,
            message: "Parsing was successful",
            number: number,
            unit: unit
          }
        }
      }
      return failure;
    }

    private handleResponse(response: Response) {
      if (!response.success) {
        this.snackBar.open(response.message, "Close", {duration:3000});
      } else {
        this.ingredientsTableComponent.refresh();
      }
    }

}
