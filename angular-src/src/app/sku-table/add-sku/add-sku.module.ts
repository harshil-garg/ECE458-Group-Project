import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddSkuComponent } from './add-sku.component';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { AddSkuDialogComponent } from './add-sku-dialog/add-sku-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IngredientAutocompleteModule } from '../ingredient-autocomplete/ingredient-autocomplete.module';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, MatProgressBarModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, IngredientAutocompleteModule, MatInputModule],
  declarations: [AddSkuComponent, AddSkuDialogComponent],
  exports: [AddSkuComponent],
  entryComponents: [AddSkuDialogComponent], // Add the DialogComponent as entry component
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }]
})
export class AddSkuModule { }
