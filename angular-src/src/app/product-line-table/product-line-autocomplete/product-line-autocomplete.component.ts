import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CrudProductLineService } from '../crud-product-line.service';

@Component({
  selector: 'app-product-line-autocomplete',
  templateUrl: './product-line-autocomplete.component.html',
  styleUrls: ['./product-line-autocomplete.component.css']
})
export class ProductLineAutocompleteComponent implements OnInit {

  suggestedProductLines: string[] = [];
  inputField : FormControl = new FormControl();

  @Input() initProductLine : string;
  @Output() messageEvent = new EventEmitter<string>();

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

}
