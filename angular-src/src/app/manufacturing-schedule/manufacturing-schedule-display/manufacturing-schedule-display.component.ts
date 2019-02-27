import { Component, OnInit, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { CrudManufacturingLineService } from '../../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingScheduleService } from '../manufacturing-schedule.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import {FormControl, NG_VALIDATORS, Validator, ValidatorFn, AbstractControl} from '@angular/forms';
import { Activity } from '../../model/activity';
import { MatSnackBar } from '@angular/material';
import {ManufacturingScheduleReportComponent} from '../manufacturing-schedule-report/manufacturing-schedule-report.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  suggestedManufacturingLines = [];
  startDate = new FormControl(new Date());
  endDate = new FormControl(new Date());
  manufGoalList : Array<ManufacturingGoal> = [];
  reportingFormControl = new FormControl();
  activityList : Array<Activity> = [];
  removeEvent: EventEmitter<any> = new EventEmitter();
  goalsUpdated: EventEmitter<any> = new EventEmitter();
  warnings: Array<Array<string>> = [[],[],[],[]];

  constructor(private manufacturingScheduleService: ManufacturingScheduleService, private snackBar: MatSnackBar, private crudManufacturingLineService: CrudManufacturingLineService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.manufGoalList = [];
    this.activityList = [];
    this.populateManufGoalList();

    this.reportingFormControl.valueChanges.debounceTime(200)
		.distinctUntilChanged()
		.switchMap((query) =>  this.crudManufacturingLineService.autocompleteLines(query))
		.subscribe( result => {
      console.log(result);
      console.log(result == null);
      console.log(result.data == null);
			if(result!=null && result.data!=null){
           this.suggestedManufacturingLines = result.data.slice();
           var shortnames : string [] = [];
           for (var line of this.suggestedManufacturingLines) {
             shortnames.push(line.shortname);
           }
           console.log(this.suggestedManufacturingLines);
           console.log(shortnames);
           this.reportingFormControl.setValidators(forbiddenNamesValidator(shortnames));
			 }
     });
     var shortnames : string [] = [];
     this.reportingFormControl.setValidators(forbiddenNamesValidator(shortnames));
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
    this.populateActivityList();
  }

  populateActivityList(){
    this.activityList = [];
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
      this.enable(this.manufGoalList[id], false);
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

  public makeReport(value) {
    console.log("hi"+value+""+this.startDate.value);
    let dialogRef = this.dialog.open(ManufacturingScheduleReportComponent, {
      height: '800px',
      width: '400px'
    });

    /*dialogRef.afterClosed().subscribe(result =>{
      if(result!=null){
        this.manufacturingLine = result;
        this.add(this.manufacturingLine);
      }
    });*/ 
  }

}

export function forbiddenNamesValidator(names: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    // below findIndex will check if control.value is equal to one of our options or not
    const index = names.findIndex(name => {
      return (new RegExp('\^' + name + '\$')).test(control.value);
    });
    return index < 0 ? { 'forbiddenNames': { value: control.value } } : null;
  };
}