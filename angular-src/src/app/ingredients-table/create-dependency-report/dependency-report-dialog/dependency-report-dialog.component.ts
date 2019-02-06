import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-dependency-report-dialog',
  templateUrl: './dependency-report-dialog.component.html',
  styleUrls: ['./dependency-report-dialog.component.css']
})
export class DependencyReportDialogComponent {

  constructor(public dialogRef: MatDialogRef<DependencyReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ingredientList: Array<any>) { }

    onNoClick(): void {
      this.dialogRef.close();
    }


}
