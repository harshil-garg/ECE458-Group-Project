import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ExportService} from '../../export.service';
import { SalesReportService } from '../sales-report.service';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.css']
})

export class SalesSummaryComponent implements OnInit {
  sdisplayedColumns = ['SKU number', 'year', 'sales', 'revenue', 'revenue_per_case']
  ldisplayedColumns = ['total_revenue', 'revenue_per_case', 'profit_per_case', 'profit_margin', 'manufacturing_setup_cost_per_case', 'manufacturing_run_size', 'manufacturing_run_cost_per_case', 'ingredient_cost_per_case', 'cogs_per_case'];

  selected_customer: string;
  customers: Array<any> = [];

  sku_number: number;
  display_name: string;

  sku_ten_year_data = [];
  sku_yearly_data = [];

  loadingResults: boolean;
  failedRequest: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public salesReportService: SalesReportService, public exportService: ExportService) {
    this.sku_number = data.sku.number;
    this.display_name = `${data.sku.name} : ${data.sku.size} * ${data.sku.count} (${data.sku.number})`;
  }

  ngOnInit() {
    this.refreshCustomer("all");
  }

  refresh() {
    this.loadingResults = true;
    var request = {
      sku_number: this.sku_number,
      customers: this.customers
    };
    this.salesReportService.getSummary(request).subscribe(
      response => {
        if(!response.success){
          this.failedRequest = true;
        } else {
          this.sku_ten_year_data = [];
          let newTenYear = {};
          Object.keys(response["sku_ten_year_data"]).forEach(function(key,index) {
            if (key == "manufacturing_run_size") {
              newTenYear[key] = response["sku_ten_year_data"][key].toFixed(2);
            } else {
              newTenYear[key] = response["sku_ten_year_data"][key].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            }
          });
          this.sku_ten_year_data.push(newTenYear);

          let d = new Date();
          let year = d.getFullYear() - 9;

          this.sku_yearly_data = [];
          response["sku_yearly_data"].forEach((row) => {
            let newRow = {};
            Object.keys(row).forEach(function(key,index) {
              newRow[key] = row[key];
            });
            newRow['SKU number'] = this.sku_number;
            newRow['year'] = year;
            year++;
            this.sku_yearly_data.push(newRow);
          });
        }

        this.loadingResults = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  initCustomer(){
    return (this.customers.length > 1) ? 'all' : this.customers[0];
  }

  refreshCustomer(customer){
    this.selected_customer = customer;
    if(customer == 'all'){
      this.salesReportService.allCustomers().subscribe((response) => {
        let customer_objs = response.data;
        this.customers = [];
        for(let obj of customer_objs){
          this.customers.push(obj.name);
        }
        this.refresh();
      });
    } else{
      this.customers = [customer];
      this.refresh();
    }
  }

  exportYearlyToCSV() {
    this.exportService.exportJSON(this.sdisplayedColumns, this.sku_yearly_data, `${this.sku_number}_yearly_sales`);
  }

  exportTotalsToCSV() {
    this.exportService.exportJSON(this.ldisplayedColumns, [this.sku_ten_year_data], `${this.sku_number}_ten_year_sales`);
  }
}
