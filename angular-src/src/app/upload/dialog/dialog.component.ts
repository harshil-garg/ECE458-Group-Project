import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { UploadService } from '../upload.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import {ValidationData } from '../../model/validation-data';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {
  @ViewChild('file') file;

  public files: Set<File> = new Set();

  constructor(public dialogRef: MatDialogRef<DialogComponent>, public uploadService: UploadService) {}

  ngOnInit() {}

  response;
  canBeClosed = true;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;
  uploadComplete = false;

  errorMode = false;
  collisionMode = false;
  uploadErrorMessage = null;
  succeededMode = false;
  pErrorList = [];
  iErrorList = [];
  sErrorList = [];
  fErrorList = [];
  iChangeList = [];
  sChangeList = [];
  results;
  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  commit(on: boolean) {
    this.collisionMode = false;
    this.uploadService.commit(on).subscribe((val) => {
      if (on) {
        if (val.success) {
          this.succeededMode = true;
        }
      }
    });
    this.canBeClosed = true;
  }

  closeDialog() {
    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful) {
      return this.dialogRef.close();
    }

    // set the component state to "uploading"
    this.uploading = true;

    // start the upload and save the progress map
    this.response = this.uploadService.upload(this.files);

    this.response.progress.subscribe(val => console.log(val));
    this.response.validation.subscribe((val) => {
      this.results = val;
      console.log(val);
      if (val.uploadErrorType) {
        this.uploadErrorMessage = val.uploadErrorType;
         // ... the dialog can be closed again...
         this.canBeClosed = true;
         this.dialogRef.disableClose = false;
 
         // ... the upload was successful...
         this.uploadSuccessful = true;
 
         // ... and the component is no longer uploading
         this.uploading = false;
      }
      else if (val.skus.errorlist.length || val.ingredients.errorlist.length || val.product_lines.errorlist.length || val.formulas.errorlist.length) {
        this.pErrorList = val.product_lines.errorlist;
        this.iErrorList = val.ingredients.errorlist;
        this.sErrorList = val.skus.errorlist;
        this.fErrorList = val.formulas.errorlist;
        this.errorMode = true;
        // ... the dialog can be closed again...
        this.canBeClosed = true;
        this.dialogRef.disableClose = false;

        // ... the upload was successful...
        this.uploadSuccessful = true;

        // ... and the component is no longer uploading
        this.uploading = false;
      }
      else if (val.skus.changelist.length || val.ingredients.changelist.length) {
        this.iChangeList =  val.ingredients.changelist;
        this.sChangeList = val.skus.changelist.length;
        this.collisionMode = true;
      }
      else {
        this.succeededMode = true;
         // ... the dialog can be closed again...
         this.canBeClosed = true;
         this.dialogRef.disableClose = false;
 
         // ... the upload was successful...
         this.uploadSuccessful = true;
 
         // ... and the component is no longer uploading
         this.uploading = false;
      }
    });
    
    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;

    // Hide the cancel-button
    this.showCancelButton = false;
  }

}
