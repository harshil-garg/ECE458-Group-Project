import { Component, OnInit } from '@angular/core';
import { FilterIngredientsService, FilterResponse } from '../filter-ingredients.service'
import { FormControl } from '@angular/forms';
import { IngredientsTableComponent } from '../ingredients-table.component';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-search-ingredient',
  templateUrl: './search-ingredient.component.html',
  styleUrls: ['./search-ingredient.component.css']
})
export class SearchIngredientComponent implements OnInit {

  keywords : Array<any> = [];
  skus : Array<any> = [];
  suggestedSkus : Array<any> = [];
  inputField : FormControl = new FormControl();
  constructor(public ingredientsTableComponent: IngredientsTableComponent, public filterIngredientsService: FilterIngredientsService) { }

  ngOnInit() {
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.filterIngredientsService.autocomplete({input: query}))
   .subscribe( result => {
          this.suggestedSkus = [];
          for(let sku of result.data){
            this.suggestedSkus.push(sku)
         }
         this.suggestedSkus.slice(0,10)
    });

  }

  keyPressed(event){
    if(event.keyCode == 13){ //enter pressed
      this.keywords.push(this.inputField.value);
      this.ingredientsTableComponent.setKeywords(this.keywords);
      this.inputField.setValue('');
    }
  }

  addSku(skuName : any){
    this.skus.push(skuName);
    this.ingredientsTableComponent.setSearchedSkus(this.skus);
    this.inputField.setValue('');
  }

  remove(index: number){
    this.keywords.splice(index, 1);
    this.ingredientsTableComponent.setKeywords(this.keywords);
  }

  removeSku(index: number){
    this.skus.splice(index, 1);
    this.ingredientsTableComponent.setSearchedSkus(this.skus);
  }

}

//
// import {Component, OnInit} from '@angular/core';
// import {Observable, Subject} from 'rxjs';
// import { FilterIngredientsService } from '../filter-ingredients.service';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/operator/distinctUntilChanged';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/switchMap';
// import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
//
// const states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado',
//   'Connecticut', 'Delaware', 'District Of Columbia', 'Federated States Of Micronesia', 'Florida', 'Georgia',
//   'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
//   'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
//   'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
//   'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
//   'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia',
//   'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
//
// @Component({
//   selector: 'app-search-ingredient',
//   templateUrl: './search-ingredient.component.html',
//   styleUrls: ['./search-ingredient.component.css']
// })
// export class SearchIngredientComponent implements OnInit {
//   public clients: Observable<any[]>;
//   private searchTerms = new Subject<string>();
//   public ClientName = '';
//   public flag: boolean = true;
//   constructor(
//     private filterIngredientsService: FilterIngredientsService,
//   ) {
//
//   }
//
//   ngOnInit(): void {
//     // this.clients = this.searchTerms.debounceTime(200)
//     // .distinctUntilChanged()
//     // .switchMap((query) =>  this.filterIngredientsService.autocomplete(query))
//     // .subscribe( result =>  result );
//   }
//
//   // Push a search term into the observable stream.
//   searchClient(term: string): void {
//     this.flag = true;
//     this.searchTerms.next(term);
//   }
//   onselectClient(ClientObj) {
//     if (ClientObj.ClientId != 0) {
//       this.ClientName = ClientObj.ClientName;
//       this.flag = false;
//     }
//     else {
//       return false;
//     }
//   }
//
// }
