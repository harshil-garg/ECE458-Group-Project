import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ManufacturingActivity } from '../model/manufacturing_activity';

@Component({
  selector: 'app-manufacturing-schedule',
  templateUrl: './manufacturing-schedule.component.html',
  styleUrls: ['./manufacturing-schedule.component.css']
})
export class ManufacturingScheduleComponent implements OnInit {
  hours : Array<Array<string>> = [[]];
  starting_hours : Array<Array<string>> = [[]];
  days : Array<Array<string>> = [[]];
  months : Array<Array<string>> = [[]];
  activities : Array<ManufacturingActivity> = [];
  hourHeaders : Array<string> = [];
  manufLines : Array<string> = [];
  currDate : Date = this.zeroedDate();

  constructor() { }

  ngOnInit() {
    this.manufLines.push("Line1");
    this.manufLines.push("Line2");
    this.manufLines.push("Line3");
    var newDate = this.zeroedDate();
    newDate.setHours(12);
    this.activities.push({
      activity: "beats",
      manufacturing_line: "Line1",
      start_date: newDate,
      duration: 3
    });
    var newDate2 = this.zeroedDate();
    newDate2.setHours(8);
    this.activities.push({
      activity: "as",
      manufacturing_line: "Line2",
      start_date: newDate2,
      duration: 3
    });
    this.setupHourHeaders();
    this.refreshHours();
    console.log("REFRESHED");
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
        this.hours[i].push("");
        this.starting_hours[i].push("");
      }
    }
    for(var i=0; i<this.activities.length; i++){//iterate over activities
      var manufIndex = this.manufLines.indexOf(this.activities[i].manufacturing_line);
      if(this.sameDay(this.activities[i].start_date, this.currDate)){
        var hour = this.activities[i].start_date.getHours();
        if(hour>=8 && hour<18){
          this.starting_hours[manufIndex][hour-8] = this.activities[i].activity;
        }
      }
      for(var j=0; j<10; j++){//iterate over hours
        this.currDate.setHours(j+8);
        var currTime = this.currDate.getTime();
        var startTime = this.activities[i].start_date.getTime();
        var endTime = this.activities[i].start_date.getTime() + this.convertToMillis(this.activities[i].duration,0,0,0);
        if(currTime>=startTime && currTime<endTime){
          this.hours[manufIndex][j] = this.activities[i].activity;
        }
      }
    }
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

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    if(event.previousContainer.id === "manufacturing-activities"){
      var currId  = event.container.id.split("-")[1];//still a string, need to convert to int with unary operator (+)
      this.hours[+currId][event.currentIndex] = event.previousContainer.data[event.previousIndex];
    }
    else {
      var prevId = event.previousContainer.id.split("-")[1];
      var prevHour = event.previousContainer.id.split("-")[3];
      var currId = event.container.id.split("-")[1];
      var currHour = event.container.id.split("-")[3];
      var initialValue = this.hours[+prevId][prevHour];
      var updatedDate = this.zeroedDate();
      updatedDate.setHours(8+ (+currHour));
      this.activities.forEach(activity=>{
        if(activity.activity == initialValue){
          activity.start_date = updatedDate;
          activity.manufacturing_line = this.manufLines[+currId];
        }
      });
      this.refreshHours();
      // this.hours[+prevId][prevHour] = "";
      // this.hours[+currId][currHour] = initialValue;
    }
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
    return lists;
  }

}
