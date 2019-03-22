import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AccountsService } from '../../accounts.service';

@Component({
  selector: 'app-customer-autocomplete',
  templateUrl: './customer-autocomplete.component.html',
  styleUrls: ['./customer-autocomplete.component.css']
})
export class CustomerAutocompleteComponent implements OnInit {

  suggestedUsers: string[];
  inputField : FormControl = new FormControl();

  @Input() initUser : string;
  @Output() messageEvent = new EventEmitter<any>();

  constructor(public accountsService: AccountsService) { }

  ngOnInit() {
    this.inputField.setValue(this.initUser);
    this.inputField.valueChanges.debounceTime(200)
   .distinctUntilChanged()
   .switchMap((query) =>  this.accountsService.autocompleteUsers(query))
   .subscribe( result => {
          if(result!=null && result.data!=null){
            this.suggestedUsers = ["all"];
            for(let user of result.data){
              this.suggestedUsers.push(user.email)
          }
         }
         this.suggestedUsers.slice(0,10)
    });
  }

  onSelectionChanged(ev){
    this.messageEvent.emit(ev.option.value);
  }

  onBlur(){
    // var spliced = this.inputField.value.match(/[a-z]+|[^a-z]+/gi);
    // if(spliced!=null && spliced.length==2){
    //   var quantity = spliced[0];
    //   var unit = spliced[1];
    //   this.messageEvent.emit({
    //     quantity: quantity,
    //     unit: unit
    //   });
    // }
  }

  stopPropagation(ev){
    ev.stopPropagation();
  }

  displayFn(user: string): string | undefined {
    return user;
  }
}
