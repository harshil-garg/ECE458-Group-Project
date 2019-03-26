import { Component, Input, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { DependencyReportDialogComponent } from './dependency-report-dialog/dependency-report-dialog.component';

@Component({
  selector: 'app-create-dependency-report',
  templateUrl: './create-dependency-report.component.html',
  styleUrls: ['./create-dependency-report.component.css']
})
export class CreateDependencyReportComponent{

  constructor(public dialog: MatDialog) {}

  @Input() sortBy: string;
  @Input() keywords: Array<any>;
  @Input() skus: Array<any>;

  onclick(){
    let dialogRef = this.dialog.open(DependencyReportDialogComponent, {
      height: '800px',
      width: '1400px',
      data: {sortBy: this.sortBy, keywords: this.keywords, skus: this.skus}
    });
  }

}
