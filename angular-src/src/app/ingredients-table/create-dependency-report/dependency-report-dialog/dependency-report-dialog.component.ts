import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-dependency-report-dialog',
  templateUrl: './dependency-report-dialog.component.html',
  styleUrls: ['./dependency-report-dialog.component.css']
})
export class DependencyReportDialogComponent {

  constructor(public dialogRef: MatDialogRef<DependencyReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ingredientList: Array<any>) { }

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
