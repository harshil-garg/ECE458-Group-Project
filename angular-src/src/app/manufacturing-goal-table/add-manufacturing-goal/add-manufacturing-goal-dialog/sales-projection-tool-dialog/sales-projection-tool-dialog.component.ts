import { Component, OnInit, Inject } from '@angular/core';
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SalesReportService } from '../../../../sales-report/sales-report.service';

@Component({
  selector: 'app-sales-projection-tool-dialog',
  templateUrl: './sales-projection-tool-dialog.component.html',
  styleUrls: ['./sales-projection-tool-dialog.component.css']
})
export class SalesProjectionToolDialogComponent implements OnInit {

  projection: any = {
    sku_yearly_data: [],
    summary: {}
  };
  displayedColumns = ['timespan', 'sales'];
  summaryDisplayedColumns = ['average', 'standard_deviation']

  constructor(public dialogRef: MatDialogRef<SalesProjectionToolDialogComponent>, @Inject(MAT_DIALOG_DATA) public sku: any, public salesReportService: SalesReportService) {}

  ngOnInit() {
    var request = {
      sku_number: this.sku.number,
      start: '2019-01-01T00:00:00.000Z',
      end: '2019-03-01T00:00:00.000Z'
    }
    this.salesReportService.getSalesProjection(request).subscribe(
      response => {
        if(!response.success){
          //this.dialogRef.updateSize('600px', '200px')
        } else {
          console.log(response);
          this.projection = response;
          this.formatData();
        }
      }, 
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  formatData() {
    for (let entry of this.projection.sku_yearly_data) {
      /*let timespan = entry.timespan;
      let start = timespan.split(" ")[0].trim();
      console.log(`The start is ${start}`);
      let start_utc = new Date(start).toUTCString();
      let end = timespan.split(" ")[2].trim();
      console.log(`The end is ${end}`);
      let end_utc = new Date(end).toUTCString();
      let start_formatted = (new Date(start_utc).getMonth() + 1) + "/" + new Date(start_utc).getDate() + "/" + new Date(start_utc).getFullYear();
      let end_formatted = (new Date(end_utc).getMonth() + 1) + "/" + new Date(end_utc).getDate() + "/" + new Date(end_utc).getFullYear();*/
      entry.timespan = entry.start + " - " + entry.end;
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
