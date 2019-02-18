import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AddManufacturingGoalDialogComponent } from './add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import { ManufacturingService, CreateResponse } from '../manufacturing.service';
import { ManufacturingComponent } from '../manufacturing.component';

import { ManufacturingGoal } from '../../model/manufacturing-goal';

@Component({
  selector: 'app-add-manufacturing-goal',
  templateUrl: './add-manufacturing-goal.component.html',
  styleUrls: ['./add-manufacturing-goal.component.css']
})
export class AddManufacturingGoalComponent {

    manufGoal: ManufacturingGoal = new ManufacturingGoal();

    constructor(public dialog: MatDialog, public manufacturingService: ManufacturingService,
      public manufacturingComponent: ManufacturingComponent) {}

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
          skus : manufGoal.skus
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
