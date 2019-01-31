import { Component, OnInit } from '@angular/core';
import { ProductLine } from '../model/product-line'
import { AuthenticationService } from '../authentication.service'

@Component({
  selector: 'app-product-line-table',
  templateUrl: './product-line-table.component.html',
  styleUrls: ['./product-line-table.component.css'],
})
export class ProductLineTableComponent implements OnInit{
    editField: string;
    ingredientList: Array<any> = [];
    currentPage: number;
    maxPages: number;

    ngOnInit() {
      this.currentPage = 1;
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService){}

    updateList(id: number, property: string, event: any) {
      // const editField = event.target.textContent;
      // if(property === 'cost_per_package')
      // {
      //   this.ingredientList[id][property] = parseFloat(editField).toFixed(2);
      // }
      // else{
      //   this.ingredientList[id][property] = editField;
      // }
    }

    remove(deleted_name: any) {
      // this.crudIngredientsService.remove({
      //     name : deleted_name
      //   }).subscribe(
      //   response => this.handleResponse(response),
      //   err => {
      //     if (err.status === 401) {
      //       console.log("401 Error")
      //     }
      //   }
      // );
    }

    edit(name:any, property:string, event:any) {
      // var editedIngredient : Ingredient = new Ingredient();
      // var newName : string;
      // editedIngredient.name = name;
      // switch(property){
      //   case 'name':{
      //     newName = event.target.textContent; //new name
      //     editedIngredient.name = event.target.textContent;//old name
      //   }
      //   case 'id':{
      //     editedIngredient.id = event.target.textContent;
      //   }
      //   case 'vendor_info':{
      //     editedIngredient.vendor_info = event.target.textContent;
      //   }
      //   case 'package_size':{
      //     editedIngredient.package_size = event.target.textContent;
      //   }
      //   case 'cost_per_package':{
      //     editedIngredient.cost_per_package = event.target.textContent;
      //   }
      //   case 'comment':{
      //     editedIngredient.comment = event.target.textContent;
      //   }
      // }
      // this.crudIngredientsService.edit({
      //     name : editedIngredient.name,
      //     newname: newName,
      //     number : editedIngredient.id,
      //     vendor_info : editedIngredient.vendor_info,
      //     package_size: editedIngredient.package_size,
      //     cost : editedIngredient.cost_per_package,
      //     comment : editedIngredient.comment
      //   }).subscribe(
      //   response => this.handleResponse(response),
      //   err => {
      //     if (err.status === 401) {
      //       console.log("401 Error")
      //     }
      //   });
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

    refresh(){
      // this.filterIngredientsService.filter({
      //     sortBy : this.sortBy,
      //     pageNum: this.currentPage.toString(),
      //     keywords: this.keywords,
      //     skus : []
      //   }).subscribe(
      //   response => this.handleRefreshResponse(response),
      //   err => {
      //     if (err.status === 401) {
      //       console.log("401 Error")
      //     }
      //   }
      // );
    }

    // handleRefreshResponse(response: FilterResponse){
    //   if(response.success){
    //     this.ingredientList = [];
    //     for(let ingredient of response.data){
    //       this.ingredientList.push({
    //           id: ingredient.number,
    //           name: ingredient.name,
    //           vendor_info: ingredient.vendor_info,
    //           package_size: ingredient.package_size,
    //           cost_per_package: ingredient.cost,
    //           comment: ingredient.comment
    //       });
    //     }
    //     this.maxPages = response.pages;
    //   }
    // }

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
}
