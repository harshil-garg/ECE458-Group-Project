import { Component } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddManufacturingGoalDialogComponent } from './add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import { ManufacturingGoalService, CreateResponse } from '../manufacturing-goal.service';
import { ManufacturingGoalTableComponent } from '../manufacturing-goal-table.component';

import { ManufacturingGoal } from '../../model/manufacturing-goal';

@Component({
  selector: 'app-add-manufacturing-goal',
  templateUrl: './add-manufacturing-goal.component.html',
  styleUrls: ['./add-manufacturing-goal.component.css']
})
export class AddManufacturingGoalComponent {

    manufGoal: ManufacturingGoal = new ManufacturingGoal();

    constructor(public dialog: MatDialog, public manufacturingService: ManufacturingGoalService,
      public manufacturingComponent: ManufacturingGoalTableComponent, private snackBar: MatSnackBar) {}

    public openDialog() {
      let dialogRef = this.dialog.open(AddManufacturingGoalDialogComponent, {
        height: '800px',
        width: '600px',
        data: this.manufGoal
      });

      dialogRef.afterClosed().subscribe(result =>{
        if(result!=null){
          this.manufGoal = result;
          this.add(this.manufGoal);
        }
      });
    }

    add(manufGoal: ManufacturingGoal) {
      // Set the deadline to 6PM
      manufGoal.deadline.setHours(18);
      manufGoal.deadline.setMinutes(0);
      manufGoal.deadline.setSeconds(0);
      manufGoal.deadline.setUTCMilliseconds(0);
      
      this.manufacturingService.create({
          name : manufGoal.name,
          sku_tuples : manufGoal.sku_tuples,
          deadline: manufGoal.deadline
        }).subscribe(
        response => this.handleResponse(response),
        err => {
          if (err.status === 401) {
            console.log("401 Error")
          }
        }
      );
    }

    private handleResponse(response: CreateResponse) {
      console.log(response);
      this.snackBar.open(response.message, "Close", {duration:1000});
      this.manufacturingComponent.refresh();
    }

}
