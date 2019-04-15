import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { Formula } from '../../model/formula';

@Component({
  selector: 'app-formula-view-dialog',
  templateUrl: './formula-view-dialog.component.html',
  styleUrls: ['./formula-view-dialog.component.css']
})
export class FormulaViewDialogComponent implements OnInit {

  formula: Formula;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.formula = this.data.formula;
  }

}
