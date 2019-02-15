import { Component, OnInit, ViewChild } from '@angular/core';
import { Ingredient } from '../model/ingredient'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { CrudIngredientsService, Response } from './crud-ingredients.service';
import { FilterIngredientsService, FilterResponse, IngredientCsvData } from './filter-ingredients.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'ingredients-table',
  templateUrl: './ingredients-table.component.html',
  styleUrls: ['./ingredients-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class IngredientsTableComponent implements OnInit{

    editField: string;
    ingredientList: Array<any> = [];
    sortBy: string = "name";
    keywords: Array<any> = [];
    skus: Array<any> = [];

    displayedColumns: string[] = ['select', 'name', 'number', 'vendor_info', 'package_size', 'cost_per_package', 'comment', 'num_skus'];
    selection = new SelectionModel<Ingredient>(true, []);
    dataSource = new MatTableDataSource<Ingredient>(this.ingredientList);
    maxPages: number;
    loadingResults: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    //skuShown: Array<boolean> = [false];
    expandedIngredient;

    ngOnInit() {
      this.paginator.pageIndex = 0
      this.paginator.page.subscribe(x => this.refresh());
      this.sort.sortChange.subscribe(x => {
        this.sortBy = x.active;
        this.refresh();
      });
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudIngredientsService: CrudIngredientsService,
      public filterIngredientsService: FilterIngredientsService, private snackBar: MatSnackBar){}

    remove() {
      for(let selected of this.selection.selected){
        var deleted_name = selected.name;
        this.crudIngredientsService.remove({
            name : deleted_name
          }).subscribe(
          response => {
            if(response.success){
              this.handleResponse(response);
              this.refresh();
            }
            else{
              this.handleError(response);
            }
          },
          err => {
            if (err.status === 401) {
              console.log("401 Error")
            }
          }
        );
      }
      this.selection.clear();
    }

    edit(name:any, property:string, updated_value:any) {
      var editedIngredient : Ingredient = new Ingredient();
      var newName : string;
      editedIngredient.name = name;
      switch(property){
        case 'name':{
          newName = updated_value; //new name
          break;
        }
        case 'id':{
          editedIngredient.id = updated_value;
          break;
        }
        case 'vendor_info':{
          editedIngredient.vendor_info = updated_value;
          break;
        }
        case 'package_size':{
          editedIngredient.package_size = updated_value;
          break;
        }
        case 'cost_per_package':{
          editedIngredient.cost_per_package = updated_value;
          break;
        }
        case 'comment':{
          editedIngredient.comment = updated_value;
          break;
        }
      }
      this.crudIngredientsService.edit({
          name : editedIngredient.name,
          newname: newName,
          number : editedIngredient.id,
          vendor_info : editedIngredient.vendor_info,
          package_size: editedIngredient.package_size,
          cost : editedIngredient.cost_per_package*1,
          comment : editedIngredient.comment
        }).subscribe(
        response => {
          if(response.success){
            this.handleResponse(response);
          }
          else{
            this.handleError(response);
          }
        },
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        });
    }

    private handleError(response){
      this.snackBar.open(response.message, "Close", {duration:3000});
      this.refresh();//refresh changes back to old value
    }

    private handleResponse(response: Response) {
      console.log(response);
      //don't refresh for edits
      //this.refresh();
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
      return ingredient.skus.length;
    }

    refresh(){
      this.loadingResults = true;
      this.filterIngredientsService.filter({
          sortBy : this.sortBy,
          pageNum: this.paginator.pageIndex.toString()+1,
          keywords: this.keywords,
          skus : this.skus
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
              skus: ingredient.skus,
              comment: ingredient.comment
          });
        }
        this.dataSource.data = this.ingredientList;
        this.maxPages = response.pages;
        this.loadingResults = false;
      }
    }

    setSortBy(property: string){
      this.sortBy = property;
      this.refresh();
    }

    setKeywords(newKeywords : Array<any>){
      this.keywords = newKeywords;
      this.refresh();
    }

    setSearchedSkus(newSkus : Array<any>){
      this.skus = newSkus;
      this.refresh();
    }

    export(){
      this.filterIngredientsService.export({
        sortBy : this.sortBy,
      	keywords: this.keywords,
      	skus : this.skus
      }).subscribe(
      response => this.handleExportResponse(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
          }
        }
      );
    }

    handleExportResponse(response){
      var csvResponseData : Array<any>;
      if(response.success){
        csvResponseData = [];
        for(let csv_data of response.data){
          csvResponseData.push({
            "Ingr#": csv_data["Ingr#"]==undefined ? "" : csv_data["Ingr#"],
            "Name": csv_data["Name"]==undefined ? "" : csv_data["Name"],
            "Vendor Info": csv_data["Vendor Info"]==undefined ? "" : csv_data["Vendor Info"],
            "Size": csv_data["Size"]==undefined ? "" : csv_data["Size"],
            "Cost": csv_data["Cost"]==undefined ? "" : csv_data["Cost"],
            "Comment": csv_data["Comment"]==undefined ? "" : csv_data["Comment"]
          });
          console.log(csv_data);
        }
        console.log(csvResponseData);
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += ["Ingr#", "Name", "Vendor Info", "Size", "Cost", "Comment"].join(",") + "\r\n";
        csvResponseData.forEach(function(response) {
          csvContent += response["Ingr#"]+","+response["Name"]+","+response["Vendor Info"]+","+response["Size"]+","+response["Cost"]+","+response["Comment"]+"\r\n";
        });
        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
      }
    }

    isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }

/** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.dataSource.data.forEach(row => this.selection.select(row));
    }

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
