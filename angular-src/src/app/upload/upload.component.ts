import { MatSnackBar } from '@angular/material';
import { Component, OnInit, ViewChild } from '@angular/core';
import {ValidationData } from '../model/validation-data';
import { UploadService } from './upload.service';
import {AuthenticationService} from '../authentication.service';
import {UploadState} from './uploadStates';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @ViewChild('file') file;

  public files: Set<File> = new Set();

  constructor(public uploadService: UploadService, public authService: AuthenticationService, public snackBar: MatSnackBar) {}

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
  fChangeList = [];
  sdisplayedColumns: string[] = ['SKU#','Name','Case UPC','Unit UPC','Unit size','Count per case','PL Name','Formula#','Formula factor','ML Shortnames' ,'Rate', 'Mfg setup cost','Mfg run cost','Comment'];
  esdisplayedColumns: string[] = ['message', 'SKU#','Name','Case UPC','Unit UPC','Unit size','Count per case','PL Name','Formula#','Formula factor','ML Shortnames' ,'Rate','Mfg setup cost','Mfg run cost','Comment'];
  idisplayedColumns: string[] = ['Ingr#','Name','Vendor Info','Size','Cost','Comment'];
  eidisplayedColumns: string[] = ['message', 'Ingr#','Name','Vendor Info','Size','Cost','Comment'];
  fdisplayedColumns: string[] = ['Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
  efdisplayedColumns: string[] = ['message', 'Formula#', 'Name', 'Ingr#', 'Quantity', 'Comment'];
  pdisplayedColumns: string[] = ['Name'];
  epdisplayedColumns: string[] = ['message', 'Name'];
  results;

// TODO: FIX DELETING FILES
  onFilesAdded() {
    console.log('called');
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
            this.changeState(UploadState.SELECTING);
            this.snackBar.open(val.uploadErrorType, "close", {duration: 3000});
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
        this.pErrorList = [];
        val.product_lines.errorlist.forEach((element) => {
          this.pErrorList.push({
            message: element['message'],
            Name: element.data['Name']
          })
        });
        this.iErrorList = [];
        val.ingredients.errorlist.forEach((element) => {
          this.iErrorList.push({
            message: element['message'],
            'Ingr#': element.data['Ingr#'],
            'Vendor Info': element.data['Vendor Info'],
            'Size' : element.data['Size'],
            'Cost': element.data['Cost'],
            'Comment' : element.data['Comment'],
            'Name': element.data['Name']
          })
        });
        this.sErrorList = [];
        val.skus.errorlist.forEach((element) => {
          this.sErrorList.push({
            message: element['message'],
            'SKU#': element.data['SKU#'],
            'Case UPC': element.data['Case UPC'],
            'Unit UPC': element.data['Unit UPC'],
            'Unit size' : element.data['Unit size'],
            'Count per case': element.data['Count per case'],
            'Comment' : element.data['Comment'],
            'Name': element.data['Name'],
            'PL Name': element.data['PL Name'],
            'Formula#': element.data['Formula#'],
            'Formula factor': element.data['Formula factor'],
            'ML Shortnames': element.data['ML Shortnames'],
            'Mfg setup cost': element.data['Mfg setup cost'],
            'Mfg run cost': element.data['Mfg run cost'],
            'Rate': element.data['Rate'],
          })
        });
        this.fErrorList = [];
        val.formulas.errorlist.forEach((element) => {
          this.fErrorList.push({
            message: element['message'],
            'Formula#': element.data['Formula#'],
            'Ingr#': element.data['Ingr#'],
            'Quantity' : element.data['Quantity'],
            'Comment' : element.data['Comment'],
            'Name': element.data['Name']
          })
        });

        this.changeState(UploadState.SHOWING_ERRORS);
      }
      else if (val.skus.changelist.length || val.ingredients.changelist.length || val.formulas.changelist.length) {
        console.log(val.formulas.changelist)
        this.iChangeList =  val.ingredients.changelist;
        this.sChangeList = val.skus.changelist;
        this.fChangeList = val.formulas.changelist;
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
    return this.results.formulas.createlist.length || this.results.formulas.changelist.length;
  }
  ingredientsImported(): boolean {
    return this.results.ingredients.createlist.length || this.results.ingredients.changelist.length ||  this.results.ingredients.ignorelist.length;
  }
  skusImported(): boolean {
    return  this.results.skus.createlist.length || this.results.skus.changelist.length || this.results.skus.ignorelist.length;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
