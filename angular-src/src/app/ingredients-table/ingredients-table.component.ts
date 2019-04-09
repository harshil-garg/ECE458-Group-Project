import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Ingredient } from '../model/ingredient'
import { HttpResponse } from '@angular/common/http';
import { MeasurementUnit } from '../model/measurement-unit'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { CrudIngredientsService, Response } from './crud-ingredients.service';
import { FilterIngredientsService, FilterResponse, IngredientCsvData } from './filter-ingredients.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort, MatFormField} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ExportService } from '../export.service';

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

    measUnits: Array<any>;
    editField: string;
    ingredientList: Array<any> = [];
    sortBy: string = "name";
    keywords: Array<any> = [];
    skus: Array<any> = [];

    displayedColumns: string[] = ['select', 'name', 'number', 'vendor_info', 'package_size', 'cost', 'comment', 'num_skus'];
    selection = new SelectionModel<Ingredient>(true, []);
    dataSource = new MatTableDataSource<Ingredient>(this.ingredientList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    liveEditing: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChildren(MatFormField) formFields: QueryList<MatFormField>;

    //skuShown: Array<boolean> = [false];
    expandedIngredient;

    ngOnInit() {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => {
        this.selection.clear();
        this.refresh();
      });
      this.sort.sortChange.subscribe(x => {
        this.sortBy = x.active;
        this.refresh();
        this.paginator.pageIndex = 0; //reset page to 0 when sort by new field
      });
      this.measUnits = MeasurementUnit.values();
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudIngredientsService: CrudIngredientsService,
      public filterIngredientsService: FilterIngredientsService, private snackBar: MatSnackBar, public exportService: ExportService){}

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
      if(this.isEditable()){
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
            editedIngredient.unit = updated_value.unit;
            editedIngredient.package_size = updated_value.quantity;
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
            unit: editedIngredient.unit,
            package_size: Number(editedIngredient.package_size),
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
    }

    private handleError(response){
      this.snackBar.open(response.message, "Close", {duration:3000});
      this.refresh();//refresh changes back to old value
    }

    private handleResponse(response: Response) {
      this.snackBar.open(response.message, "Close", {duration:1000});
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
      return this.authenticationService.isAdmin();
    }

    getNumSkus(ingredient: Ingredient){
      return ingredient.skus.length;
    }

    refresh(){
      this.loadingResults = true;
      var pageIndex : number = this.paginator.pageIndex+1
      console.log("REFRESH");
      console.log(this.paginator.pageIndex.toString());
      this.filterIngredientsService.filter({
          sortBy : this.sortBy,
          pageNum: pageIndex.toString(),
          page_size: this.paginator.pageSize,
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
      console.log("REFRESH RESPONSEEEE");
      console.log(response);
      if(response.success){
        this.ingredientList = [];
        for(let ingredient of response.data){
          this.ingredientList.push({
              id: ingredient.number,
              name: ingredient.name,
              vendor_info: ingredient.vendor_info,
              package_size: ingredient.package_size,
              unit: ingredient.unit,
              cost_per_package: ingredient.cost,
              skus: ingredient.skus,
              comment: ingredient.comment
          });
        }
        this.dataSource.data = this.ingredientList;
        this.totalDocs = response.total_docs;
        this.maxPages = response.pages;
        this.loadingResults = false;
      }
      this.formFields.changes.subscribe((change) => {
        change.forEach(form => {
          // if(this.isEditable()){
          //   form.underlineRef.nativeElement.className = "mat-form-field-underline";
          // }
          // else {
            form.underlineRef.nativeElement.className = null;
          // }
        });
      });
    }

    setKeywords(newKeywords : Array<any>){
      this.keywords = newKeywords;
      this.paginator.pageSize = 10;
      this.refresh();
    }

    setSearchedSkus(newSkus : Array<any>){
      this.skus = newSkus;
      this.paginator.pageSize = 10;
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
      const headers = ['Ingr#', 'Name', 'Vendor Info', 'Size', 'Cost', 'Comment'];
      this.exportService.exportJSON(headers, response.data, 'ingredients');
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

    isEditable(){
      return this.isAdmin() && this.liveEditing;
    }

    addUnderline(form){
      if(this.isEditable()){
        form.underlineRef.nativeElement.className = "mat-form-field-underline";
      }
    }

    removeUnderline(form){
      if(this.isEditable()){
        form.underlineRef.nativeElement.className = null;
      }
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
