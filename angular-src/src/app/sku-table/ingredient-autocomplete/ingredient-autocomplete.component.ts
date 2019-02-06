import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FilterSkuService, FilterResponse } from '../filter-sku.service'
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-ingredient-autocomplete',
  templateUrl: './ingredient-autocomplete.component.html',
  styleUrls: ['./ingredient-autocomplete.component.css']
})
export class IngredientAutocompleteComponent implements OnInit {

    suggestedIngredients : Array<any> = [];
    inputField : FormControl = new FormControl();

    @Output() messageEvent = new EventEmitter<string>();

    constructor(public filterSkuService: FilterSkuService) { }

    ngOnInit() {
      this.inputField.valueChanges.debounceTime(200)
     .distinctUntilChanged()
     .switchMap((query) =>  this.filterSkuService.autocompleteIngredients({input: query}))
     .subscribe( result => {
          if(result!=null && result.data!=null){
            this.suggestedIngredients = [];
            for(let ingredient of result.data){
              this.suggestedIngredients.push(ingredient)
           }
           this.suggestedIngredients.slice(0,10)
         }
      });

    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        this.inputField.setValue(this.suggestedIngredients[0].name);
        this.messageEvent.emit(this.inputField.value);
      }
    }

    selectIngredient(ingr_name){
      this.inputField.setValue(ingr_name);
      this.messageEvent.emit(this.inputField.value);
    }

    onSelectionChanged(event){
      this.selectIngredient(event.option.value);
    }


}
