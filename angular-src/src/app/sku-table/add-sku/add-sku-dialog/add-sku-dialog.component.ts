import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Sku } from '../../../model/sku';

@Component({
  selector: 'app-add-sku-dialog',
  templateUrl: './add-sku-dialog.component.html',
  styleUrls: ['./add-sku-dialog.component.css']
})
export class AddSkuDialogComponent{

  constructor(
    public dialogRef: MatDialogRef<AddSkuDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public sku: Sku){}

    onNoClick(): void {
      this.dialogRef.close();
    }

}
