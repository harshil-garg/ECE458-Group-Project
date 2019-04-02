import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ManufacturingGoalService } from '../../manufacturing-goal.service';
import {ExportService} from '../../../export.service'
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-calculator-dialog',
  templateUrl: './calculator-dialog.component.html',
  styleUrls: ['./calculator-dialog.component.css']
})
export class CalculatorDialogComponent implements OnInit {

  calculateList : Array<any> = [];

  calculateColumns = ['Ingr#', 'Name', 'Measured Quantity', 'Package Quantity'];
  loadingResults: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CalculatorDialogComponent>, public exportService: ExportService, public manufacturingService: ManufacturingGoalService,
      @Inject(MAT_DIALOG_DATA) public manufGoal: string){}

    onNoClick(): void {
      this.dialogRef.close();
    }

    ngOnInit() {
      this.calculate();
    }

    calculate(){
      this.loadingResults = true;
      this.manufacturingService.calculate({
          name : this.manufGoal
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
        this.calculateList = [];
        this.loadingResults = false;
        for(let key in response.data){

          this.calculateList.push({
              'Ingr#': response.data[key].number,
              'Name': key,
              'Measured Quantity': response.data[key].unit_value + ' ' + response.data[key].unit,
              'Package Quantity': response.data[key].package_value,
          });
        }
        this.calculateList.sort(function(a, b) {
          return a['Ingr#'] - b['Ingr#'];
        })
    }

    print() {
      let w = window.open();
      w.document.head.innerHTML += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
      w.document.head.innerHTML += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
      w.document.head.innerHTML += '<style>th {text-align: center}</style>'
      let htmlString = `
      <h2>Manufacturing Calculator</h2>
      <h3>${this.manufGoal}</h3>
      <table id="calculate-table" class="table table-bordered table-responsive-md table-striped text-center">
        <tr>
          <th>Ingr#</th>
          <th>Name</th>
          <th>Measured Quantity</th>
          <th>Package Quantity</th>
        </tr>
        `;
        for (let calculatedVal of this.calculateList) {
          htmlString += `
          <tr>
            <td>${calculatedVal['Ingr#']}</td>
            <td>${calculatedVal['Name']}</td>
            <td>${calculatedVal['Measured Quantity']}</td>
            <td>${calculatedVal['Package Quantity']}</td>
          </tr>`;
        }

        htmlString += `</table>`;
        w.document.body.innerHTML = htmlString;
    }

    exportcsv() {
      this.exportService.exportJSON(this.calculateColumns, this.calculateList, `manufacturing_goal_${this.manufGoal}`);
    }
}
