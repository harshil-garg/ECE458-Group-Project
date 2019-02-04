import { Component, OnInit } from '@angular/core';
import { FilterSkuService, FilterResponse } from '../filter-sku.service'
import { FormControl } from '@angular/forms';
import { SkuTableComponent } from '../sku-table.component';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-search-sku',
  templateUrl: './search-sku.component.html',
  styleUrls: ['./search-sku.component.css']
})
export class SearchSkuComponent implements OnInit {

  keywords : Array<any> = [];
  ingredients : Array<any> = [];
  productLines : Array<any> = [];
  suggestedIngredients : Array<any> = [];
  suggestedProductLines : Array<any> = [];
  inputField : FormControl = new FormControl();
  constructor(public skuTableComponent: SkuTableComponent, public filterSkuService: FilterSkuService) { }

  ngOnInit() {
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterSkuService.autocompleteIngredients({input: query}))
   .subscribe( result => {
          this.suggestedIngredients = [];
          for(let ingredient of result.data){
            this.suggestedIngredients.push(ingredient)
         }
         this.suggestedIngredients.slice(0,10)
    });
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterSkuService.autocompleteProductLines({input: query}))
   .subscribe( result => {
          this.suggestedProductLines = [];
          for(let productLine of result.data){
            this.suggestedProductLines.push(productLine)
         }
         this.suggestedProductLines.slice(0,10)
    });

  }

  keyPressed(event){
    if(event.keyCode == 13){ //enter pressed
      this.keywords.push(this.inputField.value);
      this.skuTableComponent.setKeywords(this.keywords);
      this.inputField.setValue('');
    }
  }

  removeKeyword(index: number){
    this.keywords.splice(index, 1);
    this.skuTableComponent.setKeywords(this.keywords);
  }

  addIngredient(ingredientName : any){
    this.ingredients.push(ingredientName);
    this.skuTableComponent.setSearchedIngredients(this.ingredients);
    this.inputField.setValue('');
  }

  removeIngredient(index: number){
    this.ingredients.splice(index, 1);
    this.skuTableComponent.setSearchedIngredients(this.ingredients);
  }

  addProductLine(productLineName : any){
    this.productLines.push(productLineName);
    this.skuTableComponent.setSearchedProductLines(this.productLines);
    this.inputField.setValue('');
  }

  removeProductLine(index: number){
    this.productLines.splice(index, 1);
    this.skuTableComponent.setSearchedProductLines(this.productLines);
  }


}
