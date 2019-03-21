import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ManufacturingLine } from '../../../model/manufacturing-line';

@Component({
  selector: 'app-add-manufacturing-line-dialog',
  templateUrl: './add-manufacturing-line-dialog.component.html',
  styleUrls: ['./add-manufacturing-line-dialog.component.css']
})
export class AddManufacturingLineDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddManufacturingLineDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public manufacturingLine: ManufacturingLine){}

    ngOnInit(){
      this.manufacturingLine.name = "";
      this.manufacturingLine.shortname = "";
      this.manufacturingLine.comment = "";
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.manufacturingLine);
    }

}
