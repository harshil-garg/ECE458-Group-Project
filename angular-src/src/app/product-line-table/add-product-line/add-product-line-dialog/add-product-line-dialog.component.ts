import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { ProductLine } from '../../../model/product-line';

@Component({
  selector: 'app-add-product-line-dialog',
  templateUrl: './add-product-line-dialog.component.html',
  styleUrls: ['./add-product-line-dialog.component.css']
})
export class AddProductLineDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddProductLineDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public productLine: ProductLine){}

    ngOnInit(){
      this.productLine.name = "";
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close(this.productLine);
    }

}
