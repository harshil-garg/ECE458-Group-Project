import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SalesDrilldownComponent } from './sales-drilldown/sales-drilldown.component';
import { SalesSummaryComponent } from './sales-summary/sales-summary.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SalesReportService } from './sales-report.service';
import { CrudProductLineService } from '../product-line-table/crud-product-line.service';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {

  product_lines = [];
  customers = [];
  all = "all";

  summary_data = {};
  keys = [];
  displayedColumns: string[] = ['number', 'name', 'size', 'count', 'summary', 'drilldown'];

  constructor(private salesReportService: SalesReportService, public dialog: MatDialog, public productLineService: CrudProductLineService) { 
  }

  ngOnInit() {
    this.salesReportService.allCustomers().subscribe((response) => {
      let customer_objs = response.data;
      this.customers = [];
      for(let obj of customer_objs){
        this.customers.push(obj.name);
      }
    });
    this.refresh();
  }


  openSummary(sku) {
    this.dialog.open(SalesSummaryComponent, {
      height: '800px',
      width: '1400px',
      data: {
        sku: sku
      }
    })
  }

  openDrilldown(sku) {
    console.log(sku);
    let dialogRef = this.dialog.open(SalesDrilldownComponent, {
      height: '800px',
      width: '1000px',
      data: {
        sku: sku,
        customers: this.customers
      }
    })
  }

  refresh() {
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

  refreshCustomer(customer){
    if(customer == 'all'){
      this.salesReportService.allCustomers().subscribe((response) => {
        this.customers = [];
        for(let obj of response.data){
          this.customers.push(obj.name);
        }
      });
    }else{
      this.customers = [customer];
    }
    this.refresh();
  }

  refreshProductLines(line){
    this.product_lines.push(line);
    this.refresh();
  }

  removeProductLine(id){
    this.product_lines.splice(id, 1);
    this.refresh();
  }

  addAllProductLines(){
    this.productLineService.read({pageNum: -1, page_size: 0}).subscribe((response) => {
      this.product_lines = [];
      for(let obj of response.data){
        this.product_lines.push(obj.name);
      }
      this.refresh();
    })
  }
}
