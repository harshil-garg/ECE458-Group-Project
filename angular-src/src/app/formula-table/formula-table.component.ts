import { Component, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import { Formula } from '../model/formula'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { MeasurementUnit } from '../model/measurement-unit'
import { CrudFormulaService, Response } from './crud-formula.service';
import { FilterFormulaService, FilterResponse } from './filter-formula.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort, MatFormField} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ExportService } from '../export.service';

@Component({
  selector: 'formula-table',
  templateUrl: './formula-table.component.html',
  styleUrls: ['./formula-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FormulaTableComponent implements OnInit{

    measUnits: Array<any>;
    editField: string;
    formulaList: Array<any> = [];
    sortBy: string = "name";
    keywords: Array<any> = [];
    ingredients: Array<any> = [];
    ingredientInput: string = "";
    unitInput: string = "";
    quantityInput: string = "";

    displayedColumns: string[] = ['select', 'name', 'number', 'ingredient_tuples', 'comment', 'sku_dropdown'];
    selection = new SelectionModel<Formula>(true, []);
    dataSource = new MatTableDataSource<Formula>(this.formulaList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    liveEditing: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChildren(MatFormField) formFields: QueryList<MatFormField>;

    //skuShown: Array<boolean> = [false];
    expandedFormula;

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

    constructor(private authenticationService: AuthenticationService, public crudFormulaService: CrudFormulaService,
      public filterFormulaService: FilterFormulaService, private snackBar: MatSnackBar, private exportService: ExportService){}

    remove() {
      for(let selected of this.selection.selected){
        var deleted_name = selected.name;
        this.crudFormulaService.remove({
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

    edit(id:any, property:string, updated_value:any) {
      if(this.isEditable()){
        var editedFormula : Formula = new Formula();
        var newnumber : string;
        editedFormula.number = id;
        switch(property){
          case 'name':{
            editedFormula.name = updated_value; //new name
            break;
          }
          case 'id':{
            newnumber = updated_value;
            break;
          }
          case 'tuple':{
            editedFormula.ingredient_tuples = updated_value;
            break;
          }
          case 'comment':{
            editedFormula.comment = updated_value;
            break;
          }
        }
        this.crudFormulaService.edit({
            name : editedFormula.name,
            number : editedFormula.number.toString(),
            newnumber: newnumber,
            ingredient_tuples: editedFormula.ingredient_tuples,
            comment : editedFormula.comment
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

    refresh(){
      this.loadingResults = true;
      var pageIndex : number = this.paginator.pageIndex+1;
      this.filterFormulaService.filter({
          sortBy : this.sortBy,
          pageNum: pageIndex.toString(),
          page_size: this.paginator.pageSize,
          keywords: this.keywords,
          ingredients : this.ingredients
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
      console.log("RESPONSE");
      if(response.success){
        console.log(response);
        this.formulaList = [];
        for(let formula of response.data){
          this.formulaList.push({
              id: formula.number,
              name: formula.name,
              ingredient_tuples: formula.ingredient_tuples,
              comment: formula.comment,
              skus: formula.skus
          });
        }
        this.dataSource.data = this.formulaList;
        this.totalDocs = response.total_docs;
        this.maxPages = response.pages;
        this.loadingResults = false;
      }
      this.formFields.changes.subscribe((change) => {
        change.forEach(form => {
          form.underlineRef.nativeElement.className = null;
        });
      });
    }

    setSortBy(property: string){
      this.sortBy = property;
      this.refresh();
    }

    setKeywords(newKeywords : Array<any>){
      this.keywords = newKeywords;
      this.paginator.pageSize = 10;
      this.refresh();
    }

    setSearchedIngredients(newIngredients : Array<any>){
      this.ingredients = newIngredients;
      this.refresh();
    }

    isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }

    removeIngrQuant(ingr_id:number, formula_id:number){
      var listId = this.formulaList.findIndex(element=>{
        return element.id == formula_id;
      });
      var ingredient_tuples = this.formulaList[listId].ingredient_tuples;
      ingredient_tuples.splice(ingr_id, 1);
      this.edit(formula_id, 'tuple', ingredient_tuples);
    }

/** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      this.isAllSelected() ?
          this.selection.clear() :
          this.dataSource.data.forEach(row => this.selection.select(row));
    }

    isEditable(){
      return this.canUpdate() && this.liveEditing;
    }

    export(){
      this.crudFormulaService.export({
        sortBy : this.sortBy,
        keywords: this.keywords,
        ingredients : this.ingredients,
      }).subscribe(
      response => this.handleExport(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
          }
        }
      );
    }

    handleExport(response){
      const headers = ['Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
      this.exportService.exportJSON(headers, response.data, 'formulas');
    }

    setIngredientInput(event){
      this.ingredientInput = event;
    }

    updateUnit(ev){
      this.unitInput = ev.unit;
      this.quantityInput = ev.quantity;
    }

    addIngredientQuantity(id){
      if(this.isEditable){
        var added_ingr_quant = {
          ingredient: this.ingredientInput,
          quantity: +this.quantityInput,
          unit: this.unitInput
        }
        for(let formula of this.formulaList){
          if(formula.id == id){
            formula.ingredient_tuples.push(added_ingr_quant);
            this.edit(id, 'tuple', formula.ingredient_tuples);
          }
        }
        this.ingredientInput = '';
        this.quantityInput = '';
      }
    }

    getNumSkus(formula){
      return formula.skus.length;
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

    isAnalyst() {
      return this.authenticationService.isAnalyst();
    }

    isProductManager() {
      return this.authenticationService.isProductManager();
    }

    isBusinessManager() {
      return this.authenticationService.isBusinessManager();
    }

    isPlantManager() {
      return this.authenticationService.isPlantManager();
    }

    isAdmin() {
      return this.authenticationService.isAdmin();
    }

    canUpdate() {
      return this.isAdmin() || this.isProductManager();
    }
}
