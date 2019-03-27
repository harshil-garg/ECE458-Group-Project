import { Component, OnInit, Input, Output, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatSnackBar, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { Sku } from '../../model/sku';
import { SalesRecord } from '../../model/sales-record';
import { SalesReportService, DrilldownRequest } from '../sales-report.service';
import { ExportService } from '../../export.service';

@Component({
  selector: 'app-sales-drilldown',
  templateUrl: './sales-drilldown.component.html',
  styleUrls: ['./sales-drilldown.component.css']
})
export class SalesDrilldownComponent implements OnInit {
  recordList: Array<SalesRecord> = [];
  sku: any;
  // @Input() sku : Sku
  // @Input() customers: Array<any>
  display_name: string;
  selected_customer: string;
  customers: Array<any> = [];
  start_date: Date = new Date();
  end_date: Date = new Date();
  stats: any = {};

  displayedColumns: string[] = ['year', 'week', 'customer_number', 'customer_name', 'sales', 'price', 'revenue'];
  dataSource: MatTableDataSource<SalesRecord> = new MatTableDataSource<SalesRecord>(this.recordList)

  summaryLabels: string[] = ['Total Revenue', 'Manufacturing Run Size', 'Ingredient Cost Per Case', 'Manufacturing Setup Cost Per Case', 'Manufacturing Run Cost Per Case', 'COGS Per Case', 'Revenue Per Case', 'Profit Per Case', 'Profit Margin']
  summaryColumns: string[] = ['total_revenue', 'manufacturing_run_size', 'ingredient_cost_per_case', 'manufacturing_setup_cost_per_case', 'manufacturing_run_cost_per_case', 'cogs_per_case', 'revenue_per_case', 'profit_per_case', 'profit_margin']
  summarySource: MatTableDataSource<any>;
  displayedSummaryColumns: string[] = ['stat', 'value'];
  loadingResults: boolean = false;
  failedRequest: boolean = false;

  totalDocs: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public salesReportService: SalesReportService, public exportService: ExportService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.sku = this.data.sku;
    this.start_date.setFullYear(this.start_date.getFullYear()-1);
    this.display_name = `${this.sku.name} : ${this.sku.size} * ${this.sku.count} (${this.sku.number})`;
    if(this.paginator!=null){
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => this.refresh());
      this.dataSource.paginator = this.paginator;
    }
    this.refreshCustomer("all");
  }

  transpose() {
    let transposedData = [];
    for (let column = 0; column < this.summaryColumns.length; column++) {
      transposedData[column] = {
        stat: this.summaryLabels[column]
      };

      transposedData[column][`value`] = this.stats[this.summaryColumns[column]];
    }
    this.summarySource = new MatTableDataSource(transposedData);
  }

  refresh() {
    this.loadingResults = true;
    let request = {
      sku_number: this.sku.number,
      customers: this.customers,
      start: this.start_date.toISOString(),
      end: this.end_date.toISOString()
    }

    this.salesReportService.getDrilldown(request).subscribe((response) => {
      // if(!response.success){
      //   this.failedRequest = true;
      // } else {
        this.handleRefreshResponse(response);
      // }
    }, (err) => {
      if (err.status === 401) {
        console.log("401 Error")
      }
    });
  }

  handleRefreshResponse(response){
    if(response.success){
      this.recordList = [];
      this.totalDocs = response.records.length;
      for(let record of response.records){
        this.recordList.push({
          year: record.year,
          week: record.week,
          customer_number: record.customer_number,
          customer_name: record.customer_name,
          sales: record.sales,
          price: record.price,
          revenue: record.revenue
        });
      }

      this.stats = response.summary;
      console.log(this.stats)
      this.transpose();
      this.dataSource.data = this.recordList;
    }
    this.loadingResults = false;
  }

  initCustomer() {
    return (this.customers.length > 1) ? 'all' : this.customers[0];
  }

  refreshCustomer(customer) {
    this.selected_customer = customer;
    if (customer == 'all') {
      this.salesReportService.allCustomers().subscribe((response) => {
        let customer_objs = response.data;
        this.customers = [];
        for(let obj of customer_objs){
          this.customers.push(obj.name);
        }
        this.refresh();
      });
    } else  {
      this.customers = [customer];
      this.refresh();
    }
  }

  exportDrilldownToCSV() {
    this.exportService.exportJSON(this.displayedColumns, this.recordList, `${this.sku.number}_drilldown`);
  }

  exportTotalsToCSV() {
    this.exportService.exportJSON(this.summaryColumns, [this.stats], `${this.sku.number}_total_stats`);
  }

}
