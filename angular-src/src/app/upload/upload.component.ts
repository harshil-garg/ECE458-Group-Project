
import { MatDialog, MatSnackBar } from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs/observable/forkJoin';
import {ValidationData } from '../model/validation-data';
import { UploadService } from './upload.service';
import {UploadState} from './uploadStates';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @ViewChild('file') file;

  public files: Set<File> = new Set();

  constructor(public uploadService: UploadService, public snackBar: MatSnackBar) {}

  ngOnInit() {}

  uploadState = UploadState.SELECTING;
  isUploading = false;

  response;
  primaryButtonText = 'Upload';

  pErrorList = [];
  iErrorList = [];
  sErrorList = [];
  fErrorList = [];
  iChangeList = [];
  sChangeList = [];
  sdisplayedColumns: string[] = ['SKU#','Name','Case UPC','Unit UPC','Unit size','Count per case','PL Name','Formula#','Formula factor','ML Shortnames' ,'Rate','Comment'];
  idisplayedColumns: string[] = ['Ingr#','Name','Vendor Info','Size','Cost','Comment'];
  fdisplayedColumns: string[] = ['Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
  pdisplayedColumns: string[] = ['Name'];
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

  removeFile(toDelete: File) {
    this.files.delete(toDelete);
  }

  commit(on: boolean) {
      if (!on) {
        this.changeState(UploadState.SELECTING);
      }
      this.uploadService.commit(on).subscribe((val) => {
        if (on) {
          if (val.success) {
            this.changeState(UploadState.SUCCESS);
          }
          else {
            this.snackBar.open(val.uploadErrorType, "close", {duration: 3000});
            this.changeState(UploadState.SELECTING);
          }
        }
        else if (!on && !val.success){
          this.snackBar.open(val.uploadErrorType, "close", {duration: 3000});
        }
      });
  }

  sendFiles() {

    // start the upload and save the progress map
    this.response = this.uploadService.upload(this.files);
    this.isUploading = true;
    this.response.progress.subscribe(val => console.log(val));
    this.response.validation.subscribe((val) => {
      this.isUploading = false;
      this.results = val;
      console.log(val);
      if (val.uploadErrorType) {
        this.snackBar.open(val.uploadErrorType, "close", {duration: 3000});
        this.changeState(UploadState.SELECTING);
      }
      else if (val.skus.errorlist.length || val.ingredients.errorlist.length || val.product_lines.errorlist.length || val.formulas.errorlist.length) {
        this.pErrorList = val.product_lines.errorlist;
        this.iErrorList = val.ingredients.errorlist;
        this.sErrorList = val.skus.errorlist;
        this.fErrorList = val.formulas.errorlist;

        this.changeState(UploadState.SHOWING_ERRORS);
      }
      else if (val.skus.changelist.length || val.ingredients.changelist.length) {
        this.iChangeList =  val.ingredients.changelist;
        this.sChangeList = val.skus.changelist;
        this.changeState(UploadState.CONFIRMING);
      }
      else {
        this.changeState(UploadState.SUCCESS);
      }
    });
    
    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';
  }

  changeState(state: UploadState) {
    this.uploadState = state;
  }

  restartUpload() {
    this.files = new Set<File>();
    this.changeState(UploadState.SELECTING);
  }

  inSelectingState(): boolean {
    return this.uploadState == UploadState.SELECTING;
  }

  inConfirmingState(): boolean {
    return this.uploadState == UploadState.CONFIRMING;
  }

  inSuccessState(): boolean {
    return this.uploadState == UploadState.SUCCESS;
  }

  inErrorState(): boolean {
    return this.uploadState == UploadState.SHOWING_ERRORS;
  }

  filesSelected(): boolean {
    length = 0;
    this.files.forEach((file) => {
      length++;
    });
    return length>0;
  }

  hasElements(array: [any]) {
    return array.length > 0;
  }

  productLinesImported(): boolean {
    return this.results.product_lines.createlist.length || this.results.product_lines.ignorelist.length;
  }
  formulasImported(): boolean {
    return this.results.formulas.createlist.length || this.results.formulas.ignorelist.length;
  }
  ingredientsImported(): boolean {
    return this.results.ingredients.createlist.length || this.results.ingredients.changelist.length ||  this.results.ingredients.ignorelist.length;
  }
  skusImported(): boolean {
    return  this.results.skus.createlist.length || this.results.skus.changelist.length || this.results.skus.ignorelist.length;
  }
}
