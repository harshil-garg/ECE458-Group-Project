import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { MatButtonModule, MatDialogModule, MatListModule, MatProgressBarModule, MatTableModule, MatIconModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UploadService } from './upload.service';
import { HttpClientModule } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, MatListModule, MatTableModule, FlexLayoutModule, HttpClientModule, BrowserAnimationsModule, MatTabsModule, MatProgressBarModule, MatCardModule],
  declarations: [UploadComponent],
  exports: [UploadComponent],
  providers: [UploadService]
})
export class UploadModule {}
