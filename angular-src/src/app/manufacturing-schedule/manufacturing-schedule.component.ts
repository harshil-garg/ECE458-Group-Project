import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { CrudManufacturingLineService } from '../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingScheduleEvent } from '../model/manufacturing-schedule-event';
import { ManufacturingScheduleDisplayComponent } from './manufacturing-schedule-display/manufacturing-schedule-display.component';
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
  currDate : Date = this.zeroedDate();
  @Input() remove: EventEmitter<any>;
  @Input() manufGoals: Array<ManufacturingGoal>;

  constructor(private crudManufacturingLineService: CrudManufacturingLineService, private snackBar: MatSnackBar,
    public manufacturingScheduleDisplayComponent: ManufacturingScheduleDisplayComponent, public dialog: MatDialog) { }

  ngOnInit() {
    this.populateManufLines();
    this.remove.subscribe(index=>this.removeActivity(index));
  }

  populateManufLines(){
    this.crudManufacturingLineService.read({
        pageNum: -1,
        page_size: 0,
        sortBy: "name"
      }).subscribe(
      response => {
        if(response.success){
          response.data.forEach(data=> this.manufLines.push(data.shortname));
          this.setupHourHeaders();
          this.refreshHours();
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
      var endTime = this.calculateEndTime(this.activities[i].start_date, this.activities[i].duration).getTime();
      for(var j=0; j<10; j++){//iterate over hours
        this.currDate.setHours(j+8);
        var currTime = this.currDate.getTime();
        var startTime = this.activities[i].start_date.getTime();
        if(currTime>=startTime && currTime<endTime){
          this.hours[manufIndex][j] = i;
        }
      }
    }
  }

  calculateEndTime(startTime: Date, duration: number){
    var timeTil6 = 18 - startTime.getHours();
    var date = new Date(startTime.getTime());
    if(timeTil6 > duration){
      date.setHours(date.getHours() + duration);
      console.log(date);
    }
    else{
      duration -= timeTil6;
      date.setDate(date.getDate() + 1); //supports rollover
      while(duration >= 10){
        date.setDate(date.getDate() + 1);
        duration-=10;
      }
      date.setHours(8+duration);
    }
    return date;
  }

  zeroedDate(){
    var currDate = new Date();
    currDate.setHours(0);
    currDate.setMinutes(0);
    currDate.setSeconds(0);
    currDate.setMilliseconds(0);
    return currDate;
  }

  sameDay(day1, day2){
    return (day1.getYear() == day2.getYear() && day1.getMonth() == day2.getMonth() && day1.getDate() == day2.getDate());
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
      var startDate = new Date(this.currDate.getTime());
      startDate.setHours(8+ (+currHour));
      this.activities.push({
        activity: droppedActivity,
        manufacturing_line: this.manufLines[+currId],
        start_date: startDate,
        duration: droppedActivity.duration,
        duration_override: false
      });
      this.refreshHours();
      this.manufacturingScheduleDisplayComponent.removeActivity(event.previousIndex);
    }
    else {
      var prevId = event.previousContainer.id.split("-")[1];
      var prevHour = event.previousContainer.id.split("-")[3];
      var currId = event.container.id.split("-")[1];
      var currHour = event.container.id.split("-")[3];
      var initialValue = this.activities[this.hours[+prevId][prevHour]].activity;
      var updatedDate = this.zeroedDate();
      updatedDate.setHours(8+ (+currHour));
      if(!this.isCollision(updatedDate, initialValue, this.manufLines[+currId]) && !this.wrongManufLine(initialValue, this.manufLines[+currId])){
        this.activities.forEach(activity=>{
          if(activity.activity == initialValue){
            activity.start_date = updatedDate;
            activity.manufacturing_line = this.manufLines[+currId];
          }
        });
      }else{
        this.displayError("This move is now allowed : overlapping activities on " + this.manufLines[+currId]);
      }
      this.refreshHours();
    }
  }

  removeActivity(index){
    var deletedActivity : Activity = this.activities[this.hours[index[0]][index[1]]].activity;
    for(var i=0; i<this.activities.length; i++){
      if(this.activities[i].activity == deletedActivity){
        this.activities.splice(i, 1);
      }
    }
    this.refreshHours();
  }

  displayError(message){
    this.snackBar.open(message, "Close", {duration:3000});
  }

  isCollision(date: Date, activity: Activity, manufLine){
    var this_start = date;
    var duration = 0;
    var collision = false;
    this.activities.forEach(act=>{
      if(act.activity == activity){
        duration = act.duration;
      }
    });
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
    // var returned: boolean = true;
    // activity.sku.manufacturing_lines.forEach(line => {
    //   if(line==manufLine){
    //     returned = false;
    //   };
    // });
    // return returned;
    return false;
  }

  log(e) {
    console.log("LOGGED:");
    console.log(e);
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
          this.refreshHours();
        }
      });
    }
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
}
