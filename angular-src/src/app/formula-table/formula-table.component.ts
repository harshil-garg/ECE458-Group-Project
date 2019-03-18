import { Component, OnInit, ViewChild } from '@angular/core';
import { Formula } from '../model/formula'
import { AuthenticationService } from '../authentication.service'
import { Sku } from '../model/sku'
import { MeasurementUnit } from '../model/measurement-unit'
import { CrudFormulaService, Response } from './crud-formula.service';
import { FilterFormulaService, FilterResponse } from './filter-formula.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

    displayedColumns: string[] = ['select', 'name', 'number', 'ingredient_tuples', 'comment'];
    selection = new SelectionModel<Formula>(true, []);
    dataSource = new MatTableDataSource<Formula>(this.formulaList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    //skuShown: Array<boolean> = [false];
    expandedFormula;

    ngOnInit() {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => this.refresh());
      this.sort.sortChange.subscribe(x => {
        this.sortBy = x.active;
        this.refresh();
        this.paginator.pageIndex = 0; //reset page to 0 when sort by new field
      });
      this.measUnits = MeasurementUnit.values();
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudFormulaService: CrudFormulaService,
      public filterFormulaService: FilterFormulaService, private snackBar: MatSnackBar){}

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
        case 'comment':{
          editedFormula.comment = updated_value;
          break;
        }
      }
      this.crudFormulaService.edit({
          name : editedFormula.name,
          number : editedFormula.number.toString(),
          newnumber: newnumber,
          ingredient_tuples: undefined,
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

    private handleError(response){
      this.snackBar.open(response.message, "Close", {duration:3000});
      this.refresh();//refresh changes back to old value
    }

    private handleResponse(response: Response) {
      console.log(response);
      //don't refresh for edits
      //this.refresh();
    }

    isAdmin() {
      return this.authenticationService.loginState.isAdmin;
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
              comment: formula.comment
          });
        }
        this.dataSource.data = this.formulaList;
        this.totalDocs = response.total_docs;
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

    setSearchedIngredients(newIngredients : Array<any>){
      this.ingredients = newIngredients;
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
