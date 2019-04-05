import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { Formula } from '../../model/formula';
import { Tuple } from '../../model/ingredient';
import { MeasurementUnit } from '../../model/measurement-unit'

@Component({
  selector: 'app-formula-edit-dialog',
  templateUrl: './formula-edit-dialog.component.html',
  styleUrls: ['./formula-edit-dialog.component.css']
})
export class FormulaEditDialogComponent implements OnInit {

  measUnits : Array<string>;
  formula : Formula = new Formula();
  quantityInput : string = "";
  ingredientInput : string = "";
  unitInput : string = "";

  constructor(public dialogRef: MatDialogRef<FormulaEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.formula = this.data.formula;
    this.measUnits = MeasurementUnit.values();
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
      if(this.ingredientInput!=null && this.ingredientInput.length>0 && this.quantityInput!=null && this.quantityInput.length>0){
        this.addIngredientQuantity();
      }
    }
  }

  addIngredientQuantity(){
    var added_ingr_quant: Tuple = {
      ingredient: this.ingredientInput,
      quantity: +this.quantityInput,
      unit: this.unitInput
    }
    this.formula.ingredient_tuples.push(added_ingr_quant);
    this.ingredientInput = '';
    this.quantityInput = '';
  }

  setIngredientInput(event){
    this.ingredientInput = event;
  }

  removeIngrQuant(ingr_id:number){
    this.formula.ingredient_tuples.splice(ingr_id, 1);
  }

  updateFormula(){
    this.dialogRef.close(this.formula);
  }

  updateUnit(ev){
    this.unitInput = ev.unit;
    this.quantityInput = ev.quantity;
  }

  formulaChange(ev){
    this.formula = ev;
  }

}
