import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { UploadResponse } from '../model/upload-response';
import { ValidationData } from '../model/validation-data';

const url = 'api/upload';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};

@Injectable()
export class UploadService {
  constructor(private http: HttpClient) {}

  public upload(files: Set<File>): {
        progress: Observable<number>,
        validation: Observable<ValidationData>
      }  {
    // this will be the our resulting map
    var status = {
      progress: null,
      validation: null
    };
    const formData: FormData = new FormData();

    files.forEach(file => formData.append('file[]', file, file.name));
    // create a http-post request and pass the form
    // tell it to report the upload progress
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true
    });

    // create a new progress-subject for every file
    const progress = new Subject<number>();
    const validation = new Subject<ValidationData>();
    // send the http-request and subscribe for progress-updates

    let startTime = new Date().getTime();
    this.http.request(req).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        // calculate the progress percentage
        const percentDone = Math.round((100 * event.loaded) / event.total);
        progress.next(percentDone);
        
      } else if (event instanceof HttpResponse) {
        // Close the progress-stream if we get an answer form the API
        // The upload is complete
        validation.next(event.body as ValidationData);
        validation.complete();
        progress.complete();
      }
    });

    // Save every progress-observable in a map of all observables
    status= {
      progress: progress.asObservable(),
      validation: validation.asObservable()
    };
      
    
      // return the map of progress.observables
    return status;
  }

  public commit(on: boolean):Observable<ValidationData> {
    return this.http.post<ValidationData>('api/upload/commit', {commit: on}, httpOptions)
  }
}
