import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { CrudManufacturingLineService } from '../../manufacturing-line-table/crud-manufacturing-line.service';

@Component({
  selector: 'app-manufacturing-schedule-report',
  templateUrl: './manufacturing-schedule-report.component.html',
  styleUrls: ['./manufacturing-schedule-report.component.css']
})
export class ManufacturingScheduleReportComponent implements OnInit {
  summationData = [];

  constructor(
    public dialogRef: MatDialogRef<ManufacturingScheduleReportComponent>, @Inject(MAT_DIALOG_DATA) public activities: Array<any>, private crudManufacturingLineService: CrudManufacturingLineService){}

    ngOnInit() {
      var t = [];
      for (let i of this.activities) {
        t.push(String(i.id));
      }
      this.crudManufacturingLineService.getManufacturingScheduleSummation({
        manufacturing_tasks: t
      }).subscribe(response => {
        if (response.success) {
          console.log(response.data);
          this.summationData = [];
          for(var k in response.data) {
            console.log("k is " + k);
            console.log(response.data[k]);
            this.summationData.push({
              name: k,
              unit_value: response.data[k].unit_value,
              unit: response.data[k].unit,
              package_value: response.data[k].package_value
            });
          }
          console.log(this.summationData);
        }
      }, err => {
        console.log("The data failed to load.");
      });
    }

    print() {
      let w = window.open();
      w.document.head.innerHTML += '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">';
      w.document.head.innerHTML += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>';
      w.document.head.innerHTML += '<style>th {text-align: center} table {font-size: 12px} .table > tbody > tr > td {vertical-align: middle;}</style>'
      let htmlString = `
      <h1>Manufacturing Schedule Report</h1>
      <div id="table" class="table-editable">
      <table class="table table-bordered table-responsive-md table-striped text-center">
        <tr>
          <th class="text-center">Activity ID</th>
          <th class="text-center">SKU Display</th>
          <th class="text-center">SKU ID</th>
          <th class="text-center">SKU Case Quantity</th>
          <th class="text-center">Formula ID</th>
          <th class="text-center">Formula Name</th>
          <th class="text-center">Formula / Ingredients</th>
          <th class="text-center">Start</th>
          <th class="text-center">End</th>
          <th class="text-center">Duration</th>
        </tr>
        `;
        var id=0;
        for (let activity of this.activities) {
          htmlString += `
          <tr>
          <td contenteditable="false">${id}</td>
          <td contenteditable="false">${activity.sku_display_name}</td>
          <td contenteditable="false">${activity.sku_id}</td>
          <td contenteditable="false">${activity.sku_case_quantity}</td>
          <td contenteditable="false">${activity.formula_id}</td>
          <td contenteditable="false">${activity.formula_name}</td>
          <td>
                  <table class="table table-bordered">
                      <tr>
                          <th class="text-center">Name</th>
                          <th class="text-center">ID</th>
                          <th class="text-center">Quantity/Units</th>
                        </tr>
          `;
          for (let tuple of activity.formula_ingredient_tuples) {
            htmlString += `
            <tr>
                              <td>${tuple.ingredient.name}</td>
                              <td>${tuple.ingredient.number}</td>
                              <td>${tuple.quantity}${tuple.unit}</td>
                            </tr>
            `;
          }
          htmlString += `
          </table>
              </td>
              <td contenteditable="false">${activity.start_date}</td>
              <td contenteditable="false">${activity.end_date}</td>
              <td contenteditable="false">${activity.duration}</td>
            </tr>
          `;
          id = id + 1;
        }
        htmlString += `</table></div>`;

        // Now for the second table
        htmlString +=  `
        <div id="table2" class="table-editable">
          <table class="table table-bordered table-responsive-md table-striped text-center">
              <tr>
                  <th class="text-center">Ingredient Name</th>
                  <th class="text-center">Required Amount</th>
                  <th class="text-center">Unit</th>
                  <th class="text-center">Required Num Packages</th>
                </tr>`;
        for (let ing of this.summationData) {
          htmlString += `
          <tr>
                    <td contenteditable="false">${ing.name}</td>
                    <td contenteditable="false">${ing.unit_value}</td>
                    <td contenteditable="false">${ing.unit}</td>
                    <td contenteditable="false">${ing.package_value}</td>
                  </tr>
          `;
        }
        htmlString += `</table></div>`;         
          
        w.document.body.innerHTML = htmlString;
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    submit(): void {
      this.dialogRef.close();
    }

}
