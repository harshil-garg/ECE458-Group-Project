import { Component, OnInit } from '@angular/core';
import { FilterIngredientsService, FilterResponse } from '../filter-ingredients.service'
import { FormControl } from '@angular/forms';
import { IngredientsTableComponent } from '../ingredients-table.component';

@Component({
  selector: 'app-search-ingredient',
  templateUrl: './search-ingredient.component.html',
  styleUrls: ['./search-ingredient.component.css']
})
export class SearchIngredientComponent implements OnInit {

  keywords : Array<any> = [];
  suggestions : Array<any> = [];
  inputField : FormControl = new FormControl();
  constructor(public ingredientsTableComponent: IngredientsTableComponent) { }

  ngOnInit() {
    // this.inputField.valueChanges.subscribe(
    //   //assisted sku selection here
    // );
  }

  keyPressed(event){
    if(event.keyCode == 13){ //enter pressed
      this.keywords.push(this.inputField.value);
      this.ingredientsTableComponent.setKeywords(this.keywords);
      this.inputField.setValue('');
    }
  }

  remove(index: number){
    this.keywords.splice(index, 1);
    this.ingredientsTableComponent.setKeywords(this.keywords);
  }

}
