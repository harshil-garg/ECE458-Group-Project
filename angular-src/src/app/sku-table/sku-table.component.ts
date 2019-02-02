import { Component, OnInit } from '@angular/core';
import { Ingredient, Tuple } from '../model/ingredient'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { CrudSkuService, Response } from './crud-sku.service';
import { FilterSkuService, FilterResponse } from './filter-sku.service'

@Component({
  selector: 'sku-table',
  templateUrl: './sku-table.component.html',
  styleUrls: ['./sku-table.component.css'],
})
export class SkuTableComponent implements OnInit{
    editField: string;
    skuList: Array<any> = [];
    currentPage: number;
    maxPages: number;
    sortBy: string = "name";
    keywords: Array<any> = [];

    ingredientInputs: Array<any> = [];
    quantityInputs: Array<any> = [];

    ngOnInit() {
      this.currentPage = 1;
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudSkuService: CrudSkuService,
      public filterSkuService: FilterSkuService){}

    updateList(id: number, property: string, event: any) {
      const editField = event.target.textContent;
      this.skuList[id][property] = editField;
    }

    remove(deleted_number: any) {
      this.crudSkuService.remove({
          number : deleted_number
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    edit(num:any, property:string, event:any) {
      var editedSku : Sku = new Sku();
      var newNumber : number;
      editedSku.id = num*1;
      switch(property){
        case 'name':{
          editedSku.name = event.target.textContent;
          break;
        }
        case 'id':{
          newNumber = event.target.textContent;
          break;
        }
        case 'case_upc':{
          editedSku.case_upc = event.target.textContent;
          break;
        }
        case 'unit_upc':{
          editedSku.unit_upc = event.target.textContent;
          break;
        }
        case 'unit_size':{
          editedSku.unit_size = event.target.textContent;
          break;
        }
        case 'count_per_case':{
          editedSku.count_per_case = event.target.textContent*1;
          break;
        }
        case 'product_line':{
          editedSku.product_line = event.target.textContent;
          break;
        }
        case 'ingredient_quantity':{
          editedSku.ingredient_quantity = event.target.textContent;
          break;
        }
        case 'comment':{
          editedSku.comment = event.target.textContent;
          break;
        }
      }
      this.crudSkuService.edit({
          name : editedSku.name,
          number : editedSku.id,
          newnumber: newNumber,
          case_upc : editedSku.case_upc,
          unit_upc: editedSku.unit_upc,
          size : editedSku.unit_size,
          count: editedSku.count_per_case,
          product_line : editedSku.product_line,
          ingredients: editedSku.ingredient_quantity,
          comment: editedSku.comment
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        });
    }

    updateIngredientQuantity(editedSku : Sku){
      this.crudSkuService.edit({
        name : editedSku.name,
        number : editedSku.id,
        newnumber: editedSku.id,
        case_upc : editedSku.case_upc,
        unit_upc: editedSku.unit_upc,
        size : editedSku.unit_size,
        count: editedSku.count_per_case,
        product_line : editedSku.product_line,
        ingredients: editedSku.ingredient_quantity,
        comment: editedSku.comment
      }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        });
    }

    addIngredientQuantity(num:any, id:number, ingr_quant: Tuple){
      var editedSku : Sku = new Sku();
      var ingr_quant_list: Array<any> = this.skuList[id].ingredient_quantity;
      editedSku.id = num*1;
      ingr_quant_list.push(ingr_quant);
      editedSku.ingredient_quantity = ingr_quant_list;
      this.updateIngredientQuantity(editedSku);
    }

    removeIngrQuant(ingr_id:number, id:number, sku_id:number){
      var editedSku : Sku = new Sku();
      var ingr_quant_list: Array<any> = this.skuList[id].ingredient_quantity;
      editedSku.id = sku_id*1;
      ingr_quant_list.splice(ingr_id, 1);
      editedSku.ingredient_quantity = ingr_quant_list;
      this.updateIngredientQuantity(editedSku);
    }

    private handleResponse(response: Response) {
      console.log(response);
      this.refresh();
    }

    changeValue(id: number, property: string, event: any) {
      this.editField = event.target.textContent;
    }

    isAdmin() {
      return this.authenticationService.loginState.isAdmin;
    }

    refresh(){
      this.filterSkuService.filter({
          sortBy : this.sortBy,
          pageNum: this.currentPage.toString(),
          keywords: this.keywords,
          ingredients: [],
          product_lines: []
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
      console.log(response.success);
      console.log(response);
      if(response.success){
        this.skuList = [];
        for(let sku of response.data){
          this.skuList.push({
              id: sku.number,
              name: sku.name,
              case_upc: sku.case_upc,
              unit_upc: sku.unit_upc,
              unit_size: sku.size,
              count_per_case: sku.count,
              product_line: sku.product_line,
              ingredient_quantity: sku.ingredients,
              comment: sku.comment
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

    showAll(){
      this.currentPage = -1;
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

    setKeywords(newKeywords : Array<any>){
      this.keywords = newKeywords;
      this.refresh();
    }

    keyPressed(sku_num, id, event){
      if(event.keyCode == 13){ //enter pressed
        if(this.ingredientInputs[id]!=null && this.ingredientInputs[id].length>0 && this.quantityInputs[id]!=null && this.quantityInputs[id].length>0){
          var added_ingr_quant: Tuple = {
            ingredient_name: this.ingredientInputs[id],
            quantity: this.quantityInputs[id]
          }
          this.addIngredientQuantity(sku_num, id, added_ingr_quant);
          this.refresh();
          this.ingredientInputs[id] = '';
          this.quantityInputs[id] = '';
        }
      }
    }

}
//
// function skuList(ingredient: Ingredient)
// {
//   const skuList = [
//     { name: 'Fruit Cocktail', id: 1, case_upc: 618273945710, unit_upc: 618273945712, unit_size: 4, count_per_case:36, product_line: "Dole", ingredient_quantity: {}, comment: 'Hello world' },
//     { name: 'Fruit Kebob', id:2, case_upc: 120394876276, unit_upc: 618273945714, unit_size: 15, count_per_case:12, product_line: "Dole", ingredient_quantity: {}, comment: 'Hello world 2' },
//   ];
//   return this.skuList;
// }
