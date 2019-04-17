import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import {BulkSkuEditDialogComponent} from './bulk-sku-edit-dialog/bulk-sku-edit-dialog.component'
import { SkuTableComponent } from '../sku-table.component';

@Component({
  selector: 'app-bulk-sku-edit',
  templateUrl: './bulk-sku-edit.component.html',
  styleUrls: ['./bulk-sku-edit.component.css']
})
export class BulkSkuEditComponent implements OnInit {
  @Input() selectedSkus: Array<any>;
  @Input() disabled = false;

  constructor(public matDialog: MatDialog, private skuTableComponent: SkuTableComponent) { }

  ngOnInit() {
  }

  openDialog() {
    let data = [];
    this.selectedSkus.forEach((selection) => {
      data.push(selection.id);
    })

    let dialogRef = this.matDialog.open(BulkSkuEditDialogComponent, {
      height: '800px',
      width: '800px',
      data: data
    })

    dialogRef.afterClosed().subscribe(result =>{
      this.skuTableComponent.refresh();
    });
  }
}
