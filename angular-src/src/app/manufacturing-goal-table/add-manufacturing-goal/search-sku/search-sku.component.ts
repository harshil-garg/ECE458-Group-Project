import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FilterSkuService } from '../../../sku-table/filter-sku.service'
import { FormControl } from '@angular/forms';
import { AddManufacturingGoalDialogComponent } from '../add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import { Sku } from '../../../model/sku';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-search-sku',
  templateUrl: './search-sku.component.html',
  styleUrls: ['./search-sku.component.css']
})
export class SearchSkuComponent implements OnInit {

  input: string = "";
  skuName: string = "";
  productLine: string = "";
  inputField: FormControl = new FormControl();
  selectedValue : string = "sku";
  selectedSku : any;
  suggestedSkus : Array<any> = [];
  @Output() skuSelected : EventEmitter<any> = new EventEmitter<any>();

  constructor(public addManufacturingGoalDialogComponent: AddManufacturingGoalDialogComponent, public filterSkuService: FilterSkuService) { }

  ngOnInit() {
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterSkuService.filter({
      sortBy : 'name',
     	pageNum: '1',
      page_size: 10,
     	keywords: [this.skuName],
     	ingredients: [],
     	product_lines: [this.productLine]
    })).subscribe( result => {
          console.log(result);
          if(result!=null && result.data!=null){
            this.suggestedSkus = [];
            for(let sku of result.data){
              this.suggestedSkus.push(sku)
          }
         }
         this.suggestedSkus.slice(0,10)
    });

  }

  updateValue(){
    if(this.selectedValue==='sku'){
      this.skuName = this.input;
    }
    else{
      this.productLine = this.input;
    }
  }

  changeInputType(newType){
    this.selectedValue = newType;
    if(newType==='sku'){
      this.input = this.skuName;
    }
    else {
      this.input = this.productLine;
    }
  }

  onSelectionChanged(event){
    this.selectedSku = event.option.value;
    this.skuName = event.option.value.name;
    this.productLine = event.option.value.product_line;
    this.selectedValue = "sku";
    this.inputField.setValue(this.skuName);
    this.skuSelected.emit(this.selectedSku);
  }

  enable(){
    this.skuSelected.emit(this.selectedSku);
    this.selectedSku = null;
    this.skuName = "";
    this.productLine = "";
    this.inputField.setValue("");
  }

}
