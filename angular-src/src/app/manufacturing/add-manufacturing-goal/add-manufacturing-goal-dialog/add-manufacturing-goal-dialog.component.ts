import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ManufacturingGoal, SkuNameQuantity } from '../../../model/manufacturing-goal';

@Component({
  selector: 'app-add-manufacturing-goal-dialog',
  templateUrl: './add-manufacturing-goal-dialog.component.html',
  styleUrls: ['./add-manufacturing-goal-dialog.component.css']
})
export class AddManufacturingGoalDialogComponent {

  skuInput: string;
  quantityInput: any;

  constructor(
    public dialogRef: MatDialogRef<AddManufacturingGoalDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public manufGoal: ManufacturingGoal){this.manufGoal.skus = [];}

    onNoClick(): void {
      this.dialogRef.close();
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        if(this.skuInput!=null && this.skuInput.length>0 && this.quantityInput!=null && this.quantityInput.length>0){
          var added_sku_quant: SkuNameQuantity = {
            sku_name: this.skuInput,
            case_quantity: this.quantityInput
          }
          this.manufGoal.skus.push(added_sku_quant);
          this.skuInput = '';
          this.quantityInput = '';
        }
      }
    }

    removeSku(id){
      this.manufGoal.skus.splice(id, 1);
    }


}
