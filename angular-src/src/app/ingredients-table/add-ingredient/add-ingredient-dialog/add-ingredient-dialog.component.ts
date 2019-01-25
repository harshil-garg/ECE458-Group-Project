import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Ingredient } from '../../../ingredient'

@Component({
  selector: 'app-add-ingredient-dialog',
  templateUrl: './add-ingredient-dialog.component.html',
  styleUrls: ['./add-ingredient-dialog.component.css']
})
export class AddIngredientDialogComponent{

  constructor(
    public dialogRef: MatDialogRef<AddIngredientDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public ingredient: Ingredient){}

    onNoClick(): void {
      this.dialogRef.close();
    }

}
