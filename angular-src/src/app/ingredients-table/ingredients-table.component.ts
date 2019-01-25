import { Component } from '@angular/core';

import { Ingredient } from '../ingredient'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../sku'
import { CrudIngredientsService, Response } from './crud-ingredients.service';

@Component({
  selector: 'ingredients-table',
  templateUrl: './ingredients-table.component.html',
  styleUrls: ['./ingredients-table.component.css'],
})
export class IngredientsTableComponent {
    editField: string;
    ingredientList: Array<any> = [
      { name: 'Oranges', id: 1, vendor_info: 'Florida', package_size: '1 lb', cost_per_package: 4, comment: 'Hello world' },
      { name: 'Apples', id:2, vendor_info: 'Applebees', package_size: '3 lb', cost_per_package: 15, comment: 'Hello world 2' },
    ];

    blankIngredient: Ingredient =
      { name: '', id:'0' , vendor_info: '', package_size: '', cost_per_package: '0', comment: '' };

    skuShown: Array<any> = [
      {id:1, shown:true},
      {id:2, shown:false}
    ]

    editable: boolean = true;

    constructor(private authenticationService: AuthenticationService, public crudIngredientsService: CrudIngredientsService){}
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

    remove(deleted_name: any) {
      this.crudIngredientsService.remove({
          name : deleted_name
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    edit(name:any, property:string, event:any) {
      var editedIngredient : Ingredient = new Ingredient();
      var newName : string;
      editedIngredient.name = name;
      switch(property){
        case 'name':{
          newName = event.target.textContent; //new name
          editedIngredient.name = event.target.textContent;//old name
        }
        case 'id':{
          editedIngredient.id = event.target.textContent;
        }
        case 'vendor_info':{
          editedIngredient.vendor_info = event.target.textContent;
        }
        case 'package_size':{
          editedIngredient.package_size = event.target.textContent;
        }
        case 'cost_per_package':{
          editedIngredient.cost_per_package = event.target.textContent;
        }
        case 'comment':{
          editedIngredient.comment = event.target.textContent;
        }
      }
      this.crudIngredientsService.edit({
          name : editedIngredient.name,
          newname: newName,
          number : editedIngredient.id,
          vendor_info : editedIngredient.vendor_info,
          package_size: editedIngredient.package_size,
          cost : editedIngredient.cost_per_package,
          comment : editedIngredient.comment
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    private handleResponse(response: Response) {
      console.log(response);
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

    isAdmin() {
      return this.authenticationService.loginState.isAdmin;
    }

    getNumSkus(ingredient: Ingredient){
      return 3;
    }

    toggleSkus(id: number){
      this.skuShown[id].shown = !this.skuShown[id].shown;
    }

}

function nextId(ingredientList: Array<any>){
  return ingredientList[ingredientList.length - 1].id + 1;
}
//
// function skuList(ingredient: Ingredient)
// {
//   const skuList = [
//     { name: 'Fruit Cocktail', id: 1, case_upc: 618273945710, unit_upc: 618273945712, unit_size: 4, count_per_case:36, product_line: "Dole", ingredient_quantity: {}, comment: 'Hello world' },
//     { name: 'Fruit Kebob', id:2, case_upc: 120394876276, unit_upc: 618273945714, unit_size: 15, count_per_caes:12, product_line: "Dole", ingredient_quantity: {}, comment: 'Hello world 2' },
//   ];
//   return this.skuList;
// }
