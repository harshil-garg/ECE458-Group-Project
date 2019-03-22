import { Component, OnInit, Input, Output } from '@angular/core';
import { Sku } from '../../model/sku';

@Component({
  selector: 'app-sales-drilldown',
  templateUrl: './sales-drilldown.component.html',
  styleUrls: ['./sales-drilldown.component.css']
})
export class SalesDrilldownComponent implements OnInit {
  sku
  // @Input() sku : Sku
  display_name: string;

  constructor() { }

  ngOnInit() {
    this.sku = {
      name: "hello",
      id: 1,
      unit_size: "5",
      count_per_case: 30
    }
    
    this.display_name = `${this.sku.name} : ${this.sku.unit_size} * ${this.sku.count_per_case} (${this.sku.id})`
  }

}
