import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ManufacturingScheduleService } from '../manufacturing-schedule.service';
import { ManufacturingGoal } from '../../model/manufacturing-goal';

@Component({
  selector: 'app-search-goals',
  templateUrl: './search-goals.component.html',
  styleUrls: ['./search-goals.component.css']
})
export class SearchGoalsComponent implements OnInit {

  input: string = "";
  goalName: string = "";
  user: string = "";
  inputField : FormControl = new FormControl();
  selectedValue : string = "name";
  selectedGoal : ManufacturingGoal;
  suggestedGoals : Array<ManufacturingGoal> = [];
  @Output() enableGoal : EventEmitter<ManufacturingGoal> = new EventEmitter<ManufacturingGoal>();

  constructor(public manufacturingScheduleService: ManufacturingScheduleService) { }

  ngOnInit() {
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.manufacturingScheduleService.autocomplete({goal: this.goalName, user: this.user}))
   .subscribe( result => {
     console.log(result);
          if(result!=null && result.data!=null){
            this.suggestedGoals = [];
            for(let goal of result.data){
              this.suggestedGoals.push(goal)
            }
         }
         this.suggestedGoals.slice(0,10)
    });
  }

  updateValue(){
    if(this.selectedValue==='name'){
      this.goalName = this.input;
    }
    else{
      this.user = this.input;
    }
  }

  changeInputType(newType){
    this.selectedValue = newType;
    if(newType==='name'){
      this.input = this.goalName;
    }
    else {
      this.input = this.user;
    }
  }

  onSelectionChanged(event){
    this.selectedGoal = event.option.value;
    this.inputField.setValue("");
  }

  enable(){
    this.enableGoal.emit(this.selectedGoal);
    this.selectedGoal = null;
    this.user = "";
    this.goalName = "";
    this.inputField.setValue("");
  }

}
