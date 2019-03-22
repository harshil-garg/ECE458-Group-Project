import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Ingredient } from '../../../model/ingredient';

@Component({
  selector: 'app-add-ingredient-dialog',
  templateUrl: './add-ingredient-dialog.component.html',
  styleUrls: ['./add-ingredient-dialog.component.css']
})
export class AddIngredientDialogComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<AddIngredientDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public ingredient: Ingredient){}

    ngOnInit(){
      this.ingredient.name = "";
      this.ingredient.id = "";
      this.ingredient.vendor_info = "";
      this.ingredient.package_size = "";
      this.ingredient.cost_per_package = undefined;
      this.ingredient.comment = "";
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.ingredient);
    }

}
