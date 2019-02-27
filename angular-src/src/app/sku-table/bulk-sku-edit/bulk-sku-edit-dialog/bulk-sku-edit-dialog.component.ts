import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {CrudSkuService} from '../../crud-sku.service';

@Component({
  selector: 'app-bulk-sku-edit-dialog',
  templateUrl: './bulk-sku-edit-dialog.component.html',
  styleUrls: ['./bulk-sku-edit-dialog.component.css']
})
export class BulkSkuEditDialogComponent implements OnInit {
  data = {
    some: [],
    none: [],
    all: []
  };

  constructor(public dialogRef: MatDialogRef<BulkSkuEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public selectedSkus: Array<any>, public crudSkuService: CrudSkuService) {
    this.refreshPopulate();
  }

  ngOnInit() {
  }

  refreshPopulate() {
    this.crudSkuService.bulkSkuPopulate({skus: this.selectedSkus}).subscribe((response) => {
      if (response.success) {
        console.log(this.selectedSkus);
        this.data = response.data;
      }
    });
  }

  bulkEdit(selectedLines: Array<any>, add: boolean) {
    this.crudSkuService.bulkSkuEdit({skus: this.selectedSkus, add: add, manufacturing_lines: selectedLines}).subscribe((response) => {
      if (!response.success) {
        alert('This operation failed');
      }
      this.refreshPopulate();
    });
  }
}
