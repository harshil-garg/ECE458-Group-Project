import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ManufacturingGoal, SkuNameQuantity } from '../../../model/manufacturing-goal';
import { SalesProjectionToolDialogComponent } from './sales-projection-tool-dialog/sales-projection-tool-dialog.component';

@Component({
  selector: 'app-add-manufacturing-goal-dialog',
  templateUrl: './add-manufacturing-goal-dialog.component.html',
  styleUrls: ['./add-manufacturing-goal-dialog.component.css']
})
export class AddManufacturingGoalDialogComponent implements OnInit {

  skuInput: any;
  quantityInput: any;

  constructor(
    public dialogRef: MatDialogRef<AddManufacturingGoalDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public manufGoal: ManufacturingGoal,
      public salesDialog: MatDialog){}

    ngOnInit(){
      this.manufGoal.sku_tuples = [];
      this.manufGoal.name = "";
      this.manufGoal.deadline = new Date();
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.manufGoal);
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        this.addSkuQuantity(event);
      }
    }

    addSkuQuantity(event){
      console.log("in here " + this.quantityInput);
      console.log(this.quantityInput.length>0);
      if(this.skuInput!=undefined && this.skuInput.name.length>0 && this.quantityInput!=undefined && this.quantityInput.length>0){
        var added_sku_quant = {
          sku: this.skuInput,
          case_quantity: this.quantityInput
        }
        this.manufGoal.sku_tuples.push(added_sku_quant);
        this.skuInput = undefined;
        this.quantityInput = '';
      }
    }

    removeSku(id){
      this.manufGoal.sku_tuples.splice(id, 1);
    }

    setSku(sku){
      console.log("SKU SET");
      console.log(sku);
      this.skuInput = sku;
    }

    openSalesProjectionToolDialog() {

      console.log(this.skuInput);

      const salesDialogRef = this.salesDialog.open(SalesProjectionToolDialogComponent, {
        width: '800px',
        data: this.skuInput
      });

      salesDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.quantityInput = result+"";
        }
      })
    }


}
