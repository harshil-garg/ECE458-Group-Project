import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
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

    constructor(public dialog: MatDialog, public crudIngredientsService: CrudIngredientsService,
      public ingredientsTableComponent: IngredientsTableComponent, public resultDialog: MatDialog) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddIngredientDialogComponent, {
        height: '800px',
        width: '400px',
        data: this.ingredient
      });

      dialogRef.afterClosed().subscribe(result =>{
        if(result!=null){
          this.ingredient = result;
          this.add(this.ingredient);
        }
      });
    }

    add(ingredient: Ingredient) {
      this.crudIngredientsService.add({
          name : ingredient.name,
          number : ingredient.id,
          vendor_info : ingredient.vendor_info,
          package_size: ingredient.package_size,
          cost : ingredient.cost_per_package*1,
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

    private handleResponse(response: Response) {
      if (!response.success) {
        let dialogRef = this.resultDialog.open(ResponseDialogComponent, {
          height: '300px',
          width: '300px',
          data: response
        });
        dialogRef.afterClosed().subscribe(result => {
        })
      } else {
        this.ingredientsTableComponent.refresh();
      }
    }

}
