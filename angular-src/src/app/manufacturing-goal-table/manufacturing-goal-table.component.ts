import { Component, OnInit, ViewChild } from '@angular/core';
import { ManufacturingGoal } from '../model/manufacturing-goal'
import { AuthenticationService } from '../authentication.service'
import { ManufacturingGoalService, RefreshResponse } from './manufacturing-goal.service';
import {MatTableDataSource, MatPaginator, MatSnackBar} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-manufacturing',
  templateUrl: './manufacturing-goal-table.component.html',
  styleUrls: ['./manufacturing-goal-table.component.css']
})
export class ManufacturingGoalTableComponent implements OnInit {

  manufGoalList: Array<any> = [];
  displayedColumns: string[] = ['select', 'name', 'skus', 'deadline'];
  selection = new SelectionModel<ManufacturingGoal>(true, []);
  dataSource = new MatTableDataSource<ManufacturingGoal>(this.manufGoalList);
  maxPages: number;
  totalDocs: number;
  loadingResults: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private authenticationService: AuthenticationService, public manufacturingService: ManufacturingGoalService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.paginator.page.subscribe(x => this.refresh());
    this.refresh();
  }

  refresh() {
    this.loadingResults = true;
      this.manufacturingService.refresh({
          sortBy : "name",
          page_size: this.paginator.pageSize,
          pageNum: this.paginator.pageIndex+1,
          user : this.authenticationService.loginState.user
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

  handleRefreshResponse(response: RefreshResponse){
    console.log(response);
    if(response.success){
      this.manufGoalList = [];
      for(let manufGoal of response.data){
        this.manufGoalList.push({
            name: manufGoal.name,
            sku_tuples: manufGoal.sku_tuples,
            deadline: manufGoal.deadline,
        });
      }
      this.dataSource.data = this.manufGoalList;
      this.totalDocs = response.total_docs;
      this.maxPages = response.pages;
      this.loadingResults = false;
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
