import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ManufacturingService } from '../../manufacturing.service';

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
              name: calculatedVal.name,
              calculated_quantity: calculatedVal.calculated_quantity
          });
        }
      //}
    }
}
