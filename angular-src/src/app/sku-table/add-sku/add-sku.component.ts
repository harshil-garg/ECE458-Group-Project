import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
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

  constructor(public dialog: MatDialog, public crudSkuService: CrudSkuService,
    public skuTableComponent: SkuTableComponent) {}

  public openDialog() {
    let dialogRef = this.dialog.open(AddSkuDialogComponent, {
      height: '400px',
      width: '1400px',
      data: this.sku
    });

    dialogRef.afterClosed().subscribe(result =>{
      this.sku = result;
      this.add(this.sku);
    });
  }

  add(sku: Sku) {
    console.log(sku);
    var ingredient : Ingredient = new Ingredient();
    this.crudSkuService.add({
        name: sku.name,
        number: sku.id,
        case_upc: sku.case_upc,
        unit_upc: sku.unit_upc,
        size: sku.unit_size,
        count: sku.count_per_case,
        product_line: 'sku.product_line',
        ingredients: [[ingredient,12]],
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
    console.log(response);
    this.skuTableComponent.refresh();
  }

}
