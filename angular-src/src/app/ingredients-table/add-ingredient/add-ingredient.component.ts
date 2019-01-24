import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AddIngredientDialogComponent } from './add-ingredient-dialog/add-ingredient-dialog.component';
import { AddIngredientService } from './add-ingredient.service';

import { Ingredient } from '../../ingredient';

@Component({
  selector: 'app-add-ingredient',
  templateUrl: './add-ingredient.component.html',
  styleUrls: ['./add-ingredient.component.css']
})
export class AddIngredientComponent {

    ingredient: Ingredient = new Ingredient();

    constructor(public dialog: MatDialog, public addIngredientService: AddIngredientService) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddIngredientDialogComponent, {
        height: '400px',
        width: '1400px',
        data: this.ingredient
      });

      dialogRef.afterClosed().subscribe(result =>{
        this.ingredient = result;
      });
    }

}
