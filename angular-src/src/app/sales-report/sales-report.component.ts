import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SalesDrilldownComponent } from './sales-drilldown/sales-drilldown.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SalesReportService } from './sales-report.service';
import { CrudProductLineService } from '../product-line-table/crud-product-line.service';
import { ExportService } from '../export.service';
import { AuthenticationService } from '../authentication.service'

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {

  product_lines = [];

  selected_customer: string;
  customers: Array<any> = [];

  summary_data = {};
  product_line_keys = [];

  sdisplayedColumns = ['year', 'sales', 'revenue', 'revenue_per_case']
  ldisplayedColumns = ['total_revenue', 'revenue_per_case', 'profit_per_case', 'profit_margin', 'manufacturing_setup_cost_per_case', 'manufacturing_run_size', 'manufacturing_run_cost_per_case', 'ingredient_cost_per_case', 'cogs_per_case'];

  loadingResults: boolean = false;

  constructor(private authenticationService: AuthenticationService, private salesReportService: SalesReportService, public dialog: MatDialog, public productLineService: CrudProductLineService, public exportService: ExportService) {
  }

  ngOnInit() {
    this.refreshCustomer('all');
  }

  openDrilldown(sku) {
    this.dialog.open(SalesDrilldownComponent, {
      height: '800px',
      width: '1000px',
      data: {
        sku: sku
      }
    });
  }

  refresh() {
    console.log("Uh lols");
    this.loadingResults = true;
    var request = {
      product_lines: this.product_lines,
      customers: this.customers
    }
    this.salesReportService.getSummary(request).subscribe(
      response => {
        this.summary_data = response;
        this.product_line_keys = Object.keys(this.summary_data);
        this.formatYearlyData();
        this.formatTenYearData();
        console.log(this.summary_data);
        this.loadingResults = false;
      },
      error => {
        console.log("Error")
      }
    );
  }

  formatYearlyData() {
    for (let product_line of this.product_line_keys) {
      let data = this.summary_data[product_line];
      for (let sku of data) {
        let year = new Date().getFullYear() - 9;
        let sku_yearly_data_export = [];
        let sku_yearly_data_display = [];
        for (let row of sku.sku_yearly_data) {
          let display_row = {};
          let export_row = {};
          for (let column_header of Object.keys(row)) {
            if (column_header != "sales") {
              display_row[column_header] = row[column_header].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            } else {
              display_row[column_header] = row[column_header].toLocaleString();
            }
            export_row[column_header] = row[column_header];
          }
          display_row['SKU number'] = sku.number;
          display_row['year'] = year;
          export_row['SKU number'] = sku.number;
          export_row['year'] = year;
          year++;
          sku_yearly_data_display.push(display_row);
          sku_yearly_data_export.push(export_row);
        }
        sku["sku_yearly_data_display"] = sku_yearly_data_display;
        sku["sku_yearly_data_export"] = sku_yearly_data_export;
      }
    }
  }

  formatTenYearData() {
    for (let product_line of this.product_line_keys) {
      let data = this.summary_data[product_line];
      for (let sku of data) {
        let sku_ten_year_data_display = [];
        let sku_ten_year_data_export = [];
        let display_obj = {};
        let export_obj = {};
        for (let column_header of Object.keys(sku.sku_ten_year_data)) {
          if (column_header == "manufacturing_run_size") {
            display_obj[column_header] = sku["sku_ten_year_data"][column_header].toFixed(2);
          } else if (column_header == "profit_margin") {
            display_obj[column_header] = sku["sku_ten_year_data"][column_header].toFixed(2) + "%";
          } else {
            display_obj[column_header] = sku["sku_ten_year_data"][column_header].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
          }
          export_obj[column_header] = sku["sku_ten_year_data"][column_header];
        }
        sku_ten_year_data_display.push(display_obj);
        sku_ten_year_data_export.push(export_obj);
        sku["sku_ten_year_data_display"] = sku_ten_year_data_display;
        sku["sku_ten_year_data_export"] = sku_ten_year_data_export;
      }
    }
  }

  getSKUDisplayName(sku) {
    return `${sku.sku_info.name} : ${sku.sku_info.size} * ${sku.sku_info.count} (${sku.sku_info.number})`;
  }

  refreshProductLines(line) {
    this.product_lines.push(line);
    this.refresh();
  }

  removeProductLine(id) {
    this.product_lines.splice(id, 1);
    this.refresh();
  }

  addAllProductLines() {
    this.productLineService.read({pageNum: -1, page_size: 0}).subscribe(
      response => {
        this.product_lines = [];
        for (let obj of response.data) {
          this.product_lines.push(obj.name);
        }
        this.refresh();
      }
    );
  }

  initCustomer(){
    return 'all';
  }

  refreshCustomer(customer) {
    this.selected_customer = customer;
    if (customer == 'all') {
      this.salesReportService.allCustomers().subscribe(
        response => {
          let customer_objs = response.data;
          this.customers = [];
          for(let obj of customer_objs){
            this.customers.push(obj.name);
          }
          this.refresh();
        }
      );
    } else {
      this.customers = [customer];
      this.refresh();
    }
  }

  flush() {
    this.salesReportService.doFlush().subscribe(
      response => {
        this.refresh();
      },
      error => {
        this.refresh();
      }
    );
  }

  exportYearlyToCSV(sku) {
    this.exportService.exportJSON(this.sdisplayedColumns, sku.sku_yearly_data_export, `${sku.sku_info.number}_yearly_sales`);
  }

  exportTotalsToCSV(sku) {
    console.log(sku.sku_ten_year_data_export);
    this.exportService.exportJSON(this.ldisplayedColumns, sku.sku_ten_year_data_export, `${sku.sku_info.number}_ten_year_sales`);
  }

  isAnalyst() {
    return this.authenticationService.isAnalyst();
  }

  isProductManager() {
    return this.authenticationService.isProductManager();
  }

  isBusinessManager() {
    return this.authenticationService.isBusinessManager();
  }

  isPlantManager() {
    return this.authenticationService.isPlantManager();
  }

  isAdmin() {
    return this.authenticationService.isAdmin();
  }

  canUpdate() {
    return this.isAdmin() || this.isProductManager();
  }
}
