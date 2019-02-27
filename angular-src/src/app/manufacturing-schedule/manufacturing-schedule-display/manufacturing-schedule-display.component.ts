import { Component, OnInit, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ManufacturingScheduleService } from '../manufacturing-schedule.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import { ManufacturingScheduleEvent } from '../../model/manufacturing-schedule-event';
import { Activity } from '../../model/activity';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  manufGoalList : Array<ManufacturingGoal> = [];
  palette : Array<Activity> = [];
  addedActivities : Array<Activity> = [];
  removeEvent: EventEmitter<any> = new EventEmitter();
  goalsUpdated: EventEmitter<Array<ManufacturingGoal>> = new EventEmitter();
  warnings: Array<Array<string>> = [[],[],[],[]];

  constructor(private manufacturingScheduleService: ManufacturingScheduleService, private snackBar: MatSnackBar){}

  ngOnInit(){
    this.manufGoalList = [];
    this.palette = [];
    this.populateManufGoalList();
  }

  updateWarnings(event: Array<Array<Activity>>){
    this.warnings[1] = [];
    event[0].forEach(activity => {
      this.warnings[1].push(activity.sku.name + " (" + activity.manufacturing_goal + ")");
    });
    this.warnings[2] = [];
    event[1].forEach(activity => {
      this.warnings[2].push(activity.sku.name + " (" + activity.manufacturing_goal + ")");
    });
    this.warnings[3] = [];
    event[2].forEach(activity => {
      this.warnings[3].push(activity.sku.name + " (" + activity.manufacturing_goal + ")");
    });
  }

  populateManufGoalList(){
    this.manufacturingScheduleService.getEnabled().subscribe(
      response => {
        if(response.success){
          this.handleManufGoalUpdate(response);
        }
        else {

        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  handleManufGoalUpdate(response){
    this.manufGoalList = [];
    for(let manufGoal of response.data){
      console.log(manufGoal.sku_tuples);
      this.manufGoalList.push({
          name: manufGoal.name,
          sku_tuples: manufGoal.sku_tuples,
          deadline: manufGoal.deadline,
          user: ""
      });
    }
    console.log("MANUF GOALS");
    console.log(this.manufGoalList);
    this.refreshPalette();
  }

  refreshPalette(){
    this.palette = [];
    for(let manufGoal of this.manufGoalList){
      manufGoal.sku_tuples.forEach(sku => {
        var alreadyAdded : boolean = false;
        this.addedActivities.forEach(act=>{
          if(act.sku["number"] == sku.sku["number"] && act.manufacturing_goal == manufGoal.name){
            alreadyAdded = true;
          }
        });
        if(!alreadyAdded){
          this.palette.push({
            sku: sku.sku,
            duration: Math.ceil(sku.case_quantity / (+sku.sku.manufacturing_rate)),
            manufacturing_goal: manufGoal.name
          });
        }
      });
    }
  }

  drop(event: CdkDragDrop<Activity>) {
    if(event.previousContainer.id != "manufacturing-activities"){
      var manufLine = event.previousContainer.id.split("-")[1];
      var hour = event.previousContainer.id.split("-")[3];
      this.palette.push(event.previousContainer.data);
      this.removeEvent.emit([manufLine, hour]);
    }
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //                     event.container.data,
    //                     event.previousIndex,
    //                     event.currentIndex);
    // }
  }

  remove(id){
    if(confirm("Are you sure you would like to remove " + this.manufGoalList[id].name + "?")){
      this.enable(this.manufGoalList[id], false);
      this.goalsUpdated.emit(this.manufGoalList);
    }
  }

  getLists() {
    var lists = [];
    for(var i=0; i<30; i++){
      for(var j=0; j<10; j++) {
        lists.push("list-"+i+"-hour-"+j);
      }
    }
    return lists;
  }

  removeActivity(id){
    this.palette.splice(id, 1);
  }

  confirmEnable(goal: ManufacturingGoal){
    var alreadyAdded : boolean = false;
    this.manufGoalList.forEach(manufGoal =>{
      if(manufGoal.name==goal.name){
        alreadyAdded = true;
      }
    })
    if(!alreadyAdded){
      if(confirm("Are you sure you would like to add " + goal.name + "?")){
        this.enable(goal, true);
      }
    }
    else {
      this.displayError(goal.name + " is already enabled");
    }
  }

  enable(goal: ManufacturingGoal, enabled: boolean){
    this.manufacturingScheduleService.setEnabled({
      manufacturing_goal: goal,
      enabled: enabled
    }).subscribe(
      response => {
        if(!response.success){
          this.displayError("Error enabling goal");
        } else {
          this.populateManufGoalList();
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  displayError(message){
    this.snackBar.open(message, "Close", {duration:3000});
  }

  updateActivities(event: Array<ManufacturingScheduleEvent>){
    this.addedActivities = [];
    event.forEach(event => {
      this.addedActivities.push(event.activity);
    });
    this.refreshPalette();
  }

}
