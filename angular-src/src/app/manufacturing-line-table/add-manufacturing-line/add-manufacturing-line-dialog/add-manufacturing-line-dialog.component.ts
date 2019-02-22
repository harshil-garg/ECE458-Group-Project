import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ManufacturingLine } from '../../../model/manufacturing-line';

@Component({
  selector: 'app-add-manufacturing-line-dialog',
  templateUrl: './add-manufacturing-line-dialog.component.html',
  styleUrls: ['./add-manufacturing-line-dialog.component.css']
})
export class AddManufacturingLineDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AddManufacturingLineDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public manufacturingLine: ManufacturingLine){}

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.manufacturingLine);
    }

}
