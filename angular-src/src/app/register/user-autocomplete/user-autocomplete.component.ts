import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AccountsService } from '../../accounts.service';

@Component({
  selector: 'app-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.css']
})
export class UserAutocompleteComponent implements OnInit {

    suggestedUsers = [];
    inputField : FormControl = new FormControl();

    @Input() initUser : string;
    @Output() messageEvent = new EventEmitter<any>();

    constructor(private accountsService: AccountsService) { }

    ngOnInit() {
      if(this.initUser != null){
        this.inputField.setValue(this.initUser);
      }

      this.inputField.valueChanges.debounceTime(200)
      .distinctUntilChanged()
      .switchMap((query) =>  this.accountsService.autocompleteUsers(query))
  		.subscribe( result => {
  			if(result!=null && result.data!=null){
  					 this.suggestedUsers = result.data.slice();
  			 }
  		 });
    }

    onSelectionChanged(ev){
      this.messageEvent.emit(ev.option.value);
    }

    stopPropagation(ev){
      ev.stopPropagation();
    }
}
