import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-goals',
  templateUrl: './search-goals.component.html',
  styleUrls: ['./search-goals.component.css']
})
export class SearchGoalsComponent implements OnInit {

  input: string = "";
  goalName: string = "";
  user: string = "";
  selectedValue : string = "name";

  constructor() { }

  ngOnInit() {
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

}
