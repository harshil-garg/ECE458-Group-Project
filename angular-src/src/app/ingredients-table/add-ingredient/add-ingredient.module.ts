import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddIngredientComponent } from './add-ingredient.component';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatIconModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { AddIngredientDialogComponent } from './add-ingredient-dialog/add-ingredient-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResponseDialogComponent } from './response-dialog/response-dialog.component';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatIconModule, MatFormFieldModule, MatInputModule],
  declarations: [AddIngredientComponent, AddIngredientDialogComponent, ResponseDialogComponent],
  exports: [AddIngredientComponent],
  entryComponents: [AddIngredientDialogComponent, ResponseDialogComponent], // Add the DialogComponent as entry component
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }]
})
export class AddIngredientModule { }
