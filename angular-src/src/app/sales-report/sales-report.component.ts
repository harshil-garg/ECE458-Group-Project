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
  all = "all";

  summary_data = {};
  main_data = {};
  keys = [];
  displayedColumns: string[] = ['number', 'name', 'size', 'count', 'summary', 'drilldown'];
  loadingResults: boolean = false;

  constructor(private salesReportService: SalesReportService, public dialog: MatDialog, public productLineService: CrudProductLineService) {
  }

  ngOnInit() {
    this.refresh();
  }


  openSummary(sku) {
    this.dialog.open(SalesSummaryComponent, {
      height: '1000px',
      width: '1400px',
      data: {
        sku: sku
      }
    })
  }

  openDrilldown(sku) {
    this.dialog.open(SalesDrilldownComponent, {
      height: '800px',
      width: '1000px',
      data: {
        sku: sku
      }
    })
  }

  refresh() {
    this.loadingResults = true;
    var request = {
      product_lines: this.product_lines
    }
    this.salesReportService.getMain(request).subscribe(
      response => {
        this.main_data = response;
        this.keys = Object.keys(this.main_data);
        this.loadingResults = false;
      },
      error => {
        console.log("Error")
      }
    );
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

  flush(){
    this.salesReportService.doFlush().subscribe((response) => {
      this.refresh();
    })
  }
}
