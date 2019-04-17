import { Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddFormulaDialogComponent } from './add-formula-dialog/add-formula-dialog.component';
import { CrudFormulaService, Response } from '../crud-formula.service';
import { FormulaTableComponent } from '../formula-table.component';

import { Formula } from '../../model/formula';

@Component({
  selector: 'app-add-formula',
  templateUrl: './add-formula.component.html',
  styleUrls: ['./add-formula.component.css']
})
export class AddFormulaComponent {

  @Input() disabled = false;
  formula: Formula = new Formula();

  constructor(public dialog: MatDialog, public crudFormulaService: CrudFormulaService,
    public formulaTableComponent: FormulaTableComponent, private snackBar: MatSnackBar) { }


  public openDialog(){
    let dialogRef = this.dialog.open(AddFormulaDialogComponent, {
      height: '800px',
      width: '400px',
      data: this.formula
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.formula = result;
        console.log(this.formula);
        this.add(this.formula);
      }
    });
  }

  add(formula: Formula) {
    this.crudFormulaService.add({
        name : formula.name,
        number : formula.number.toString(),
        ingredient_tuples : formula.ingredient_tuples,
        comment : formula.comment
      }).subscribe(
      response => this.handleResponse(response),
      err => {
        if (err.status === 401) {
          console.log("401 Error")
        }
      }
    );
  }

  private handleResponse(response: Response) {
    if (!response.success) {
      this.snackBar.open(response.message, "Close", {duration:3000});
    } else {
      this.formulaTableComponent.increasePageSize();
      this.formulaTableComponent.refresh();
    }
    console.log(response);
    this.formulaTableComponent.refresh();
  }

}
