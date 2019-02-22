import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ManufacturingLineTableComponent } from '../manufacturing-line-table.component';
import { AddManufacturingLineDialogComponent } from './add-manufacturing-line-dialog/add-manufacturing-line-dialog.component';
import { CrudManufacturingLineService, Response } from '../crud-manufacturing-line.service';

import { ManufacturingLine } from '../../model/manufacturing-line';

@Component({
  selector: 'app-add-manufacturing-line',
  templateUrl: './add-manufacturing-line.component.html',
  styleUrls: ['./add-manufacturing-line.component.css']
})
export class AddManufacturingLineComponent {

    manufacturingLine: ManufacturingLine = new ManufacturingLine();

    constructor(public dialog: MatDialog, public manufacturingLineTableComponent: ManufacturingLineTableComponent,
      public crudManufacturingLineService: CrudManufacturingLineService) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddManufacturingLineDialogComponent, {
        height: '800px',
        width: '400px',
        data: this.manufacturingLine
      });

      dialogRef.afterClosed().subscribe(result =>{
        if(result!=null){
          this.manufacturingLine = result;
          this.add(this.manufacturingLine);
        }
      });
    }

    add(manufacturingLine: ManufacturingLine) {
      this.crudManufacturingLineService.add({
          name : manufacturingLine.name,
          shortname: manufacturingLine.shortname,
          comment: manufacturingLine.comment
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
        alert(response.message);
      }
      this.manufacturingLineTableComponent.refresh();
    }

}
