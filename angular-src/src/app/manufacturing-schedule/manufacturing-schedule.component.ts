import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { CrudManufacturingLineService } from '../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingScheduleEvent } from '../model/manufacturing-schedule-event';
import { ManufacturingScheduleDisplayComponent } from './manufacturing-schedule-display/manufacturing-schedule-display.component';
import { Activity } from '../model/activity';
import { Sku } from '../model/sku';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule',
  templateUrl: './manufacturing-schedule.component.html',
  styleUrls: ['./manufacturing-schedule.component.css']
})
export class ManufacturingScheduleComponent implements OnInit {
  hours : Array<Array<Activity>> = [[]];
  starting_hours : Array<Array<string>> = [[]];
  days : Array<Array<string>> = [[]];
  months : Array<Array<string>> = [[]];
  activities : Array<ManufacturingScheduleEvent> = [];
  hourHeaders : Array<string> = [];
  manufLines : Array<string> = [];
  currDate : Date = this.zeroedDate();

  constructor(private crudManufacturingLineService: CrudManufacturingLineService, private snackBar: MatSnackBar,
    public manufacturingScheduleDisplayComponent: ManufacturingScheduleDisplayComponent) { }

  ngOnInit() {
    this.populateManufLines();
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
        this.hours[i].push(null);
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
          this.hours[manufIndex][j] = this.activities[i].activity;
        }
      }
    }
    console.log("REFRESHEDHOURS");
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
      var initialValue = this.hours[+prevId][prevHour];
      var updatedDate = this.zeroedDate();
      updatedDate.setHours(8+ (+currHour));
      if(!this.isCollision(updatedDate, initialValue, this.manufLines[+currId])){
        this.activities.forEach(activity=>{
          if(activity.activity.sku.name == initialValue.sku.name){
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

  displayError(message){
    this.snackBar.open(message, "Close", {duration:3000});
  }

  isCollision(date: Date, activity, manufLine){
    var this_start = date;
    var duration = 0;
    var collision = false;
    this.activities.forEach(act=>{
      if(act.activity.sku.name == activity){
        duration = act.duration;
      }
    });
    var this_end = this.calculateEndTime(date, duration);
    this.activities.forEach(act=>{
      if(act.activity.sku.name != activity && act.manufacturing_line == manufLine){
        var act_start = act.start_date;
        var act_end = this.calculateEndTime(act.start_date, act.duration);
        if(!(this_end.getTime() <= act_start.getTime() || this_start.getTime() >= act_end.getTime())){ //collision
          collision = true;
        }
      }
    });
    return collision;
  }

  move(event) {
    console.log(event);
    this.hours[0][event.currentIndex] = this.hours[0][event.previousIndex];
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

}
