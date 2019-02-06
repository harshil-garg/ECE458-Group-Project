import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ManufacturingService } from '../../manufacturing.service';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-calculator-dialog',
  templateUrl: './calculator-dialog.component.html',
  styleUrls: ['./calculator-dialog.component.css']
})
export class CalculatorDialogComponent implements OnInit {

  calculateList : Array<any> = [];

  constructor(
    public dialogRef: MatDialogRef<CalculatorDialogComponent>, public manufacturingService: ManufacturingService,
      @Inject(MAT_DIALOG_DATA) public manufGoal: string){}

    onNoClick(): void {
      this.dialogRef.close();
    }

    ngOnInit() {
      console.log("nailshear");
      this.calculate();
    }

    calculate(){
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
      //if(response.success){
        this.calculateList = [];
        for(let calculatedVal of response){
          this.calculateList.push({
              number: calculatedVal.number,
              name: calculatedVal.name,
              package_size: calculatedVal.package_size,
              cost: calculatedVal.cost.toFixed(2),
              calculated_quantity: calculatedVal.calculated_quantity
          });
        }
        this.calculateList.sort(function(a, b) {
          return a.number - b.number;
        })
      //}
    }

    public export() {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      //pdfMake.fonts = {
        //din: {
          //normal: 'NeueHaasGroteskRegular.ttf',
          //bold: 'NeueHaasGroteskMedium.ttf',
          //italics: 'FF_DIN_Regular.otf',
          //bolditalics: 'FF_DIN_Regular.otf'
        //}
    //  }

      var tabular_data = [[]];
      tabular_data.push([
        {text: '#', bold: true},
        {text: 'Ingredient Name', bold: true},
        {text: 'Package Size', bold: true},
        {text: 'Cost', bold: true},
        {text: 'Quantity Required', bold: true}
      ]);
      for (var i = 0; i < this.calculateList.length; i++) {
        let item = this.calculateList[i];
        let row = [item.number+"", item.name, item.package_size, item.cost+"", item.calculated_quantity+""];
        tabular_data.push(row);
      }
      tabular_data.shift();
      console.log(tabular_data);

      var dd = {
        content: [
          {
            text: "Manufacturing Goal Report",
            style: "header"
          },
          {
            alignment: 'center',
            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
					       return (rowIndex % 2 === 0) ? '#e7f1fc' : null;
				      },
              hLineWidth: function (i, node) {
					           return (i <= 1) ? 2 : null;
				     },
             vLineWidth: function (i, node) {
               return 0;
             },
             hLineColor: function (i, node) {
               return (i === 1) ? 'black' : null;
             },
             vLineColor: function (i, node) {
               return (i == 1) ? null : null;
             }
            }, // optional
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [50, "*", "*", "auto", "*"],
              //body: [
                //[ 'Number', 'Name', 'Package Size', 'Cost', 'Quantity Required' ],
                //[ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
                //[ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
              //]
              //body: tabular_data
              body: tabular_data
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true
          }
        }//,
        //defaultStyle: {
          //font: 'din'
        //}
      };

      pdfMake.createPdf(dd).download();

    }

    exportcsv() {
      var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += ["#", "Name", "Package Size", "Cost", "Quantity"].join(",") + "\r\n";
      this.calculateList.forEach(function(item) {
        let row = item.number+","+item.name+","+item.package_size+","+item.cost+","+item.calculated_quantity;
        csvContent += row + "\r\n";
      });
      var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
    }
}
