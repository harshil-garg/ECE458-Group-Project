import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddManufacturingGoalComponent } from './add-manufacturing-goal.component';
import { AddManufacturingGoalDialogComponent } from './add-manufacturing-goal-dialog/add-manufacturing-goal-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SearchSkuComponent } from './search-sku/search-sku.component';
import { MatAutocompleteModule, MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatIconModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatChipsModule, MatButtonToggleModule, MatSlideToggleModule, MatTableModule, MatSnackBar } from '@angular/material';
import { SalesProjectionToolDialogComponent } from './add-manufacturing-goal-dialog/sales-projection-tool-dialog/sales-projection-tool-dialog.component';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatIconModule, MatFormFieldModule, MatInputModule, MatMenuModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatChipsModule, MatButtonToggleModule, MatSlideToggleModule, MatTableModule],
  declarations: [AddManufacturingGoalComponent, AddManufacturingGoalDialogComponent, SearchSkuComponent, SalesProjectionToolDialogComponent],
  exports: [AddManufacturingGoalComponent],
  entryComponents: [AddManufacturingGoalDialogComponent, SalesProjectionToolDialogComponent], // Add the DialogComponent as entry component
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }]
})
export class AddManufacturingGoalModule { }
