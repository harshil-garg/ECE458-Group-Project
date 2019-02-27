import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.css']
})
export class ActivityDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ActivityDialogComponent>, @Inject(MAT_DIALOG_DATA) public duration: number) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.duration);
  }
}
