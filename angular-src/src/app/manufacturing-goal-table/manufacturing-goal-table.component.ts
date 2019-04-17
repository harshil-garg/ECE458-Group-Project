import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ManufacturingGoal } from '../model/manufacturing-goal'
import { AuthenticationService } from '../authentication.service'
import { ManufacturingGoalService, RefreshResponse } from './manufacturing-goal.service';
import {MatTableDataSource, MatPaginator, MatSnackBar, MatSort, MatFormField, MatDialog} from '@angular/material';
import {SelectionModel} from '@angular/cdk/collections';
import { ExportService } from '../export.service';
import { TupleEditDialogComponent } from './tuple-edit-dialog/tuple-edit-dialog.component';

@Component({
  selector: 'app-manufacturing',
  templateUrl: './manufacturing-goal-table.component.html',
  styleUrls: ['./manufacturing-goal-table.component.css']
})
export class ManufacturingGoalTableComponent implements OnInit {

  manufGoalList: Array<any> = [];
  displayedColumns: string[] = ['select', 'name', 'author', 'last_edit', 'skus', 'deadline', 'enabled'];
  selection = new SelectionModel<ManufacturingGoal>(true, []);
  dataSource = new MatTableDataSource<ManufacturingGoal>(this.manufGoalList);
  sortBy: string = 'name'
  maxPages: number;
  totalDocs: number;
  loadingResults: boolean = false;
  enabled = new SelectionModel<any>(true, [])
  liveEditing: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChildren(MatFormField) formFields: QueryList<MatFormField>;

  constructor(private authenticationService: AuthenticationService, public manufacturingService: ManufacturingGoalService, private snackBar: MatSnackBar, private exportService: ExportService, public dialog: MatDialog) { }

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
      for(let goal of response.data){
        if(goal.enabled){
          this.enabled.select(goal)
        }
      }
    }
    this.formFields.changes.subscribe((change) => {
      change.forEach(form => {
        form.underlineRef.nativeElement.className = null;
      });
    });
  }

  edit(name:any, property:string, updated_value:any) {
    if(this.isEditable()){
      var editedGoal : ManufacturingGoal = new ManufacturingGoal();
      var newname : string;
      editedGoal.name = name;
      switch(property){
        case 'name':{
          newname = updated_value; //new name
          break;
        }
        case 'sku_tuples':{
          editedGoal.sku_tuples = updated_value;
          break;
        }
        case 'deadline':{
          editedGoal.deadline = updated_value;
          break;
        }
      }
      this.manufacturingService.update({
          name : editedGoal.name,
          newname: newname,
          sku_tuples: editedGoal.sku_tuples,
          deadline : editedGoal.deadline
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

  private handleResponse(response) {
    this.snackBar.open(response.message, "Close", {duration:1000});
    //don't refresh for edits
    // this.refresh();
  }

  exportcsv() {
    let headers = ['Name', 'Author', 'Last Edit', 'SKUs', 'Deadline'];
    let data = [];
    for(let selected of this.selection.selected) {
      let row = {};
      row['Name'] = selected['name'];
      row['Author'] = selected['author'];
      row['Last Edit'] = `"${selected['last_edit']}"`;
      let skus = `"`;
      selected.sku_tuples.forEach((item, index) => {
        skus += `${item.sku.name} (${item.sku.number}) : ${item.case_quantity}${index == selected.sku_tuples.length - 1 ? '' : ','}`;
      });
      skus += `"`;
      row['SKUs'] = skus;
      row['Deadline'] = selected.deadline;
      data.push(row);
    }
    this.exportService.exportJSON(headers, data, 'manufacturing_goals');
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

  canUpdate() {
    return this.isAdmin() || this.isBusinessManager();
  }

  isEditable(){
    return this.canUpdate() && this.liveEditing;
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

  toggleEnabled(event, goal){
    if(this.isAdmin() || this.isBusinessManager()){
      let question = this.enabled.isSelected(goal) ? "disable" : "enable"
      event.stopPropagation();

      if(confirm(`Are you sure you would like to ${question} ${goal.name}?`)){
        this.enabled.toggle(goal);

        this.manufacturingService.setEnabled({
          manufacturing_goal: goal,
          enabled: this.enabled.isSelected(goal)
        }).subscribe((response) => {
          if(response.success){
            this.refresh()
          }else{
            this.handleError(response);
          }
        },
        (err) => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        })
      }else{
        event.preventDefault();
      }
    }
  }

  openTupleEditDialog(name: string, tuples){
    let dialogRef = this.dialog.open(TupleEditDialogComponent, {
      height: '600px',
      width: '400px',
      data: {
        tuples: tuples
      }
    });
    dialogRef.afterClosed().subscribe(result =>{
      if(result!=null){
        this.updateTuples(name, result);
      }
    });
  }

  updateTuples(name: string, result) {
    this.edit(name, 'sku_tuples', result);
  }

  increasePageSize() {
    if(this.paginator.pageSize < 10 || this.paginator.pageSize == this.totalDocs){
      this.paginator.pageSize++;
    }
  }

  // updateFormula(id:number, updated_value:Formula) {
  //   var editedFormula : Formula = updated_value;
  //   this.crudFormulaService.edit({
  //       name : editedFormula.name,
  //       number : editedFormula.number.toString(),
  //       newnumber: editedFormula.number.toString(),
  //       ingredient_tuples: editedFormula.ingredient_tuples,
  //       comment : editedFormula.comment
  //     }).subscribe(
  //     response => {
  //       if(response.success){
  //         console.log("FORMULA SUCCESS");
  //         this.handleResponse(response);
  //       }
  //       else{
  //         this.handleError(response);
  //       }
  //     },
  //     err => {
  //       if (err.status === 401) {
  //         console.log("401 Error")
  //       }
  //     });
  //   this.edit(id, 'formula', updated_value);
  // }

}
