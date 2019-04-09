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
  start_date: Date = new Date();
  end_date: Date = new Date();

  constructor(public dialogRef: MatDialogRef<SalesProjectionToolDialogComponent>, @Inject(MAT_DIALOG_DATA) public sku: any, public salesReportService: SalesReportService) {}

  ngOnInit() {
    this.start_date.setMonth(this.start_date.getMonth() - 3);
    this.refresh();
  }

  refresh() {
    var request = {
      sku_number: this.sku.number,
      start: this.start_date.toISOString(),
      end: this.end_date.toISOString()
    }
    this.salesReportService.getSalesProjection(request).subscribe(
      response => {
        if(!response.success){
          console.log(response);
        } else {
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
      entry.timespan = entry.start + " - " + entry.end;
      entry.sales = entry.sales.toLocaleString();
    }
    this.projection.summary.display_average = this.projection.summary.average.toLocaleString();
    this.projection.summary.display_standard_deviation = this.projection.summary.standard_deviation.toLocaleString();
  }

  onNoClick() {
    this.dialogRef.close();
  }

}
