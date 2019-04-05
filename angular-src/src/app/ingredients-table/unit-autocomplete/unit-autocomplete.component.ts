import {Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { MatFormField } from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MeasurementUnit } from '../../model/measurement-unit';

@Component({
  selector: 'app-unit-autocomplete',
  templateUrl: './unit-autocomplete.component.html',
  styleUrls: ['./unit-autocomplete.component.css']
})
export class UnitAutocompleteComponent implements OnInit, AfterViewInit {

      measUnits: Array<any>;
      filteredUnits: Observable<string[]>;
      inputField : FormControl = new FormControl();

      @Input() initUnit : string;
      @Output() messageEvent = new EventEmitter<any>();
      @ViewChild(MatFormField) formField: MatFormField;

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

      ngAfterViewInit() {
        if(this.formField!=null && this.formField.underlineRef!=null){
          this.formField.underlineRef.nativeElement.className = null;
        }
      }

      private _filter(value: string): string[] {
        const splitString = value.match(/[a-z]+|[^a-z]+/gi);
        if(splitString==null || splitString.length==0 || (splitString.length>0 && isNaN(+splitString[0]))){
          return [];
        } else if(splitString.length==1){
          return this.measUnits.map(unit=>splitString[0]+unit);
        } else {
          const filterValue = splitString[1].toLowerCase();
          return this.measUnits.filter(option => option.toLowerCase().includes(filterValue)).map(unit=>splitString[0]+unit);
        }
      }

      onSelectionChanged(ev){
        var spliced = ev.option.value.match(/[a-z]+|[^a-z]+/gi);
        var quantity = spliced[0];
        var unit = spliced[1];
        this.messageEvent.emit({
          quantity: quantity,
          unit: unit
        });
      }

      onBlur(form){
        form.underlineRef.nativeElement.className = null;
        var spliced = this.inputField.value.match(/[a-z]+|[^a-z]+/gi);
        if(spliced!=null && spliced.length==2 && !isNaN(+spliced[0])){
          var quantity = spliced[0];
          var unit = spliced[1];
          this.messageEvent.emit({
            quantity: quantity,
            unit: unit
          });
        }
      }

      onFocus(form){
        form.underlineRef.nativeElement.className = "mat-form-field-underline";
      }

}
