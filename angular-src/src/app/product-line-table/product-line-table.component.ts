import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductLine } from '../model/product-line'
import { AuthenticationService } from '../authentication.service'
import { CrudProductLineService, Response, ReadResponse } from './crud-product-line.service'
import {MatTableDataSource, MatPaginator, MatSnackBar} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import { ExportService } from '../export.service';

@Component({
  selector: 'app-product-line-table',
  templateUrl: './product-line-table.component.html',
  styleUrls: ['./product-line-table.component.css'],
})
export class ProductLineTableComponent implements OnInit{
    editField: string;
    productLineList: Array<any> = [];
    displayedColumns: string[] = ['select', 'name'];
    selection = new SelectionModel<ProductLine>(true, []);
    dataSource = new MatTableDataSource<ProductLine>(this.productLineList);
    maxPages: number;
    totalDocs: number;
    loadingResults: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    ngOnInit() {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
      this.paginator.page.subscribe(x => this.refresh());
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudProductLineService: CrudProductLineService, private snackBar: MatSnackBar, private exportService: ExportService){}

    remove() {
      for(let selected of this.selection.selected){
        var deleted_name = selected.name;
        this.crudProductLineService.remove({
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
      var editedProductLine : ProductLine = new ProductLine();
      var newName : string;
      editedProductLine.name = name;
      switch(property){
        case 'name':{
          newName = updated_value; //new name
        }
      }
      this.crudProductLineService.edit({
          name : editedProductLine.name,
          newname: newName
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

    private handleError(response){
      this.snackBar.open(response.message, "Close", {duration:3000});
      this.refresh();//refresh changes back to old value
    }

    private handleResponse(response: Response) {
      console.log(response);
      //refreshing every time gets rid of active element
      //this.refresh();
    }

    isAdmin() {
      return this.authenticationService.loginState.isAdmin;
    }

    refresh(){
      this.loadingResults = true;
      this.crudProductLineService.read({
          pageNum: this.paginator.pageIndex+1,
          page_size: this.paginator.pageSize
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
        console.log(response);
        this.productLineList = [];
        for(let productLine of response.data){
          this.productLineList.push({
              name: productLine.name
          });
        }
        this.dataSource.data = this.productLineList;
        this.totalDocs = response.total_docs;
        this.maxPages = response.pages
        this.loadingResults = false;
      }
    }

    export(){
      this.crudProductLineService.export({
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
      // var csvResponseData : Array<any>;
      // if(response.success){
      //   csvResponseData = [];
      //   for(let csv_data of response.data){
      //     csvResponseData.push({
      //       "Name": csv_data["Name"]==undefined ? "" : csv_data["Name"]
      //     });
      //   }
      //   console.log(csvResponseData);
      //   var csvContent = "data:text/csv;charset=utf-8,";
      //   csvContent += "Name" + "\r\n";
      //   csvResponseData.forEach(function(response) {
      //     csvContent += response["Name"]+"\r\n";
      //   });
      //   var encodedUri = encodeURI(csvContent);
      //   window.open(encodedUri);
      // }
      const headers = ['Name'];
      this.exportService.exportJSON(headers, response.data, 'product_lines');
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
