import { Component, OnInit, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ManufacturingGoalService } from '../../manufacturing-goal-table/manufacturing-goal.service';
import { CrudManufacturingLineService } from '../../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import { Activity } from '../../model/activity';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  suggestedManufacturingLines = [];
  manufGoalList : Array<ManufacturingGoal> = [];
  reportingFormControl = new FormControl();
  activityList : Array<Activity> = [];
  removeEvent: EventEmitter<any> = new EventEmitter();

  constructor(private manufacturingGoalService: ManufacturingGoalService, private crudManufacturingLineService: CrudManufacturingLineService) {}

  ngOnInit() {
    this.manufGoalList = [];
    this.activityList = [];
    this.populateManufGoalList();

    this.reportingFormControl.valueChanges.debounceTime(200)
		.distinctUntilChanged()
		.switchMap((query) =>  this.crudManufacturingLineService.autocompleteLines(query))
		.subscribe( result => {
			if(result!=null && result.data!=null){
					 this.suggestedManufacturingLines = result.data.slice();
			 }
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

  makeReport(value) {
    console.log("hi");
  }

}
