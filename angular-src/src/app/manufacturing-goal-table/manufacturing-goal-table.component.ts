import { Component, OnInit, ViewChild } from '@angular/core';
import { ManufacturingGoal } from '../model/manufacturing-goal'
import { AuthenticationService } from '../authentication.service'
import { ManufacturingGoalService, RefreshResponse } from './manufacturing-goal.service';
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-manufacturing',
  templateUrl: './manufacturing-goal-table.component.html',
  styleUrls: ['./manufacturing-goal-table.component.css']
})
export class ManufacturingGoalTableComponent implements OnInit {

  manufGoalList: Array<any> = [];
  displayedColumns: string[] = ['select', 'name', 'author', 'last_edit', 'skus', 'deadline'];
  selection = new SelectionModel<ManufacturingGoal>(true, []);
  dataSource = new MatTableDataSource<ManufacturingGoal>(this.manufGoalList);
  sortBy: string = 'name'
  maxPages: number;
  totalDocs: number;
  loadingResults: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private authenticationService: AuthenticationService, public manufacturingService: ManufacturingGoalService, private snackBar: MatSnackBar) { }

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
    this.refresh();
  }

  refresh() {
    this.loadingResults = true;
    var pageIndex : number = this.paginator.pageIndex+1;
    this.manufacturingService.refresh({
        sortBy : this.sortBy,
        page_size: this.paginator.pageSize,
        pageNum: pageIndex
      }).subscribe(
      response => {
        if(response.success){
          console.log(response)
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

  handleRefreshResponse(response: RefreshResponse){
    if(response.success){
      this.manufGoalList = response.data;
      this.dataSource.data = this.manufGoalList;
      this.totalDocs = response.total_docs;
      this.maxPages = response.pages;
      this.loadingResults = false;
    }
  }

  delete() {
    for(let selected of this.selection.selected){
      var name = selected.name;
      this.manufacturingService.delete({
          name : name
        }).subscribe(
        response => {
          if(response.success){
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
  }

  private handleError(response){
    this.snackBar.open(response.message, "Close", {duration:3000});
    this.refresh();//refresh changes back to old value
  }

  exportcsv() {
    for(let selected of this.selection.selected){
      var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += ["sku_name", "case_quantity"].join(",") + "\r\n";
      selected.sku_tuples.forEach(function(item) {
        //let row = item.number+","+item.name+","+item.package_size+","+item.cost+","+item.calculated_quantity;
        //csvContent += row + "\r\n";
        console.log(item);
        csvContent += item.sku+","+item.case_quantity+"\r\n";
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

  isAdmin() {
    return this.authenticationService.isAdmin();
  }

  isAnalyst() {
    return this.authenticationService.isAnalyst();
  }

  isBusinessManager() {
    return this.authenticationService.isBusinessManager();
  }

}
