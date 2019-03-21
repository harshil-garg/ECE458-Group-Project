import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FilterFormulaService } from '../filter-formula.service';
import { Formula } from '../../model/formula';

@Component({
  selector: 'app-formula-autocomplete',
  templateUrl: './formula-autocomplete.component.html',
  styleUrls: ['./formula-autocomplete.component.css']
})
export class FormulaAutocompleteComponent implements OnInit {

    suggestedFormulas: Formula[];
    inputField : FormControl = new FormControl();

    @Input() initFormula : Formula;
    @Output() messageEvent = new EventEmitter<any>();

    constructor(public filterFormulaService: FilterFormulaService) { }

    ngOnInit() {
      this.inputField.setValue( {name: this.initFormula.name});
      this.inputField.valueChanges.debounceTime(200)
     .distinctUntilChanged()
     .switchMap((query) =>  this.filterFormulaService.autocomplete({input: query}))
     .subscribe( result => {
            if(result!=null && result.data!=null){
              this.suggestedFormulas = [];
              for(let formula of result.data){
                this.suggestedFormulas.push(formula)
            }
           }
           this.suggestedFormulas.slice(0,10)
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

    displayFn(formula?: Formula): string | undefined {
      return formula ? formula.name : undefined;
    }
}
