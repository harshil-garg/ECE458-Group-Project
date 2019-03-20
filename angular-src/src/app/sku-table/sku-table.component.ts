import { Component, OnInit, ViewChild } from '@angular/core';
import { Ingredient, Tuple } from '../model/ingredient'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { Formula } from '../model/formula'
import { CrudSkuService, Response } from './crud-sku.service';
import { CrudFormulaService } from '../formula-table/crud-formula.service';
import { FilterSkuService, FilterResponse } from './filter-sku.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import { ExportService } from '../export.service';

@Component({
  selector: 'sku-table',
  templateUrl: './sku-table.component.html',
  styleUrls: ['./sku-table.component.css'],
})
export class SkuTableComponent implements OnInit{
    editField: string;
    skuList: Array<any> = [];
    sortBy: string = "name";
    keywords: Array<any> = [];
    ingredients: Array<any> = [];
    productLines: Array<any> = [];

    displayedColumns: string[] = ['select', 'name', 'number', 'case_upc', 'unit_upc', 'unit_size', 'count_per_case', 'product_line', 'formula', 'formula_scale_factor', 'manufacturing_lines', 'manufacturing_rate', 'setup_cost', 'run_cost', 'comment'];
    selection = new SelectionModel<Sku>(true, []);
    dataSource = new MatTableDataSource<Sku>(this.skuList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    ngOnInit() {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => this.refresh());
      this.sort.sortChange.subscribe(x => {
        this.sortBy = x.active;
        this.refresh();
        this.paginator.pageIndex = 0; //reset page to 0 when sort by new field
      });
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudSkuService: CrudSkuService, public crudFormulaService: CrudFormulaService,
      public filterSkuService: FilterSkuService, private snackBar: MatSnackBar, private exportService: ExportService){}

    remove() {
      for(let selected of this.selection.selected){
        var deleted_number = selected.id;
        this.crudSkuService.remove({
            number : deleted_number
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

    edit(num:any, property:string, updated_value:any) {
      var editedSku : Sku = new Sku();
      var formula : Formula = new Formula();
      editedSku.formula = formula;
      var newNumber : number;
      editedSku.id = num*1;
      switch(property){
        case 'name':{
          editedSku.name = updated_value;
          break;
        }
        case 'id':{
          newNumber = updated_value*1;
          break;
        }
        case 'case_upc':{
          editedSku.case_upc = updated_value;
          break;
        }
        case 'unit_upc':{
          editedSku.unit_upc = updated_value;
          break;
        }
        case 'unit_size':{
          editedSku.unit_size = updated_value;
          break;
        }
        case 'count_per_case':{
          editedSku.count_per_case = updated_value;
          break;
        }
        case 'product_line':{
          editedSku.product_line = updated_value;
          break;
        }
        case 'formula':{
          editedSku.formula = updated_value;
          break;
        }
        case 'ingredient_quantity':{
          //editedSku.ingredient_quantity = updated_value;
          break;
        }
        case 'comment':{
          editedSku.comment = updated_value;
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
          formula: editedSku.formula.name,
          formula_scale_factor: editedSku.formula_scale_factor,
          manufacturing_lines: editedSku.manufacturing_lines,
          manufacturing_rate: editedSku.manufacturing_rate,
          setup_cost: editedSku.setup_cost,
          run_cost: editedSku.run_cost,
          comment: editedSku.comment
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

    updateFormula(id:number, updated_value:Formula) {
      var editedFormula : Formula = updated_value;
      this.crudFormulaService.edit({
          name : editedFormula.name,
          number : editedFormula.number.toString(),
          newnumber: editedFormula.number.toString(),
          ingredient_tuples: editedFormula.ingredient_tuples,
          comment : editedFormula.comment
        }).subscribe(
        response => {
          if(response.success){
            console.log("FOMRULA SUCCESS");
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
        formula: editedSku.formula.name,
        formula_scale_factor: editedSku.formula_scale_factor,
        manufacturing_lines: editedSku.manufacturing_lines,
        manufacturing_rate: editedSku.manufacturing_rate,
        setup_cost: editedSku.setup_cost,
        run_cost: editedSku.run_cost,
        comment: editedSku.comment
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

    addIngredientQuantity(num:any, id:number, ingr_quant: Tuple){
      var editedSku : Sku = new Sku();
      editedSku.formula = new Formula();
      var ingr_quant_list: Array<any> = this.skuList[id].formula.ingredient_tuples;
      editedSku.id = num*1;
      ingr_quant_list.push(ingr_quant);
      editedSku.formula.ingredient_tuples = ingr_quant_list;
      this.updateIngredientQuantity(editedSku);
    }

    removeIngrQuant(ingr_id:number, id:number, sku_id:number){
      var editedSku : Sku = new Sku();
      var ingr_quant_list: Array<any>;// = this.skuList[id].ingredient_quantity;
      editedSku.id = sku_id*1;
      ingr_quant_list.splice(ingr_id, 1);
      //editedSku.ingredient_quantity = ingr_quant_list;
      this.updateIngredientQuantity(editedSku);
    }

    private handleResponse(response) {
      console.log(response);
      //don't refresh b/c deselects focused item
      //this.refresh();
    }

    changeValue(id: number, property: string, event: any) {
      this.editField = event.target.textContent;
    }

    isAdmin() {
      return this.authenticationService.loginState.isAdmin;
    }

    refresh(){
      this.loadingResults = true;
      var pageIndex : number = this.paginator.pageIndex+1;
      this.filterSkuService.filter({
          sortBy : this.sortBy,
          pageNum: pageIndex.toString(),
          page_size: this.paginator.pageSize,
          keywords: this.keywords,
          ingredients: this.ingredients,
          product_lines: this.productLines
        }).subscribe(
        response => {
          if(response.success){
            this.handleRefreshResponse(response);
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

    handleRefreshResponse(response: FilterResponse){
      console.log(response.success);
      console.log(response);
      if(response.success){
        this.skuList = [];
        for(let sku of response.data){
          var formula = new Formula();
          formula.name = sku.formula.name;
          formula.number = sku.formula.number;
          formula.comment = sku.formula.comment;
          formula.ingredient_tuples = sku.formula.ingredient_tuples;
          var manufLines = [];
          sku.manufacturing_lines.forEach(manufLine => manufLines.push(manufLine.name));
          this.skuList.push({
              id: sku.number,
              name: sku.name,
              case_upc: sku.case_upc,
              unit_upc: sku.unit_upc,
              unit_size: sku.size,
              count_per_case: sku.count,
              product_line: sku.product_line,
              formula: formula,
              formula_scale_factor: sku.formula_scale_factor,
              manufacturing_lines: manufLines,
              manufacturing_rate: sku.manufacturing_rate,
              setup_cost: sku.setup_cost,
              run_cost: sku.run_cost,
              comment: sku.comment
          });
        }
        console.log("SKULIST:");
        console.log(this.skuList);
        this.dataSource.data = this.skuList;
        this.totalDocs = response.total_docs;
        this.maxPages = response.pages;
        this.loadingResults = false;
      }
    }

    exportSkus(){
      this.filterSkuService.exportSkus({
        sortBy : this.sortBy,
        keywords: this.keywords,
        ingredients : [],//this.ingredients,
        product_lines : this.productLines
      }).subscribe(
      response => this.handleExportSkusResponse(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
          }
        }
      );
    }

    handleExportSkusResponse(response){
      const headers = ['SKU#', 'Name', 'Case UPC', 'Unit UPC', 'Unit size', 'Count per case', 'PL Name', 'Formula#' , 'Formula factor', 'ML Shortnames', 'Rate', 'Comment'];
      this.exportService.exportJSON(headers, response.data, 'skus');
    }

    // handleExportSkusResponse(response){
    //   var csvResponseData : Array<any>;
    //   console.log(response);
    //   if(response.success){
    //     csvResponseData = [];
    //     for(let csv_data of response.data){
    //       csvResponseData.push({
    //         "SKU#"​: csv_data["SKU#"]==undefined ? "" : csv_data["SKU#"],
    //         "Name": csv_data["Name"]==undefined ? "" : csv_data["Name"],
    //         "Case UPC": csv_data["Case UPC"]==undefined ? "" : csv_data["Case UPC"],
    //         "Unit UPC": csv_data["Unit UPC"]==undefined ? "" : csv_data["Unit UPC"],
    //         "Unit size": csv_data["Unit size"]==undefined ? "" : csv_data["Unit size"],
    //         "Count per case": csv_data["Count per case"]==undefined ? "" : csv_data["Count per case"],
    //         "Product Line Name": csv_data["Product Line Name"]==undefined ? "" : csv_data["Product Line Name"],
    //         "Comment": csv_data["Comment"]==undefined ? "" : csv_data["Comment"]
    //       });
    //     }
    //     console.log(csvResponseData);
    //     var csvContent = "data:text/csv;charset=utf-8,";
    //     csvContent += ["SKU#", "Name", "Case UPC", "Unit UPC", "Unit size", "Count per case", "Product Line Name", "Comment"].join(",") + "\r\n";
    //     csvResponseData.forEach(function(response) {
    //       csvContent += response["SKU#"]+","+response["Name"]+","+response["Case UPC"]+","+response["Unit UPC"]+","+response["Unit size"]+","+response["Count per case"]+","+response["Product Line Name"]+","+response["Comment"]+"\r\n";
    //     });
    //     var encodedUri = encodeURI(csvContent);
    //     window.open(encodedUri);
    //   }
    // }

    exportFormulas(){
      this.filterSkuService.exportFormulas({
        sortBy : this.sortBy,
        keywords: this.keywords,
        ingredients : this.ingredients,
        product_lines : this.productLines
      }).subscribe(
      response => this.handleExportFormulasResponse(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
          }
        }
      );
    }

    handleExportFormulasResponse(response){
      const headers = ['Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
      this.exportService.exportJSON(headers, response.data, 'formulas');
    }

    setKeywords(newKeywords : Array<any>){
      this.keywords = newKeywords;
      this.refresh();
    }

    setSearchedIngredients(newIngredients : Array<any>){
      this.ingredients = newIngredients;
      this.refresh();
    }

    setSearchedProductLines(newProductLines : Array<any>){
      this.productLines = newProductLines;
      this.refresh();
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
//     { name: 'Fruit Kebob', id:2, case_upc: 120394876276, unit_upc: 618273945714, unit_size: 15, count_per_case:12, product_line: "Dole", ingredient_quantity: {}, comment: 'Hello world 2' },
//   ];
//   return this.skuList;
// }
