import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.css']
})
export class SalesSummaryComponent implements OnInit {
  sdisplayedColumns = ['SKU number', 'sales', 'revenue', 'revenue_per_case']
  ldisplayedColumns = ['total_revenue', 'revenue_per_case', 'profit_per_case', 'profit_margin', 'manufacturing_setup_cost_per_case', 'manufacturing_run_size', 'manufacturing_run_cost_per_case', 'ingredient_cost_per_case', 'cogs_per_case'];
  sku_ten_year_data = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    let newTenYear = {};
    Object.keys(data.sku.sku_ten_year_data).forEach(function(key,index) {
      newTenYear[key] = data.sku.sku_ten_year_data[key].toFixed(2);
  });
    this.sku_ten_year_data.push(newTenYear);
  }

  ngOnInit() {
  }

  exportToCSV() {
    console.log(this.data);
  }
}
