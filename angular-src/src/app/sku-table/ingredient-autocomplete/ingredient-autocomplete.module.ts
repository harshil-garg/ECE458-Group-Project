import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IngredientAutocompleteComponent } from '../ingredient-autocomplete/ingredient-autocomplete.component';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, MatProgressBarModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  declarations: [IngredientAutocompleteComponent],
  exports: [IngredientAutocompleteComponent]
})
export class IngredientAutocompleteModule { }
