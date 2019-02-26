import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  exportJSON(headers: Array<String>, data: Array<any>, fileName: string) {
    let blob = new Blob([this.stringifyToCSV(headers, data)], { "type": "text/csv;charset=utf8;" });
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  }

  private stringifyToCSV(headers: Array<String>, data: Array<any>) {
    let output = ``;
    let counter = 0;
    headers.forEach((header) => {
        output += `${header}${counter == headers.length-1 ? '\n' : ','}`;
        counter++;
    });
    data.forEach((row) => {
        counter = 0;
        headers.forEach((header) => {
            output += `${row[`${header}`]}${counter == headers.length-1 ? '\n' : ','}`;
            counter++;
        });
    });
    return output;
  }
}
