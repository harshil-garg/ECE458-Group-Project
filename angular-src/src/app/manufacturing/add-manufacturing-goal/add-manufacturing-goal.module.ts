import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddManufacturingGoalComponent } from './add-manufacturing-goal.component';
import { MatDialogModule, MatListModule, MatProgressBarModule } from '@angular/material';
import { AddManufacturingGoalDialogComponent } from './add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SearchSkuComponent } from './search-sku/search-sku.component';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRippleModule } from '@angular/material';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, MatProgressBarModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRippleModule],
  declarations: [AddManufacturingGoalComponent, AddManufacturingGoalDialogComponent, SearchSkuComponent],
  exports: [AddManufacturingGoalComponent],
  entryComponents: [AddManufacturingGoalDialogComponent], // Add the DialogComponent as entry component
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }]
})
export class AddManufacturingGoalModule { }
