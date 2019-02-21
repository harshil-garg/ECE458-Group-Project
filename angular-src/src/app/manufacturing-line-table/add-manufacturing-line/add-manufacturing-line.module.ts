import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddManufacturingLineComponent } from './add-manufacturing-line.component';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatIconModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { AddManufacturingLineDialogComponent } from './add-manufacturing-line-dialog/add-manufacturing-line-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
 import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatListModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, MatProgressBarModule, FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule],
  declarations: [AddManufacturingLineComponent, AddManufacturingLineDialogComponent],
  exports: [AddManufacturingLineComponent],
  entryComponents: [AddManufacturingLineDialogComponent], // Add the DialogComponent as entry component
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }]
})
export class AddManufacturingLineModule { }
