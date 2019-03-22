import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SalesDrilldownComponent } from './sales-drilldown/sales-drilldown.component';
import { SalesSummaryComponent } from './sales-summary/sales-summary.component';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    
  }

  openSummary(){
    
  }

  openDrilldown(){
    let dialogRef = this.dialog.open(SalesDrilldownComponent, {
      height: '800px',
      width: '1000px'
    })
  }

}
