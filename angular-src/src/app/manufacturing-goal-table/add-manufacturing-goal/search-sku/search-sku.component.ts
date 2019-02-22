import { Component, OnInit } from '@angular/core';
import { FilterSkuService } from '../../../sku-table/filter-sku.service'
import { FormControl } from '@angular/forms';
import { AddManufacturingGoalDialogComponent } from '../add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-search-sku',
  templateUrl: './search-sku.component.html',
  styleUrls: ['./search-sku.component.css']
})
export class SearchSkuComponent implements OnInit {

  suggestedSkus : Array<any> = [];
  suggestedProductLines : Array<any> = [];
  productLine : Array<any> = [];
  productLineField : FormControl = new FormControl();
  skuField : FormControl = new FormControl();

  constructor(public addManufacturingGoalDialogComponent: AddManufacturingGoalDialogComponent, public filterSkuService: FilterSkuService) { }

  ngOnInit() {
    this.productLineField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterSkuService.autocompleteProductLines({input: query}))
   .subscribe( result => {
          if(result!=null && result.data!=null){
            this.suggestedProductLines = [];
            for(let productLine of result.data){
              this.suggestedProductLines.push(productLine)
          }
         }
         this.suggestedProductLines.slice(0,10)
    });

    this.skuField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterSkuService.filter({
      sortBy : 'name',
     	pageNum: '1',
     	keywords: [query],
     	ingredients: [],
     	product_lines: this.productLine
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

  keyPressedProductLine(event){
    if(event.keyCode == 13){ //enter pressed
      this.productLine = [];
      this.productLine.push(this.suggestedProductLines[0].name);
      this.productLineField.setValue(this.suggestedProductLines[0].name);
    }
  }

  keyPressedSku(event){
    if(event.keyCode == 13){ //enter pressed
      this.addManufacturingGoalDialogComponent.setSku(this.suggestedSkus[0]);
      this.skuField.setValue(this.suggestedSkus[0].name);
    }
  }

  // addSku(skuName : any){
  //   this.skus.push(skuName);
  //   this.ingredientsTableComponent.setSearchedSkus(this.skus);
  //   this.skuField.setValue('');
  // }

  onProductLineSelection(event){
    this.productLine = [];
    this.productLine.push(event.option.value);
  }

  onSkuSelection(event){
    console.log("SKU SELECTED");
    console.log(event.option.value);
    this.addManufacturingGoalDialogComponent.setSku(event.option.value);
  }

  displaySku(sku): string | undefined{
    return sku ? sku.name : undefined;
  }

}
