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
  days : Array<Array<string>> = [[]];
  months : Array<Array<string>> = [[]];
  activities : Array<ManufacturingActivity> = [];
  hourHeaders : Array<string> = [];
  manufLines : Array<string> = [];

  constructor() { }

  ngOnInit() {
    this.manufLines.push("Line1");
    this.manufLines.push("Line2");
    this.manufLines.push("Line3");
    var newDate = new Date();
    this.activities.push({
      activity: "beats",
      manufacturing_line: "Line1",
      start_date: newDate,
      duration: 3
    })
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
    for(var i=0; i<this.manufLines.length; i++){
      this.hours[i] = [];
      for(var j=0; j<10; j++){
        this.hours[i].push("");
      }
    }
    this.hours[0][1] = "hello world";
    this.hours[2][5] = "sup";
  }

  drop(event: CdkDragDrop<string[]>) {
    if(event.previousContainer.id === "manufacturing-activities"){
      var currId  = event.container.id.substring(5);//still a string, need to convert to int with unary operator (+)
      this.hours[+currId][event.currentIndex] = event.previousContainer.data[event.previousIndex];
    }
    else {
      var prevId = event.previousContainer.id.substring(5);
      var currId = event.container.id.substring(5);
      var initialValue = this.hours[prevId][event.previousIndex];
      this.hours[+prevId][event.previousIndex] = "";
      this.hours[+currId][event.currentIndex] = initialValue;
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
      lists.push("list-"+i);
    }
    return lists;
  }

}
