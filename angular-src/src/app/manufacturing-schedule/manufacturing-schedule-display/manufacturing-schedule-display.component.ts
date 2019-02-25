import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ManufacturingGoalService } from '../../manufacturing-goal-table/manufacturing-goal.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import { Activity } from '../../model/activity';

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  manufGoalList : Array<ManufacturingGoal> = [];
  activityList : Array<Activity> = [];

  constructor(private manufacturingGoalService: ManufacturingGoalService){}

  ngOnInit(){
    this.manufGoalList = [];
    this.activityList = [];
    this.populateManufGoalList();
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

  drop(event: CdkDragDrop<string[]>) {
    if(event.previousContainer.id != "manufacturing-activities"){
      var manufLine = event.previousContainer.id.split("-")[1];
      var hour = event.previousContainer.id.split("-")[3];
      this.activityList.push(event.previousContainer.data[hour]);
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
    if(confirm("Are you sure?")){
      this.manufGoalList.splice(id, 1);
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

}
