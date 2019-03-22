import { Component, OnInit, Input, Output, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatSnackBar, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { Sku } from '../../model/sku';
import { SalesRecord } from '../../model/sales-record';
import { SalesReportService, DrilldownRequest } from '../sales-report.service';

@Component({
  selector: 'app-sales-drilldown',
  templateUrl: './sales-drilldown.component.html',
  styleUrls: ['./sales-drilldown.component.css']
})
export class SalesDrilldownComponent implements OnInit {
  recordList: Array<SalesRecord> = [];
  sku: any;
  // @Input() sku : Sku, customers: Array<any>
  display_name: string;
  customers: Array<any> = ['Walmart'];
  start: string;
  end: string = new Date().toISOString();
  stats: any = {};

  displayedColumns: string[] = ['year', 'week', 'customer number', 'customer name', 'sales', 'price', 'revenue'];
  dataSource: MatTableDataSource<SalesRecord> = new MatTableDataSource<SalesRecord>(this.recordList)

  summaryLabels: string[] = ['Total Revenue', 'Manufacturing Run Size', 'Ingredient Cost Per Case', 'Manufacturing Setup Cost Per Case', 'Manufacturing Run Cost Per Case', 'COGS Per Case', 'Revenue Per Case', 'Profit Per Case', 'Profit Margin']
  summaryColumns: string[] = ['total_revenue', 'manufacturing_run_size', 'ingredient_cost_per_case', 'manufacturing_setup_cost_per_case', 'manufacturing_run_cost_per_case', 'cogs_per_case', 'revenue_per_case', 'profit_per_case', 'profit_margin']
  summarySource: MatTableDataSource<any>;
  displayedSummaryColumns: string[] = ['stat', 'value'];

  totalDocs: number;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(public salesReportService: SalesReportService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.sku = {
      name: "Burger_Beef",
      id: this.data.sku_number,
      unit_size: "5 pounds",
      count_per_case: 30
    }
    let date: Date = new Date();
    date.setFullYear(date.getFullYear()-1);
    this.start = date.toISOString();

    this.display_name = `${this.sku.name} : ${this.sku.unit_size} * ${this.sku.count_per_case} (${this.sku.id})`;


    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.paginator.page.subscribe(x => this.refresh());
    this.refresh();
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

  refresh(){
    let request = {
      sku_number: this.sku.id,
      customers: this.customers,
      start: this.start,
      end: this.end
    }

    this.salesReportService.getDrilldown(request).subscribe((response) => {
      this.handleRefreshResponse(response);
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
      this.transpose();
      this.dataSource.data = this.recordList;
    }
  }

}
