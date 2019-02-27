import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { CrudManufacturingLineService } from '../../manufacturing-line-table/crud-manufacturing-line.service';

@Component({
  selector: 'app-manufacturing-schedule-report',
  templateUrl: './manufacturing-schedule-report.component.html',
  styleUrls: ['./manufacturing-schedule-report.component.css']
})
export class ManufacturingScheduleReportComponent implements OnInit {
  summationData = [];

  constructor(
    public dialogRef: MatDialogRef<ManufacturingScheduleReportComponent>, @Inject(MAT_DIALOG_DATA) public activities: Array<any>, private crudManufacturingLineService: CrudManufacturingLineService){}

    ngOnInit() {
      var t = [];
      for (let i of this.activities) {
        t.push(String(i.id));
      }
      this.crudManufacturingLineService.getManufacturingScheduleSummation({
        manufacturing_tasks: t
      }).subscribe(response => {
        if (response.success) {
          console.log(response.data);
          this.summationData = [];
          for(var k in response.data) {
            console.log("k is " + k);
            console.log(response.data[k]);
            this.summationData.push({
              name: k,
              unit_value: response.data[k].unit_value,
              unit: response.data[k].unit,
              package_value: response.data[k].package_value
            });
          }
          console.log(this.summationData);
        }
      }, err => {
        console.log("The data failed to load.");
      });
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close();
    }

}
