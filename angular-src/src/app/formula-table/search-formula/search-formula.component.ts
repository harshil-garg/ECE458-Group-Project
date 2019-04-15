import { Component, OnInit } from '@angular/core';
import { FormulaTableComponent } from '../formula-table.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-search-formula',
  templateUrl: './search-formula.component.html',
  styleUrls: ['./search-formula.component.css']
})
export class SearchFormulaComponent implements OnInit {

    keywords : Array<any> = [];
    inputField : FormControl = new FormControl();
    auto: any;
    constructor(public formulaTableComponent: FormulaTableComponent) { }

    ngOnInit() {
    }

    keyPressed(event){
      if(event.keyCode == 13){ //enter pressed
        this.keywords.push(this.inputField.value);
        this.formulaTableComponent.setKeywords(this.keywords);
        this.inputField.setValue('');
      }
    }

    remove(index: number){
      this.keywords.splice(index, 1);
      this.formulaTableComponent.setKeywords(this.keywords);
    }

}
