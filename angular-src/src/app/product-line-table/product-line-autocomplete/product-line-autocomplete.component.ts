import { Component, Input, Output, EventEmitter, OnInit, ViewChild, QueryList } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CrudProductLineService } from '../crud-product-line.service';
import { MatFormField } from '@angular/material';

@Component({
  selector: 'app-product-line-autocomplete',
  templateUrl: './product-line-autocomplete.component.html',
  styleUrls: ['./product-line-autocomplete.component.css']
})
export class ProductLineAutocompleteComponent implements OnInit {

  suggestedProductLines: string[] = [];
  inputField : FormControl = new FormControl();

  @Input() initProductLine : string;
  @Input() disableUnderline : boolean;
  @Output() messageEvent = new EventEmitter<any>();
  @ViewChild(MatFormField) formField: MatFormField;

  constructor(public productLineService: CrudProductLineService) { }

  ngOnInit() {
    if(this.initProductLine != null){
      this.inputField.setValue(this.initProductLine);
    }

    this.inputField.valueChanges.debounceTime(200)
    .distinctUntilChanged()
    .switchMap((query) =>  this.productLineService.autocomplete({input: query}))
    .subscribe((result) => {
      if(result!=null && result.data!=null){
        for(let line of result.data){
          this.suggestedProductLines = [];
          this.suggestedProductLines.push(line.name);
        }
      }
    })
  }

  onSelectionChanged(ev){
    this.messageEvent.emit(ev.option.value);
  }

  stopPropagation(ev){
    ev.stopPropagation();
  }

  addUnderline(form){
    if(this.disableUnderline){
      form.underlineRef.nativeElement.className = "mat-form-field-underline";
    }
  }

  removeUnderline(form){
    if(this.disableUnderline){
      form.underlineRef.nativeElement.className = null;
    }
  }

}
