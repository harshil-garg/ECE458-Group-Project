import { Component, OnInit } from '@angular/core';
import { ProductLine } from '../model/product-line'
import { AuthenticationService } from '../authentication.service'
import { CrudProductLineService, Response, ReadResponse } from './crud-product-line.service'

@Component({
  selector: 'app-product-line-table',
  templateUrl: './product-line-table.component.html',
  styleUrls: ['./product-line-table.component.css'],
})
export class ProductLineTableComponent implements OnInit{
    editField: string;
    productLineList: Array<any> = [];
    currentPage: number;
    maxPages: number;

    ngOnInit() {
      this.currentPage = 1;
      this.refresh();
    }

    constructor(private authenticationService: AuthenticationService, public crudProductLineService: CrudProductLineService){}

    updateList(id: number, property: string, event: any) {
      const editField = event.target.textContent;
      if(property === 'cost_per_package')
      {
        this.productLineList[id][property] = parseFloat(editField).toFixed(2);
      }
      else{
        this.productLineList[id][property] = editField;
      }
    }

    remove(deleted_name: any) {
      this.crudProductLineService.remove({
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
      var editedProductLine : ProductLine = new ProductLine();
      var newName : string;
      editedProductLine.name = name;
      switch(property){
        case 'name':{
          newName = event.target.textContent; //new name
        }
      }
      this.crudProductLineService.edit({
          name : editedProductLine.name,
          newname: newName
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

    refresh(){
      this.crudProductLineService.read({
          pageNum: this.currentPage
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
        this.productLineList = [];
        for(let productLine of response.data){
          this.productLineList.push({
              name: productLine.name
          });
        }
        this.maxPages = response.pages;
      }
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
      var csvResponseData : Array<any>;
      if(response.success){
        csvResponseData = [];
        for(let csv_data of response.data){
          csvResponseData.push({
            "Name": csv_data["Name"]
          });
        }
        console.log(csvResponseData);
      }
    }
}
