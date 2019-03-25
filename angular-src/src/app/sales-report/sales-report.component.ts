import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SalesDrilldownComponent } from './sales-drilldown/sales-drilldown.component';
import { SalesSummaryComponent } from './sales-summary/sales-summary.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SalesReportService } from './sales-report.service';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {

  product_lines = [];
  customers = [];

  summary_data = {};
  keys = [];
  displayedColumns: string[] = ['number', 'name', 'size', 'count', 'summary', 'drilldown'];

  constructor(private salesReportService: SalesReportService, public dialog: MatDialog) { 
    this.product_lines = ["Salad"];
    this.customers = ["SuperTarget", "Meijer"];
  }

  ngOnInit() {
  
  }

  openSummary() {
    
  }

  openDrilldown(sku_number) {
    console.log(sku_number);
    let dialogRef = this.dialog.open(SalesDrilldownComponent, {
      height: '800px',
      width: '1000px',
      data: {
        sku_number: sku_number
      }
    })
  }

  getSummary() {
    var request = {
      product_lines: this.product_lines,
      customers: this.customers
    };
    this.salesReportService.getSummary(request).subscribe(
      response => {
        this.summary_data = response;
        this.keys = Object.keys(this.summary_data);
        console.log(this.summary_data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getDrilldown() {
    // TODO @Jesse Yue / Jimmy Shackford
          // Display snackbar dialog claiming that the data is not available. Please wait a few seconds
          // to try again. Perhaps we can set an interval to try to auto run this method in a few seconds.
  }
}