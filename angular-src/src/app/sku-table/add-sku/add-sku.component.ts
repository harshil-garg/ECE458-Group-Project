import { Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddSkuDialogComponent } from './add-sku-dialog/add-sku-dialog.component';
import { CrudSkuService, Response } from '../crud-sku.service';
import { SkuTableComponent } from '../sku-table.component';

import { Sku } from '../../model/sku';
import { Ingredient } from '../../model/ingredient';

@Component({
  selector: 'app-add-sku',
  templateUrl: './add-sku.component.html',
  styleUrls: ['./add-sku.component.css']
})
export class AddSkuComponent {

  sku: Sku = new Sku();
  @Input() disabled = false;

  constructor(public dialog: MatDialog, public crudSkuService: CrudSkuService,
    public skuTableComponent: SkuTableComponent, private snackBar: MatSnackBar) {}

  public openDialog() {
    let dialogRef = this.dialog.open(AddSkuDialogComponent, {
      height: '800px',
      width: '400px',
      data: this.sku
    });

    dialogRef.afterClosed().subscribe(result =>{
      console.log(result);
      if(result!=null){
        this.sku = result;
        this.add(this.sku);
      }
    });
  }

  add(sku: Sku) {
    this.crudSkuService.add({
        name: sku.name,
        number: sku.id,
        case_upc: sku.case_upc,
        unit_upc: sku.unit_upc,
        size: sku.unit_size,
        count: sku.count_per_case,
        product_line: sku.product_line,
        formula: sku.formula,
        formula_scale_factor: sku.formula_scale_factor,
        manufacturing_lines: sku.manufacturing_lines,
        manufacturing_rate: sku.manufacturing_rate,
        setup_cost: sku.setup_cost,
        run_cost: sku.run_cost,
        comment: sku.comment
      }).subscribe(
      response => this.handleResponse(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  private handleResponse(response: Response) {
    if (!response.success) {
      this.snackBar.open(response.message, "Close", {duration:3000});
    } else {
      this.skuTableComponent.refresh();
    }
    console.log(response);

  }

}
