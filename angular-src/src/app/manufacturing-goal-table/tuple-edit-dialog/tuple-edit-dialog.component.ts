import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { SkuNameQuantity } from '../../model/manufacturing-goal';
import { Sku } from '../../model/sku';

@Component({
  selector: 'app-tuple-edit-dialog',
  templateUrl: './tuple-edit-dialog.component.html',
  styleUrls: ['./tuple-edit-dialog.component.css']
})
export class TupleEditDialogComponent implements OnInit {

    tuples : Array<SkuNameQuantity> = [];
    quantityInput : string = "";
    skuInput : Sku;

    constructor(public dialogRef: MatDialogRef<TupleEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
      this.tuples = this.data.tuples;
    }

    stopPropagation(ev) {
      ev.stopPropagation();
    }

    stopSpacebar(ev){
      if(ev.keyCode==32){
        ev.stopPropagation();
      }
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        if(this.skuInput!=null && this.quantityInput!=null && this.quantityInput.length>0){
          this.addSkuQuantity();
        }
      }
    }

    addSkuQuantity(){
      var added_sku_quant: SkuNameQuantity = {
        sku: this.skuInput,
        case_quantity: +this.quantityInput
      }
      this.tuples.push(added_sku_quant);
      this.skuInput = null;
      this.quantityInput = '';
    }

    setSkuInput(event){
      this.skuInput = event;
    }

    removeIngrQuant(ingr_id:number){
      this.tuples.splice(ingr_id, 1);
    }

    updateTuples(){
      this.dialogRef.close(this.tuples);
    }
}
