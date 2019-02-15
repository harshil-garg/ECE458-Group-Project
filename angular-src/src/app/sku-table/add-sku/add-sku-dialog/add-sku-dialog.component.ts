import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Sku } from '../../../model/sku';
import { Tuple } from '../../../model/ingredient';

@Component({
  selector: 'app-add-sku-dialog',
  templateUrl: './add-sku-dialog.component.html',
  styleUrls: ['./add-sku-dialog.component.css']
})
export class AddSkuDialogComponent{

  ingredientInput: string;
  quantityInput: any;
  formValid: boolean = true;
  nameLengthValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<AddSkuDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public sku: Sku){sku.ingredient_quantity = [];}

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.sku);
    }

    validateName(form): void{
      this.nameLengthValid = this.sku.name!=null && this.sku.name.length<33;
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        if(this.ingredientInput!=null && this.ingredientInput.length>0 && this.quantityInput!=null && this.quantityInput.length>0){
          var added_ingr_quant: Tuple = {
            ingredient_name: this.ingredientInput,
            quantity: this.quantityInput
          }
          this.sku.ingredient_quantity.push(added_ingr_quant);
          this.ingredientInput = '';
          this.quantityInput = '';
        }
      }
    }

    setIngredientInput(event){
      this.ingredientInput = event;
    }

    removeIngrQuant(ingr_id){
      this.sku.ingredient_quantity.splice(ingr_id, 1);
    }

}
