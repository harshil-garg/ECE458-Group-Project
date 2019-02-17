import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CalculatorDialogComponent } from './calculator-dialog/calculator-dialog.component';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {

      @Input() manufGoal: string;
      @Input() disabled: boolean;

      constructor(public dialog: MatDialog) {}

      public openDialog() {
        let dialogRef = this.dialog.open(CalculatorDialogComponent, {
          height: '400px',
          width: '1400px',
          data: this.manufGoal
        });
      }
}
