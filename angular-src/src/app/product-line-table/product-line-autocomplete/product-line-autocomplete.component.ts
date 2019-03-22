import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CrudProductLineService } from '../crud-product-line.service';

@Component({
  selector: 'app-product-line-autocomplete',
  templateUrl: './product-line-autocomplete.component.html',
  styleUrls: ['./product-line-autocomplete.component.css']
})
export class ProductLineAutocompleteComponent implements OnInit {

  @Input() initUnit : string;
  @Output() messageEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
