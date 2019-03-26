import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {CrudManufacturingLineService} from '../../../manufacturing-line-table/crud-manufacturing-line.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Sku } from '../../../model/sku';
import { Tuple } from '../../../model/ingredient';
import { Formula } from '../../../model/formula';

@Component({
  selector: 'app-add-sku-dialog',
  templateUrl: './add-sku-dialog.component.html',
  styleUrls: ['./add-sku-dialog.component.css']
})
export class AddSkuDialogComponent implements OnInit{
  skuForm: FormGroup
  formulaForm: FormGroup

  ingredientInput: string;
  quantityInput: any;
  formValid: boolean = true;
  nameLengthValid: boolean = true;
  formula: Formula;
  manufacturingLines = [];

  constructor(
    public dialogRef: MatDialogRef<AddSkuDialogComponent>, private crudManufacturingLineService: CrudManufacturingLineService,
      @Inject(MAT_DIALOG_DATA) public sku: Sku)
      {
      }

    ngOnInit(){
      this.formula=new Formula();
      this.formula.ingredient_tuples = [];
      this.sku.id = undefined;
      this.sku.name = "";
      this.sku.case_upc = undefined;
      this.sku.unit_upc = undefined;
      this.sku.unit_size = "";
      this.sku.count_per_case = undefined;
      this.sku.product_line = "";
      this.sku.formula = this.formula;
      this.sku.formula_scale_factor = "1.0";
      this.sku.manufacturing_lines = [];
      this.sku.manufacturing_rate = "";
      this.sku.setup_cost = undefined;
      this.sku.run_cost = undefined;
      this.sku.comment = "";
      this.crudManufacturingLineService.read({
          pageNum: -1,
          page_size: 0,
          sortBy: "name"
        }).subscribe(
        response => {
          for(let manufacturingLine of response.data){
            this.manufacturingLines.push(manufacturingLine.shortname);
          }
        },
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );

      this.skuForm = new FormGroup({
        number: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        case_upc: new FormControl('', [Validators.required]),
        unit_upc: new FormControl('', [Validators.required]),
        unit_size: new FormControl('', [Validators.required]),
        count_per_case: new FormControl('', [Validators.required]),
        product_line: new FormControl('', [Validators.required]),
        formula_scale_factor: new FormControl('', [Validators.required]),
        manufacturing_lines: new FormControl('', [Validators.required]),
        manufacturing_rate: new FormControl('', [Validators.required]),
        setup_cost: new FormControl('', [Validators.required]),
        run_cost: new FormControl('', [Validators.required]),
        comment: new FormControl('')
      });
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(skuFormValue): void {
      this.dialogRef.close();
      // if (this.skuForm.valid) {
      //   let sku = {
      //     number: skuFormValue.number,
      //     name: skuFormValue.name,
      //     case_upc: skuFormValue.case_upc,
      //     unit_upc: skuFormValue.unit_upc,
      //     unit_size: skuFormValue.unit_size,
      //     count_per_case: skuFormValue.count_per_case,
      //     product_line: skuFormValue.product_line,
      //     formula_scale_factor: skuFormValue.,
      //     manufacturing_lines: skuFormValue.,
      //     manufacturing_rate: skuFormValue.,
      //     setup_cost: skuFormValue.,
      //     run_cost: skuFormValue.,
      //     comment: skuFormValue.comment
      //   }
      //   this.dialogRef.close(sku);
      // }
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        this.addIngrQuantity();
      }
    }

    addIngredientQuantity(ev){
      ev.stopPropagation();
      this.addIngrQuantity();
    }

    setManufacturingLines(manufLines){
      this.sku.manufacturing_lines = [];
      manufLines.forEach(manufLine => this.sku.manufacturing_lines.push(manufLine.value));
    }

    addIngrQuantity(){
      console.log(this.ingredientInput);
      console.log(this.quantityInput);
      if(this.ingredientInput!=null && this.ingredientInput.length>0 && this.quantityInput!=null && this.quantityInput.length>0){
        var added_ingr_quant: Tuple = {
          ingredient: this.ingredientInput,
          quantity: this.quantityInput,
          unit: "" //TODO: update this with formula editor
        }
        this.formula.ingredient_tuples.push(added_ingr_quant);
        this.ingredientInput = '';
        this.quantityInput = '';
      }
    }

    handleClick(ev) {//prevent accordion from opening when edit formula name
      ev.stopPropagation();
    }

    setIngredientInput(event){
      this.ingredientInput = event;
    }

    removeIngrQuant(ingr_id){
      this.formula.ingredient_tuples.splice(ingr_id, 1);
    }

    updateProductLine(line){
      this.sku.product_line = line;
    }

    hasSKUError = (controlName: string, errorName: string) =>{
      return this.skuForm.controls[controlName].hasError(errorName);
    }

}
