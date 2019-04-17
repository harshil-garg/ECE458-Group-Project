import { Component, OnInit, EventEmitter } from '@angular/core';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { CrudManufacturingLineService } from '../../manufacturing-line-table/crud-manufacturing-line.service';
import { ManufacturingScheduleService } from '../manufacturing-schedule.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';
import {FormControl, NG_VALIDATORS, Validator, ValidatorFn, AbstractControl} from '@angular/forms';
import { ManufacturingScheduleEvent } from '../../model/manufacturing-schedule-event';
import { Activity } from '../../model/activity';
import { MatSnackBar } from '@angular/material';
import {ManufacturingScheduleReportComponent} from '../manufacturing-schedule-report/manufacturing-schedule-report.component';
import { MatDialog } from '@angular/material';
import { AuthenticationService } from '../../authentication.service'

@Component({
  selector: 'app-manufacturing-schedule-display',
  templateUrl: './manufacturing-schedule-display.component.html',
  styleUrls: ['./manufacturing-schedule-display.component.css']
})
export class ManufacturingScheduleDisplayComponent implements OnInit{
  suggestedManufacturingLines = [];
  startDate = new FormControl(new Date());
  endDate = new FormControl(new Date());
  startAutomateDate = new FormControl(new Date());
  endAutomateDate = new FormControl(new Date());
  manufGoalList : Array<ManufacturingGoal> = [];
  reportingFormControl = new FormControl();
  activityList : Array<Activity> = [];
  palette : Array<Activity> = [];
  addedActivities : Array<Activity> = [];
  selectedActivityList : Array<Activity> = [];
  removeEvent: EventEmitter<any> = new EventEmitter();
  refreshScheduler: EventEmitter<boolean> = new EventEmitter();
  goalsUpdated: EventEmitter<Array<ManufacturingGoal>> = new EventEmitter();
  warnings: Array<Array<string>> = [[],[],[],[]];

  constructor(private authenticationService: AuthenticationService, private manufacturingScheduleService: ManufacturingScheduleService, private snackBar: MatSnackBar, private crudManufacturingLineService: CrudManufacturingLineService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.startAutomateDate.value.setHours(8, 0, 0 , 0);
    this.endAutomateDate.value.setHours(18, 0, 0, 0);
    this.manufGoalList = [];
    this.palette = [];
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
    this.warnings[0] = [];
    this.palette.forEach(activity => {
      this.warnings[0].push(activity.sku.name + " (" + activity.manufacturing_goal + ")");
    });
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
    this.refreshPalette();
  }

  refreshPalette(){
    this.palette = [];
    for(let manufGoal of this.manufGoalList){
      manufGoal.sku_tuples.forEach(sku => {
        var alreadyAdded : boolean = false;
        this.addedActivities.forEach(act=>{
          if(act.sku["number"] == sku.sku["number"] && act.manufacturing_goal == manufGoal.name){
            alreadyAdded = true;
          }
        });
        if(!alreadyAdded){
          this.palette.push({
            sku: sku.sku,
            duration: Math.ceil(sku.case_quantity / (+sku.sku.manufacturing_rate)),
            manufacturing_goal: manufGoal.name
          });
        }
      });
    }
  }

  drop(event: CdkDragDrop<Activity>) {
    if(event.previousContainer.id != "manufacturing-activities"){
      var manufLine = event.previousContainer.id.split("-")[1];
      var hour = event.previousContainer.id.split("-")[3];
      this.palette.push(event.previousContainer.data);
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
    this.palette.splice(id, 1);
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
          this.goalsUpdated.emit(this.manufGoalList);
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

  updateActivities(event: Array<ManufacturingScheduleEvent>){
    this.addedActivities = [];
    event.forEach(event => {
      this.addedActivities.push(event.activity);
    });
    this.refreshPalette();
  }

  activityClicked(item, event){
    if(event.shiftKey){
      let index = this.selectedActivityList.indexOf(item);
      if(index == -1){
        this.selectedActivityList.push(item);
      } else {
        this.selectedActivityList.splice(index, 1);
      }
    }
    else {
      this.selectedActivityList = [];
    }
  }

  handleKey(event){
    if(this.palette.length == this.selectedActivityList.length){
      this.selectedActivityList = [];
    }
    else {
      this.selectedActivityList = [];
      for(let activity of this.palette){
        this.selectedActivityList.push(activity);
      }
    }
    event.preventDefault();
  }

  automateSchedule(complex){
    let activities = [];
    for(let activity of this.selectedActivityList){
      console.log(activity);
      activities.push({
        manufacturing_goal: activity.manufacturing_goal,
        sku: activity.sku.number
      });
    };

    this.startAutomateDate.value.setHours(8, 0, 0 ,0 );
    this.endAutomateDate.value.setHours(18, 0, 0, 0);

    if(complex){
      this.manufacturingScheduleService.automate_complex({
        activities: activities,
        start_: this.startAutomateDate.value.toISOString(),
        end_: this.endAutomateDate.value.toISOString()
      }).subscribe(response => {
        this.selectedActivityList = [];
        this.refreshScheduler.emit(true);
        this.displayError(response.message);
      }, err=>{
        if (err.status === 401) {
          console.log("401 Error")
        }
      })
    }else{
      this.manufacturingScheduleService.automate({
        activities: activities,
        start_: this.startAutomateDate.value.toISOString(),
        end_: this.endAutomateDate.value.toISOString()
      }).subscribe(response => {
        this.selectedActivityList = [];
        this.refreshScheduler.emit(true);
        this.displayError(response.message);
        console.log(response.message);
      }, err=>{
        if (err.status === 401) {
          console.log("401 Error")
        }
      });
    }
    
  }


  commit(){
    this.manufacturingScheduleService.commit()
      .subscribe(response => {
        this.refreshScheduler.emit(true);
        this.displayError(response.message);
      }, err=>{
        if (err.status === 401) {
          console.log("401 Error")
        }
      });
  }

  undo(){
    this.manufacturingScheduleService.undo()
      .subscribe(response => {
        this.refreshScheduler.emit(true);
        this.displayError(response.message);
      }, err=>{
        if (err.status === 401) {
          console.log("401 Error")
        }
      });
  }

  public makeReport(value) {
    //console.log("hi"+value+""+this.startDate.value);
    console.log(this.startDate.value + " " + typeof this.startDate.value);
    console.log(this.endDate.value + " " + typeof this.endDate.value);
    console.log(this.reportingFormControl.value + " " + typeof this.reportingFormControl.value);

    this.crudManufacturingLineService.getManufacturingScheduleReport({
      start: this.startDate.value.toISOString(),
      end: this.endDate.value.toISOString(),
      manufacturing_line: this.reportingFormControl.value
    }).subscribe(response => {
      console.log(response);
      console.log("poopycakes");
      if (response.success) {

        console.log("The respone data is " + response.data);
        var activities : Array<any> = [];
        for(let manufacturing_task of response.data) {
          var start_date = new Date(manufacturing_task.start_date);
          var end_date = new Date(start_date.getTime() + manufacturing_task.duration*60*60*1000);
          var duration = manufacturing_task.duration;

          let sku_info = manufacturing_task.activity.sku;
          var sku_display_name = sku_info.name + " : " + sku_info.size + " * " + sku_info.count;
          var sku_id = sku_info.number;
          var sku_case_quantity;
          for (var sku_tuple of manufacturing_task.activity.manufacturing_goal.sku_tuples) {
            if (sku_tuple.sku === sku_info._id) {
              sku_case_quantity = sku_tuple.case_quantity;
            }
          }

          let formula_info = sku_info.formula;
          var formula_id = formula_info.number;
          var formula_name = formula_info.name;
          var formula_ingredient_tuples = formula_info.ingredient_tuples;

          activities.push({
              id: manufacturing_task._id,
              start_date: start_date,
              end_date: end_date,
              duration: duration,
              sku_display_name: sku_display_name,
              sku_id: sku_id,
              sku_case_quantity: sku_case_quantity,
              formula_id: formula_id,
              formula_name: formula_name,
              formula_ingredient_tuples: formula_ingredient_tuples
          });
        }

        let dialogRef = this.dialog.open(ManufacturingScheduleReportComponent, {
          height: '800px',
          width: '1300px',
          data: activities
        });
        console.log(activities);
      }
    }, err => {
      console.log(err);

    });

    /*dialogRef.afterClosed().subscribe(result =>{
      if(result!=null){
        this.manufacturingLine = result;
        this.add(this.manufacturingLine);
      }
    });*/
  }

  isAnalyst() {
    return this.authenticationService.isAnalyst();
  }

  isProductManager() {
    return this.authenticationService.isProductManager();
  }

  isBusinessManager() {
    return this.authenticationService.isBusinessManager();
  }

  isPlantManager() {
    return this.authenticationService.isPlantManager();
  }

  isAdmin() {
    return this.authenticationService.isAdmin();
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
