import { Component, OnInit, Input, ViewChild, DoCheck, IterableDiffers } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { SalesRecord } from '../../../model/sales-record';
import { Observable } from 'rxjs';
// import * as pluginAnnotations from 'chartjs-plugin-annotation';

@Component({
  selector: 'app-line-graph',
  templateUrl: './line-graph.component.html',
  styleUrls: ['./line-graph.component.css']
})
export class LineGraphComponent implements OnInit, DoCheck {
  public lineChartData: ChartDataSets[] = [{data:[], label:'', spanGaps:true}];
  // [
  //   { data: [65, null, null, 81, null, 55, 40], label: 'Series A', spanGaps: true},
  //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
  //   { data: [180, 480, 770, 90, 1000, 270, 400], label: 'Series C', yAxisID: 'y-axis-1' }
  // ];
  public lineChartLabels: Label[] = [];// = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Week'
        }
    }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'Revenue ($)'
          }
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  iterableDiffer;
  // public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @Input() recordList: Array<SalesRecord>;

  constructor(private _iterableDiffers: IterableDiffers) {
      this.iterableDiffer = _iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
  }

  ngDoCheck() {
    let changes = this.iterableDiffer.diff(this.recordList);
    if (changes) {
      var max_date = -1;
      var min_date = -1;
      this.recordList.forEach(rec => {
        var date = rec.year*52 + rec.week;
        if(max_date == -1 || max_date<date){
          max_date = date;
        }
        if(min_date == -1 || min_date>date){
          min_date = date;
        }
      });
      this.lineChartLabels = [];
      this.lineChartData = [];
      var dataArray = [];
      for(var i=min_date-3; i<max_date+3; i++){
        this.lineChartLabels.push("Week " + (i%52) + " Year " + Math.floor(i/52));
        var dateData = undefined;
        this.recordList.forEach(rec => {
          if(i == rec.year*52 + rec.week){
            dateData = rec.revenue;
          }
        });
        dataArray.push(dateData);
      }
      this.lineChartData.push({ data: dataArray, label: this.recordList[0].customer_name, spanGaps: true});
    }
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
    console.log(this.recordList);
  }

  public hideOne() {
    const isHidden = this.chart.isDatasetHidden(1);
    this.chart.hideDataset(1, !isHidden);
  }
}
