import { Component, Input, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { DependencyReportDialogComponent } from './dependency-report-dialog/dependency-report-dialog.component';
import { FilterIngredientsService } from '../filter-ingredients.service'

@Component({
  selector: 'app-create-dependency-report',
  templateUrl: './create-dependency-report.component.html',
  styleUrls: ['./create-dependency-report.component.css']
})
export class CreateDependencyReportComponent{

  constructor(public dialog: MatDialog, public filterIngredientsService: FilterIngredientsService) {}

  @Input() sortBy: string;
  @Input() keywords: Array<any>;
  @Input() skus: Array<any>;

  ingredients: Array<any>;

  onclick(){
    this.filterIngredientsService.filter({
        sortBy : this.sortBy,
        pageNum: '-1',
        page_size: 0,
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

  handleRefreshResponse(response){
    console.log("RESPONSE:");
    console.log(response);
    if(response.success){
      this.ingredients = [];
      for(let ingredient of response.data){
        this.ingredients.push({
            id: ingredient.number,
            name: ingredient.name,
            vendor_info: ingredient.vendor_info,
            package_size: ingredient.package_size,
            cost_per_package: ingredient.cost,
            skus: ingredient.skus,
            comment: ingredient.comment
        });
      }
      let dialogRef = this.dialog.open(DependencyReportDialogComponent, {
        height: '800px',
        width: '1400px',
        data: this.ingredients
      });
    }
  }

}
