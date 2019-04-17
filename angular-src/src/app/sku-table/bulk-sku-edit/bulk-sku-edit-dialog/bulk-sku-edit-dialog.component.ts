import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {CrudSkuService} from '../../crud-sku.service';
import {FormControl} from '@angular/forms';

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

  selectedLines = {
    some: [],
    none: [],
    all: []
  }

  constructor(public dialogRef: MatDialogRef<BulkSkuEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public selectedSkus: Array<any>, public crudSkuService: CrudSkuService) {
    this.refreshPopulate();
  }

  ngOnInit() {
  }

  refreshPopulate() {
    this.crudSkuService.bulkSkuPopulate({skus: this.selectedSkus}).subscribe((response) => {
      if (response.success) {
        console.log(response.data);
        this.data = response.data;
      }
    });
  }

  bulkEdit(add: boolean) {
    // let almost = this.selectedLines.none.slice();
    // almost.push(this.selectedLines.some.slice());
    // almost.push(this.selectedLines.all.slice());
    let lines = this.selectedLines.all.slice();
    this.selectedLines.some.forEach((line) => {
      lines.push(line);
    });
    this.selectedLines.none.forEach((line) => {
      lines.push(line);
    });
    console.log(lines);
    this.crudSkuService.bulkSkuEdit({skus: this.selectedSkus, add: add, manufacturing_lines: lines})
    .subscribe((response) => {
      if (!response.success) {
        alert(response.message);
      }
      this.refreshPopulate();
    });
  }

  onNoneSelection(e, v) {
    let newSelection = [];
    for (let x of v) {
      newSelection.push(x.value);
    }
    this.selectedLines.none = newSelection;
  }

  onSomeSelection(e, v) {
    let newSelection = [];
    for (let x of v) {
      newSelection.push(x.value);
    }
    this.selectedLines.some = newSelection;
  }
  onAllSelection(e, v) {
    let newSelection = [];
    for (let x of v) {
      console.log(x);
      newSelection.push(x.value);
    }
    this.selectedLines.all = newSelection;
  }
  nothingSelected() {
    return this.selectedLines.all.length == 0 && this.selectedLines.some.length == 0 && this.selectedLines.none.length == 0;
  }
}
