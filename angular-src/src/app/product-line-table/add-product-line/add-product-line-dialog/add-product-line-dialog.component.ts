import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ProductLine } from '../../../model/product-line';

@Component({
  selector: 'app-add-product-line-dialog',
  templateUrl: './add-product-line-dialog.component.html',
  styleUrls: ['./add-product-line-dialog.component.css']
})
export class AddProductLineDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AddProductLineDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public productLine: ProductLine){}

    onNoClick(): void {
      this.dialogRef.close();
    }

}
