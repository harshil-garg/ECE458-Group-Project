import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
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
      public manufacturingComponent: ManufacturingGoalTableComponent) {}

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
      this.manufacturingComponent.refresh();
    }

}
