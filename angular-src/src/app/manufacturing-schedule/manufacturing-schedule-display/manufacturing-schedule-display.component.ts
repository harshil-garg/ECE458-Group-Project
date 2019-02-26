import { Component, OnInit, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ManufacturingGoalService } from '../../manufacturing-goal-table/manufacturing-goal.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import { Activity } from '../../model/activity';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  manufGoalList : Array<ManufacturingGoal> = [];
  activityList : Array<Activity> = [];
  removeEvent: EventEmitter<any> = new EventEmitter();
  goalsUpdated: EventEmitter<any> = new EventEmitter();
  warnings: Array<Array<string>> = [[],[],[],[]];

  constructor(private manufacturingGoalService: ManufacturingGoalService, private snackBar: MatSnackBar){}

  ngOnInit(){
    this.manufGoalList = [];
    this.activityList = [];
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
    this.manufacturingGoalService.refresh({
      pageNum: -1,
      page_size: 0,
      sortBy: "name"
    }).subscribe(
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
    this.populateActivityList();
  }

  populateActivityList(){
    for(let manufGoal of this.manufGoalList){
      manufGoal.sku_tuples.forEach(sku => {
        this.activityList.push({
          sku: sku.sku,
          duration: sku.case_quantity * (+sku.sku.manufacturing_rate),
          manufacturing_goal: manufGoal.name
        });
      });
    }
  }

  drop(event: CdkDragDrop<Activity>) {
    if(event.previousContainer.id != "manufacturing-activities"){
      var manufLine = event.previousContainer.id.split("-")[1];
      var hour = event.previousContainer.id.split("-")[3];
      this.activityList.push(event.previousContainer.data);
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
      this.manufGoalList.splice(id, 1);
      this.goalsUpdated.emit(true);
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
    this.activityList.splice(id, 1);
  }

  enable(goal: ManufacturingGoal){
    if(this.manufGoalList.indexOf(goal)!=-1){
      if(confirm("Are you sure you would like to add " + goal.name + "?")){
        this.manufGoalList.push(goal);
      }
    }
    else {
      this.displayError(goal.name + " is already enabled");
    }
  }

  displayError(message){
    this.snackBar.open(message, "Close", {duration:3000});
  }

}
