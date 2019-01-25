import { Component, OnInit } from '@angular/core';
import { Ingredient } from '../model/ingredient'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { CrudIngredientsService, Response } from './crud-ingredients.service';
import { FilterIngredientsService, FilterResponse } from './filter-ingredients.service'

@Component({
  selector: 'ingredients-table',
  templateUrl: './ingredients-table.component.html',
  styleUrls: ['./ingredients-table.component.css'],
})
export class IngredientsTableComponent implements OnInit{
    editField: string;
    ingredientList: Array<any> = [];
    currentPage: number;
    maxPages: number;
    sortBy: string = "name";

    skuShown: Array<any> = [
      {id:1, shown:true},
      {id:2, shown:false}
    ]

    ngOnInit() {
      this.currentPage = 1;
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudIngredientsService: CrudIngredientsService,
      public filterIngredientsService: FilterIngredientsService){}

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
        });
    }

    private handleResponse(response: Response) {
      console.log(response);
      this.refresh();
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

    refresh(){
      this.filterIngredientsService.filter({
          sortBy : this.sortBy,
          pageNum: this.currentPage.toString(),
          keywords: [],
          skus : []
        }).subscribe(
        response => this.handleRefreshResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    handleRefreshResponse(response: FilterResponse){
      if(response.success){
        this.ingredientList = [];
        for(let ingredient of response.data){
          this.ingredientList.push({
              id: ingredient.number,
              name: ingredient.name,
              vendor_info: ingredient.vendor_info,
              package_size: ingredient.package_size,
              cost_per_package: ingredient.cost,
              comment: ingredient.comment
          });
        }
        this.maxPages = response.pages;
      }
    }

    setSortBy(property: string){
      this.sortBy = property;
      this.refresh();
    }

    nextPage(){
      if(this.currentPage<this.maxPages){
        this.currentPage++;
        this.refresh();
      }
    }

    prevPage(){
      if(this.currentPage>1){
        this.currentPage--;
        this.refresh();
      }
    }

    setPage(i){
      this.currentPage = i;
      this.refresh();
    }

    shownPages(){
      var numbers : Array<number> = [];
      if(this.maxPages>5)
      {
        for (var i = 1; i < 5; i++) {
          numbers.push(i);
        }
        numbers.push(this.maxPages)
        return numbers;
      }
      else{
        for (var i = 1; i <= this.maxPages; i++) {
          numbers.push(i);
        }
        return numbers;
      }
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
