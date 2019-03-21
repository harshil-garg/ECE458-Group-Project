import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MeasurementUnit } from '../../model/measurement-unit';

@Component({
  selector: 'app-unit-autocomplete',
  templateUrl: './unit-autocomplete.component.html',
  styleUrls: ['./unit-autocomplete.component.css']
})
export class UnitAutocompleteComponent implements OnInit {

      measUnits: Array<any>;
      filteredUnits: Observable<string[]>;
      inputField : FormControl = new FormControl();

      @Input() initUnit : string;
      @Output() messageEvent = new EventEmitter<string>();

      constructor() { }

      ngOnInit() {
        this.measUnits = MeasurementUnit.values();
        this.inputField.setValue(this.initUnit);
        this.filteredUnits = this.inputField.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      }

      private _filter(value: string): string[] {
        const splitString = value.match(/[a-z]+|[^a-z]+/gi);
        if(splitString==null || splitString.length==0){
          return [];
        } else if(splitString.length==1){
          return this.measUnits.map(unit=>splitString[0]+unit);
        } else {
          const filterValue = splitString[1].toLowerCase();
          return this.measUnits.filter(option => option.toLowerCase().includes(filterValue)).map(unit=>splitString[0]+unit);
        }
      }

      onSelectionChanged(ev){
        this.messageEvent.emit(ev.option.value);
      }

      onBlur(){
        if(this.inputField.value.match(/[a-z]+|[^a-z]+/gi)!=null && this.inputField.value.match(/[a-z]+|[^a-z]+/gi).length==2){
          this.messageEvent.emit(this.inputField.value);
        }
      }

}
