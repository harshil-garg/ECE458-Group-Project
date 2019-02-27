import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule-report',
  templateUrl: './manufacturing-schedule-report.component.html',
  styleUrls: ['./manufacturing-schedule-report.component.css']
})
export class ManufacturingScheduleReportComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ManufacturingScheduleReportComponent>){}

  ngOnInit() {
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close();
    }

}
