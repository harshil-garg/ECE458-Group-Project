import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FilterIngredientsService } from '../../filter-ingredients.service'

@Component({
  selector: 'app-dependency-report-dialog',
  templateUrl: './dependency-report-dialog.component.html',
  styleUrls: ['./dependency-report-dialog.component.css']
})
export class DependencyReportDialogComponent implements OnInit {

  ingredientList: Array<any> = [];
  loadingResults: boolean;

  constructor(public dialogRef: MatDialogRef<DependencyReportDialogComponent>, public filterIngredientsService: FilterIngredientsService,
    @Inject(MAT_DIALOG_DATA) public inputData: {sortBy: string, keywords: Array<any>, skus: Array<any>}) { }

    ngOnInit(){
      this.ingredientList = [];
      this.loadingResults = true;
      this.filterIngredientsService.filter({
          sortBy : this.inputData.sortBy,
          pageNum: '-1',
          page_size: 0,
          keywords: this.inputData.keywords,
          skus : this.inputData.skus
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
      this.loadingResults = false;
      if(response.success){
        this.ingredientList = [];
        for(let ingredient of response.data){
          this.ingredientList.push({
              id: ingredient.number,
              name: ingredient.name,
              vendor_info: ingredient.vendor_info,
              package_size: ingredient.package_size,
              cost_per_package: ingredient.cost,
              skus: ingredient.skus,
              comment: ingredient.comment
          });
        }
      }
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
    //exportcsv() {
      //var csvContent = "data:text/csv;charset=utf-8,";
      //csvContent += ["#", "Name", "Package Size", "Cost", "Quantity"].join(",") + "\r\n";
      //this.calculateList.forEach(function(item) {
        //let row = item.number+","+item.name+","+item.package_size+","+item.cost+","+item.calculated_quantity;
        //csvContent += row + "\r\n";
      //});
      //var encodedUri = encodeURI(csvContent);
      //window.open(encodedUri);
    //}
    exportCSV() {
      var csvContent = "";
      csvContent += "Name,SKU" + "\r\n";
      for (let ing = 0; ing < this.ingredientList.length; ing++) {
        let myIng = this.ingredientList[ing];
        console.log(myIng);
        myIng.skus.forEach(function(sku) {
          let t = sku.name + "(" + sku.number + ") : " + sku.size + " * " + sku.count;
          csvContent += myIng.name + "," + t + "\r\n";
        });
      }
      console.log(this.ingredientList);
      let blob = new Blob([csvContent], { "type": "text/csv;charset=utf8;" });
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = `ingredient_dependencies.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }

}
