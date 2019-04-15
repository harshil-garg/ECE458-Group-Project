import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ManufacturingLine } from '../model/manufacturing-line'
import { AuthenticationService } from '../authentication.service'
import { CrudManufacturingLineService, Response, ReadResponse } from './crud-manufacturing-line.service'
import {MatTableDataSource, MatPaginator, MatSnackBar, MatFormField} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-manufacturing-line-table',
  templateUrl: './manufacturing-line-table.component.html',
  styleUrls: ['./manufacturing-line-table.component.css'],
})
export class ManufacturingLineTableComponent implements OnInit{
    editField: string;
    manufacturingLineList: Array<any> = [];
    displayedColumns: string[] = ['select', 'name', 'shortname', 'comment'];
    selection = new SelectionModel<ManufacturingLine>(true, []);
    dataSource = new MatTableDataSource<ManufacturingLine>(this.manufacturingLineList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    liveEditing: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChildren(MatFormField) formFields: QueryList<MatFormField>;

    ngOnInit() {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => {
        this.selection.clear();
        this.refresh();
      });
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudManufacturingLineService: CrudManufacturingLineService, private snackBar: MatSnackBar){}

    remove() {
      for(let selected of this.selection.selected){
        var deleted_shortname = selected.shortname;
        this.crudManufacturingLineService.remove({
            shortname : deleted_shortname
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

    edit(shortname:any, property:string, updated_value:any) {
      if(this.isEditable()){
        var editedManufacturingLine : ManufacturingLine = new ManufacturingLine();
        var newshortname : string;
        editedManufacturingLine.shortname = shortname;
        switch(property){
          case 'name':{
            editedManufacturingLine.name = updated_value; //new name
            break;
          }
          case 'shortname':{
            newshortname = updated_value;
            break;
          }
          case 'comment':{
            editedManufacturingLine.comment = updated_value;
            break;
          }
        }
        this.crudManufacturingLineService.edit({
            name : editedManufacturingLine.name,
            shortname: editedManufacturingLine.shortname,
            newshortname: newshortname,
            comment: editedManufacturingLine.comment
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
            };
          });
        }
    }

    private handleError(response){
      this.snackBar.open(response.message, "Close", {duration:3000});
      this.refresh();//refresh changes back to old value
    }

    private handleResponse(response: Response) {
      this.snackBar.open(response.message, "Close", {duration:1000});
    }

    isAdmin() {
      return this.authenticationService.isAdmin();
    }

    refresh(){
      this.loadingResults = true;
      var pageIndex : number = this.paginator.pageIndex+1;
      this.crudManufacturingLineService.read({
          pageNum: pageIndex,
          page_size: this.paginator.pageSize,
          sortBy: "name"
        }).subscribe(
        response => this.handleRefreshResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    handleRefreshResponse(response: ReadResponse){
      if(response.success){
        this.manufacturingLineList = [];
        for(let manufacturingLine of response.data){
          this.manufacturingLineList.push({
              name: manufacturingLine.name,
              shortname: manufacturingLine.shortname,
              comment: manufacturingLine.comment
          });
        }
        this.dataSource.data = this.manufacturingLineList;
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
