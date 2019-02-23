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
      duration: 10
    })
    for(var i=0; i<2; i++){
      this.hours[i] = [];
      for(var j=0; j<24; j++){
        this.hours[i].push("");
      }
    }
    this.hours[0][1] = "hello world";
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event.previousIndex);
    console.log(event.currentIndex);
    console.log(event.currentIndex - event.previousIndex);
    console.log(event);
    var initialValue = this.hours[0][event.previousIndex];
    this.hours[0][event.previousIndex] = this.hours[0][event.currentIndex]
    this.hours[0][event.currentIndex] = initialValue;
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //                     event.container.data,
    //                     event.previousIndex,
    //                     event.currentIndex);
    // }
  }

  move(event) {
    console.log(event);
    this.hours[0][event.currentIndex] = this.hours[0][event.previousIndex];
  }

  log(e) {
    console.log("LOGGED:");
    console.log(e);
  }

}
