import { Component, OnInit, Input, Output } from '@angular/core';
import { MatTableDataSource, MatSnackBar, MatSort } from '@angular/material';
import { Sku } from '../../model/sku';
import { SalesRecord } from '../../model/sales-record';

@Component({
  selector: 'app-sales-drilldown',
  templateUrl: './sales-drilldown.component.html',
  styleUrls: ['./sales-drilldown.component.css']
})
export class SalesDrilldownComponent implements OnInit {
  recordList: Array<SalesRecord> = [];
  sku: any;
  // @Input() sku : Sku
  display_name: string;
  displayedColumns: string[] = ['year', 'week', 'customer number', 'customer name', 'sales', 'price', 'revenue'];
  dataSource = new MatTableDataSource<SalesRecord>(this.recordList)

  constructor() { }

  ngOnInit() {
    this.sku = {
      name: "Burger_Beef",
      id: 1001,
      unit_size: "5 pounds",
      count_per_case: 30
    }

    this.display_name = `${this.sku.name} : ${this.sku.unit_size} * ${this.sku.count_per_case} (${this.sku.id})`;
    for(let i = 0; i < 10; i++){
      this.recordList.push({
        year: 2010+i,
        week: 5,
        customer_number: 1+i,
        customer_name: `poop${i}`,
        sales: 10*i,
        price: 20*i,
        revenue: 30*i
      })
    }
  }

  getTotal(key: string){
    let total = 0;
    for(let record of this.recordList){
      total += record[key]
    }
    return total;
  }

}
