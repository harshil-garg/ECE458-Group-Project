import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Formula } from '../../../model/formula';
import { Tuple } from '../../../model/ingredient';

@Component({
  selector: 'app-add-formula-dialog',
  templateUrl: './add-formula-dialog.component.html',
  styleUrls: ['./add-formula-dialog.component.css']
})
export class AddFormulaDialogComponent implements OnInit {
  formulaForm: FormGroup;
  tupleForm: FormGroup;
  ingredient_tuples: Array<Tuple> = [];

  constructor(public dialogRef: MatDialogRef<AddFormulaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public formula: Formula) { }

  ngOnInit() {
    this.formulaForm = new FormGroup({
      number: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      comment: new FormControl('')
    });

    this.tupleForm = new FormGroup({
      ingredient: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required]),
      unit: new FormControl('', [Validators.required])
    })
  }

  

  submit(formulaFormValue): void {
    if (this.formulaForm.valid) {
      let formula = {
        number: formulaFormValue.number,
        name: formulaFormValue.name,
        comment: formulaFormValue.comment,
        ingredient_tuples: this.ingredient_tuples
      }
      this.dialogRef.close(formula);
    }
  }

  hasFormulaError = (controlName: string, errorName: string) =>{
    return this.formulaForm.controls[controlName].hasError(errorName);
  }

  hasTupleError = (controlName: string, errorName: string) =>{
    return this.tupleForm.controls[controlName].hasError(errorName);
  }

  setIngredientInput(input: string){
    this.tupleForm.setValue({ingredient: input, quantity: '', unit: ''});
  }

  addTuple(tupleFormValue){
    if (this.tupleForm.valid) {
      let tuple = {
        ingredient: tupleFormValue.ingredient,
        quantity: tupleFormValue.quantity,
        unit: tupleFormValue.unit
      }
      this.ingredient_tuples.push(tuple);
    } 
  }

  removeIngrQuant(ingr_id){
    this.ingredient_tuples.splice(ingr_id, 1);
  }

}
