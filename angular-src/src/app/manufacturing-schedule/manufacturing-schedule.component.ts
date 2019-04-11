import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { CrudManufacturingLineService } from '../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingScheduleEvent } from '../model/manufacturing-schedule-event';
import { ManufacturingScheduleDisplayComponent } from './manufacturing-schedule-display/manufacturing-schedule-display.component';
import { ManufacturingScheduleService } from './manufacturing-schedule.service';
import { ActivityDialogComponent } from './activity-dialog/activity-dialog.component';
import { Activity } from '../model/activity';
import { Sku } from '../model/sku';
import { ManufacturingGoal } from '../model/manufacturing-goal';
import { MatSnackBar, MatDialog } from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule',
  templateUrl: './manufacturing-schedule.component.html',
  styleUrls: ['./manufacturing-schedule.component.css']
})
export class ManufacturingScheduleComponent implements OnInit {
  hours : Array<Array<number>> = [[]];
  starting_hours : Array<Array<string>> = [[]];
  days : Array<Array<string>> = [[]];
  months : Array<Array<string>> = [[]];
  activities : Array<ManufacturingScheduleEvent> = [];
  hourHeaders : Array<string> = [];
  manufLines : Array<string> = [];
  currDate : Date = this.zeroedDate(new Date());
  warningList: Array<Array<Activity>> = [[],[],[]];
  @Input() manufGoals : Array<ManufacturingGoal> = [];
  @Input() remove: EventEmitter<any>;
  @Input() goalsUpdated: EventEmitter<Array<ManufacturingGoal>>;
  @Input() refreshSchedule: EventEmitter<boolean>;
  @Output() warnings: EventEmitter<Array<Array<Activity>>> = new EventEmitter();
  @Output() activitiesUpdated: EventEmitter<Array<ManufacturingScheduleEvent>> = new EventEmitter();

  constructor(private crudManufacturingLineService: CrudManufacturingLineService, private snackBar: MatSnackBar,
    public manufacturingScheduleDisplayComponent: ManufacturingScheduleDisplayComponent, public dialog: MatDialog,
    private manufacturingScheduleService: ManufacturingScheduleService) { }

  ngOnInit() {
    this.refresh();
    this.remove.subscribe(index=>this.removeActivity(index));
    this.refreshSchedule.subscribe(e=>{
      this.refresh();
    });
    this.goalsUpdated.subscribe(goals => {
      this.manufGoals = goals;
      this.refresh();
    });
  }

  refresh() {
    this.activities = [];
    this.warningList = [[],[],[]];
    this.manufacturingScheduleService.load().subscribe(
      response => {
        if(response.success){
          response.data.forEach(data => {this.activities.push({
            activity: {
              sku: data.activity.sku,
              manufacturing_goal: data.activity.manufacturing_goal.name,
              duration: data.duration
            },
            manufacturing_line: data.manufacturing_line.shortname,
            start_date: new Date(data.start_date),
            duration: data.duration,
            duration_override: data.duration_override
          })});
          this.populateManufLines();
          this.activitiesUpdated.emit(this.activities);
        } else {
          this.displayError("Failed to setup Activities!");
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  populateManufLines(){
    this.crudManufacturingLineService.read({
        pageNum: -1,
        page_size: 0,
        sortBy: "name"
      }).subscribe(
      response => {
        if(response.success){
          this.manufLines = [];
          response.data.forEach(data=> this.manufLines.push(data.shortname));
          this.setupHourHeaders();
          this.refreshHours();
          this.checkWarnings();
        } else {
          this.displayError("Failed to populate Manufacturing Lines");
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  checkWarnings(){
    this.updateOrphaned();
    this.updateDurationWarning();
    this.warnings.emit(this.warningList);
  }

  setupHourHeaders(){
    for(var j=0; j<10; j++){
      if(j<4){
        this.hourHeaders.push((j+8) + "AM");
      }
      else if(j==4){
        this.hourHeaders.push((j+8) + "PM");
      }
      else {
        this.hourHeaders.push((j-4) + "PM");
      }
    }
  }

  refreshHours(){
    this.hours = [[]];
    this.starting_hours = [[]];
    for(var i=0; i<this.manufLines.length; i++){
      this.hours[i] = [];
      this.starting_hours[i] = [];
      for(var j=0; j<10; j++){
        this.hours[i].push(-1);
        this.starting_hours[i].push("");
      }
    }
    for(var i=0; i<this.activities.length; i++){//iterate over activities
      var manufIndex = this.manufLines.indexOf(this.activities[i].manufacturing_line);
      if(this.sameDay(this.activities[i].start_date, this.currDate)){
        var hour = this.activities[i].start_date.getHours();
        if(hour>=8 && hour<18){
          this.starting_hours[manufIndex][hour-8] = this.activities[i].activity.sku.name;
        }
      }
      var endDate = this.calculateEndTime(this.activities[i].start_date, this.activities[i].duration);
      var endTime = endDate.getTime();
      for(var j=0; j<10; j++){//iterate over hours
        this.currDate.setHours(j+8);
        var currTime = this.currDate.getTime();
        var startTime = this.activities[i].start_date.getTime();
        if(currTime>=startTime && currTime<endTime){
          this.hours[manufIndex][j] = i;
        }
      }
      var manufGoal = this.activities[i].activity.manufacturing_goal;
      var deadline = new Date();
      this.manufGoals.forEach(goal => {
        if(goal.name == manufGoal){
          deadline = new Date(goal.deadline);
        }
      });
      if(endDate.getFullYear() > deadline.getFullYear() || endDate.getMonth() > deadline.getMonth() || endDate.getDate() > deadline.getDate()){
        if(this.warningList[0].indexOf(this.activities[i].activity)==-1){
          this.warningList[0].push(this.activities[i].activity);
        }
        this.activities[i].past_deadline = true;
      } else {
        if(this.warningList[0].indexOf(this.activities[i].activity)!=-1){
          this.warningList[0].splice(this.warningList[1].indexOf(this.activities[i].activity), 1);
        }
        this.activities[i].past_deadline = false;
      }
    }
  }

  updateOrphaned(){
    this.activities.forEach(act => {
      var inGoals : boolean = false;
      this.manufGoals.forEach(goal => {
        if(goal.name == act.activity.manufacturing_goal){
          inGoals = true;
        }
      });
      if(!inGoals){
        act.orphaned = true;
        if(this.warningList[1].indexOf(act.activity)==-1){
          this.warningList[1].push(act.activity);
        }
      } else {
        if(this.warningList[1].indexOf(act.activity)!=-1){
          this.warningList[1].splice(this.warningList[1].indexOf(act.activity), 1);
        }
        act.orphaned = false;
      }
    });
  }

  calculateEndTime(startTime: Date, duration: number){
    var date = new Date(startTime);
    var timeTil6 = 18 - date.getHours();
    if(timeTil6 >= duration){
      date.setHours(date.getHours() + duration);
    }
    else{
      duration -= timeTil6;
      date.setDate(date.getDate() + 1); //supports rollover
      while(duration > 10){
        date.setDate(date.getDate() + 1);
        duration-=10;
      }
      date.setHours(8+duration);
    }
    return date;
  }

  zeroedDate(givenDate: Date){
    var currDate = new Date(givenDate);
    currDate.setHours(0);
    currDate.setMinutes(0);
    currDate.setSeconds(0);
    currDate.setMilliseconds(0);
    return currDate;
  }

  sameDay(day1: Date, day2: Date){
    var d1: Date = new Date(day1);
    var d2: Date = new Date(day2);
    return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
  }

  convertToMillis(hour,minute,second,millis){
    var minutes = minute + hour*60;
    var second = second + minutes*60;
    return millis + second*1000;
  }

  drop(event: CdkDragDrop<Activity[]>) {
    if(event.previousContainer.id === "manufacturing-activities"){
      var currId  = event.container.id.split("-")[1];//still a string, need to convert to int with unary operator (+)
      var currHour = event.container.id.split("-")[3];
      // this.hours[+currId][event.currentIndex] = event.previousContainer.data[event.previousIndex];
      var droppedActivity : Activity = {
        sku: event.previousContainer.data[event.previousIndex].sku,
        duration: event.previousContainer.data[event.previousIndex].duration,
        manufacturing_goal: event.previousContainer.data[event.previousIndex].manufacturing_goal
      };
      var startDate = this.zeroedDate(this.currDate);
      startDate.setHours(8+ (+currHour));
      if(!this.isCollision(startDate, droppedActivity, this.manufLines[+currId], droppedActivity.duration)){
        if(!this.wrongManufLine(droppedActivity, this.manufLines[+currId])){
          var newManufEvent = {
            activity: droppedActivity,
              manufacturing_line: this.manufLines[+currId],
              start_date: startDate,
              duration: droppedActivity.duration,
              duration_override: false
          }
          // this.activities.push({
          //   activity: droppedActivity,
          //   manufacturing_line: this.manufLines[+currId],
          //   start_date: startDate,
          //   duration: droppedActivity.duration,
          //   duration_override: false
          // });
          this.createActivity(newManufEvent);
          this.manufacturingScheduleDisplayComponent.removeActivity(event.previousIndex);
        } else{
          this.displayError("This add is not allowed : " + droppedActivity.sku.name + " cannot be produced on line " + this.manufLines[+currId]);
        }
      }else{
        this.displayError("This add is not allowed : overlapping activities on " + this.manufLines[+currId]);
      }
    }
    else {
      var prevId = event.previousContainer.id.split("-")[1];
      var prevHour = event.previousContainer.id.split("-")[3];
      var currId = event.container.id.split("-")[1];
      var currHour = event.container.id.split("-")[3];
      var initialValue = this.activities[this.hours[+prevId][prevHour]].activity;
      var updatedDate = this.zeroedDate(this.currDate);
      updatedDate.setHours(8+ (+currHour));
      if(!this.isCollision(updatedDate, initialValue, this.manufLines[+currId], initialValue.duration)){
        if(!this.wrongManufLine(initialValue, this.manufLines[+currId])){
          this.activities.forEach(activity=>{
            if(activity.activity == initialValue){
              activity.start_date = updatedDate;
              activity.manufacturing_line = this.manufLines[+currId];
              this.updateActivity(activity);
            }
          });
        }else{
          this.displayError("This move is not allowed : " + initialValue.sku.name + " cannot be produced on line " + this.manufLines[+currId]);
        }
      }else{
        this.displayError("This move is not allowed : overlapping activities on " + this.manufLines[+currId]);
      }
      this.refresh();
    }
  }

  removeActivity(index){
    var deletedActivity : Activity = this.activities[this.hours[index[0]][index[1]]].activity;
    this.deleteActivity(deletedActivity);
    // for(var i=0; i<this.activities.length; i++){
    //   if(this.activities[i].activity == deletedActivity){
    //     this.activities.splice(i, 1);
    //   }
    // }
  }

  displayError(message){
    this.snackBar.open(message, "Close", {duration:3000});
  }

  isCollision(date: Date, activity: Activity, manufLine, duration: number){
    var this_start = date;
    var collision = false;
    var this_end = this.calculateEndTime(date, duration);
    this.activities.forEach(act=>{
      if(act.activity != activity && act.manufacturing_line == manufLine){
        var act_start = act.start_date;
        var act_end = this.calculateEndTime(act.start_date, act.duration);
        if(!(this_end.getTime() <= act_start.getTime() || this_start.getTime() >= act_end.getTime())){ //collision
          collision = true;
        }
      }
    });
    return collision;
  }

  wrongManufLine(activity: Activity, manufLine: string){
    var returned: boolean = true;
    activity.sku.manufacturing_lines.forEach(line => {
      if(line==manufLine){
        returned = false;
      };
    });
    return returned;
  }

  getLists() {
    var lists = [];
    for(var i=0; i<this.manufLines.length; i++){
      for(var j=0; j<10; j++) {
        lists.push("list-"+i+"-hour-"+j);
      }
    }
    lists.push("manufacturing-activities");
    return lists;
  }

  openActivityDialog(id, hour_id){
    var activity_id = this.hours[id][hour_id];
    if(activity_id != -1){//there is an activity at this time
      let dialogRef = this.dialog.open(ActivityDialogComponent, {
        height: '400px',
        width: '400px',
        data: this.activities[activity_id].duration
      });

      dialogRef.afterClosed().subscribe(result =>{
        if(result!=null){
          this.activities[activity_id].duration = +result;
          this.activities[activity_id].duration_override = true;
          this.updateActivity(this.activities[activity_id]);
        }
      });
    }
  }

  updateDurationWarning(){
    this.activities.forEach(activity => {
      if(activity.duration_override && this.warningList[2].indexOf(activity.activity)==-1){
        this.warningList[2].push(activity.activity);
      }
    });
  }

  createActivity(manufacturingScheduleEvent: ManufacturingScheduleEvent){
    this.manufacturingScheduleService.create({
      activity: {
        manufacturing_goal: manufacturingScheduleEvent.activity.manufacturing_goal,
      	sku: manufacturingScheduleEvent.activity.sku.number.toString()
      },
      manufacturing_line: manufacturingScheduleEvent.manufacturing_line,
      start_date: manufacturingScheduleEvent.start_date,
      duration: manufacturingScheduleEvent.duration,
      duration_override: false
    }).subscribe(
      response => {
        if(response.success){
          this.refresh();
        } else {
          this.displayError("Failed to create Activity!");
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  deleteActivity(activity: Activity){
    this.manufacturingScheduleService.delete({
      activity: {
        sku: activity.sku["number"],
        manufacturing_goal: activity.manufacturing_goal
      }
    }).subscribe(
      response => {
        console.log(response)
        if(response.success){
          this.refresh();
        } else {
          this.displayError("Failed to create Activity!");
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  updateActivity(activity: ManufacturingScheduleEvent){
    this.manufacturingScheduleService.update({
      activity: {
        sku: activity.activity.sku["number"],
        manufacturing_goal: activity.activity.manufacturing_goal
      },
      manufacturing_line: activity.manufacturing_line,
      start_date: activity.start_date,
      duration: activity.duration
    }).subscribe(
      response => {
        if(response.success){
          this.refresh();
        } else {
          this.displayError("Failed to create Activity!");
        }
      },
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  numDeadlines(id){
    var num = 0;
    if(id==9){
      this.manufGoals.forEach(goal=>{
        var deadline = goal.deadline;
        if(typeof deadline == "string"){
          deadline = new Date(deadline);
        }
        if(deadline.getFullYear() == this.currDate.getFullYear() && deadline.getMonth() == this.currDate.getMonth() && deadline.getDate() == this.currDate.getDate()){
          num++;
        }
      });
    }
    return num;
  }

  getDeadlines(id){
    var returned: string = "Deadline: ";
    if(id==9){
      this.manufGoals.forEach(goal=>{
        var deadline = goal.deadline;
        if(typeof deadline == "string"){
          deadline = new Date(deadline);
        }
        if(deadline.getFullYear() == this.currDate.getFullYear() && deadline.getMonth() == this.currDate.getMonth() && deadline.getDate() == this.currDate.getDate()){
          returned+=goal.name + " ,";
        }
      });
    }
    return returned.substring(0, returned.length - 1);
  }

  getClass(id, hour_id){
    var item = this.hours[id][hour_id];
    var starting_item = this.starting_hours[id][hour_id];
    if(item==-1 || this.activities[item]==undefined){
      return "example-box";
    } else {
      var activity = this.activities[item];
      var prefix : string = "";
      if(activity.past_deadline){
        prefix += "past-deadline-";
      } else if(activity.duration_override){
        prefix += "duration-override-";
      } else if(activity.orphaned){
        prefix += "orphaned-";
      }
      if(starting_item==''){
        return prefix+"selected-box";
      } else {
        return prefix+"start-box";
      }
    }
  }

}
