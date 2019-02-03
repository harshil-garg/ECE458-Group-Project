import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ProductLineTableComponent } from '../product-line-table.component';
import { AddProductLineDialogComponent } from './add-product-line-dialog/add-product-line-dialog.component';
import { CrudProductLineService, Response } from '../crud-product-line.service';

import { ProductLine } from '../../model/product-line';

@Component({
  selector: 'app-add-product-line',
  templateUrl: './add-product-line.component.html',
  styleUrls: ['./add-product-line.component.css']
})
export class AddProductLineComponent {

    productLine: ProductLine = new ProductLine();

    constructor(public dialog: MatDialog, public productLineTableComponent: ProductLineTableComponent,
      public crudProductLineService: CrudProductLineService) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddProductLineDialogComponent, {
        height: '400px',
        width: '1400px',
        data: this.productLine
      });

      dialogRef.afterClosed().subscribe(result =>{
        this.productLine = result;
        this.add(this.productLine);
      });
    }

    add(productLine: ProductLine) {
      this.crudProductLineService.add({
          name : productLine.name
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
      this.productLineTableComponent.refresh();
    }

}
