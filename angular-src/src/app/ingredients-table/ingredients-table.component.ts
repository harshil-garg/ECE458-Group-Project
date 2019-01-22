import { Component } from '@angular/core';

import { Ingredient } from '../ingredient'

@Component({
  selector: 'ingredients-table',
  templateUrl: './ingredients-table.component.html',
  styleUrls: ['./ingredients-table.component.css']
})
export class IngredientsTableComponent {
    editField: string;
    ingredientList: Array<any> = [
      { name: 'Oranges', id: 1, vendor_info: 'Florida', package_size: '1 lb', cost_per_package: 4, comment: 'Hello world' },
      { name: 'Apples', id:2, vendor_info: 'Applebees', package_size: '3 lb', cost_per_package: 15, comment: 'Hello world 2' },
    ];

    blankIngredient: Ingredient =
      { name: '', id:0 , vendor_info: '', package_size: '', cost_per_package: 0, comment: '' };
    /*awaitingPersonList: Array<any> = [
      { id: 6, name: 'George Vega', age: 28, companyName: 'Classical', country: 'Russia', city: 'Moscow' },
      { id: 7, name: 'Mike Low', age: 22, companyName: 'Lou', country: 'USA', city: 'Los Angeles' },
      { id: 8, name: 'John Derp', age: 36, companyName: 'Derping', country: 'USA', city: 'Chicago' },
      { id: 9, name: 'Anastasia John', age: 21, companyName: 'Ajo', country: 'Brazil', city: 'Rio' },
      { id: 10, name: 'John Maklowicz', age: 36, companyName: 'Mako', country: 'Poland', city: 'Bialystok' },
    ];*/

    updateList(id: number, property: string, event: any) {
      const editField = event.target.textContent;
      if(property === 'cost_per_package')
      {
        this.ingredientList[id][property] = parseFloat(editField).toFixed(2);
      }
      else{
        this.ingredientList[id][property] = editField;
      }
    }

    remove(id: any) {
      //this.awaitingPersonList.push(this.personList[id]);
      this.ingredientList.splice(id, 1);
    }

    add() {
      // if (this.awaitingPersonList.length > 0) {
      //   const person = this.awaitingPersonList[0];
      //   this.personList.push(person);
      //   this.awaitingPersonList.splice(0, 1);
      // }
      var addedIngredient = new Ingredient();
      addedIngredient.id = nextId(this.ingredientList);
      this.ingredientList.push(addedIngredient);
    }

    changeValue(id: number, property: string, event: any) {
      if(property === 'cost_per_package')
      {
        this.editField = parseFloat(event.target.textContent).toFixed(2);
      }
      this.editField = event.target.textContent;
    }

    isAdmin(property: string) {
      if(property === 'cost_per_package')
      {
        return true;
      }
      else{
        return false;
      }
    }

}

function nextId(ingredientList: Array<any>){
  return ingredientList[ingredientList.length - 1].id + 1;
}
