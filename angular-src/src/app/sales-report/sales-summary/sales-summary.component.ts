import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {ExportService} from '../../export.service';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.css']
})
export class SalesSummaryComponent implements OnInit {
  sdisplayedColumns = ['SKU number', 'sales', 'revenue', 'revenue_per_case']
  ldisplayedColumns = ['total_revenue', 'revenue_per_case', 'profit_per_case', 'profit_margin', 'manufacturing_setup_cost_per_case', 'manufacturing_run_size', 'manufacturing_run_cost_per_case', 'ingredient_cost_per_case', 'cogs_per_case'];
  sku_ten_year_data = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public exportService: ExportService) {
    let newTenYear = {};
    Object.keys(data.sku.sku_ten_year_data).forEach(function(key,index) {
      if (key == "manufacturing_run_size") {
        newTenYear[key] = data.sku.sku_ten_year_data[key].toFixed(2);
      } else {
        newTenYear[key] = data.sku.sku_ten_year_data[key].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      }
    });
    this.sku_ten_year_data.push(newTenYear);
  }

  ngOnInit() {
  }

  exportYearlyToCSV() {
    let data = [];
    this.data.sku.sku_yearly_data.forEach((row) => {
      let newRow = {};
      Object.keys(row).forEach(function(key,index) {
        newRow[key] = row[key];
      });
      newRow['SKU number'] = this.data.sku.sku.number;
      data.push(newRow);
    });
    this.exportService.exportJSON(this.sdisplayedColumns, data, `${this.data.sku.sku.number}_yearly_sales`);
  }

  exportTotalsToCSV() {
    this.exportService.exportJSON(this.ldisplayedColumns, [this.data.sku.sku_ten_year_data], `${this.data.sku.sku.number}_ten_year_sales`);
  }
}
