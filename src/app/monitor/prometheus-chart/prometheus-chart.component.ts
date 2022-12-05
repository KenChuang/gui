/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 - 2021 AT&T Intellectual Property
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */
import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { A1MediatorService } from '../../services/a1-mediator/a1-mediator.service';

@Component({
  selector: 'rd-prometheus-chart',
  templateUrl: './prometheus-chart.component.html',
  styleUrls: ['./prometheus-chart.component.scss']
})
export class PrometheusChartComponent implements OnInit {
  // chart config related
  public setTimeoutTask;
  @Input() updateInterval : number;
  @Input() lineChartRange: number;
  @Input() chartLabels: any;
  @Input() prometheusUrl: string;

  public updateIntervalOptions = [
    {value: 5, viewValue: '5s'},
    {value: 10, viewValue: '10s'},
    {value: 30, viewValue: '30s'},
    {value: 60, viewValue: '1m'},
    {value: 300, viewValue: '5m'},
    {value: 900, viewValue: '15m'},
    {value: 1800, viewValue: '30m'},
    {value: 3600, viewValue: '1hr'}
  ];
  public lineChartRangeOptions = [
    {value: 5, viewValue: '5m'},
    {value: 15, viewValue: '15m'},
    {value: 30, viewValue: '30m'},
    {value: 60, viewValue: '1hr'},
    {value: 180, viewValue: '3hr'},
    {value: 360, viewValue: '6hr'}
  ];

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[] = [];
  public vm = this;
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        }
      ]
    },
    // tooltips: {
    //   callbacks: {
    //     label(tooltipItem): string | string[] {
    //       console.log(tooltipItem);
    //       console.log(this);
    //       return 'aaa';
    //     }
    //   }
    // }
  };
  public lineChartColors: Color[] = [
    { // green
      backgroundColor: 'rgba(0, 128, 0, 0.3)',
      borderColor: 'green',
      pointBackgroundColor: 'rgba(0, 128, 0, 1)',
      pointBorderColor: '#008000',
      pointHoverBackgroundColor: '#008000',
      pointHoverBorderColor: 'rgba(0, 128, 0, 0.8)'
    },
    { // navy
      backgroundColor: 'rgba(0, 0, 128, 0.3)',
      borderColor: 'navy',
      pointBackgroundColor: 'rgba(0, 0, 128, 1)',
      pointBorderColor: '#000080',
      pointHoverBackgroundColor: '#000080',
      pointHoverBorderColor: 'rgba(0, 0, 128, 0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private httpClient: HttpClient, private a1MediatorService: A1MediatorService) { }

  ngOnInit(): void {
    for (let i = 0; i < 50; i++) {
      this.lineChartData.push({ data: [], label: '' });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.setTimeoutTask);
  }

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.setTimeoutTask);
    this.getPrometheusData();
  }

  public getPrometheusData(): void {
    let func = function(vm) {
      let end = Math.floor(new Date().getTime() / 1000);
      let start = end - vm.lineChartRange * 60;
      vm.a1MediatorService.getPrometheusData(vm.prometheusUrl, start, end, 15)
      .subscribe((res: string) => {
        vm.lineChartLabels.length = 0;
        let results = res['data']['result'];
        vm.lineChartData.length = results.length;
        for (let i = 0; i < vm.lineChartData.length; i++) {
          vm.lineChartData[i].data.length = 0;
        }
        for (let resultId = 0; resultId < results.length; resultId++) {
          vm.lineChartData[resultId].label = results[resultId]['metric']['id'];
          let dataArray = results[resultId]['values'];
          let categoryInterval = Math.floor(dataArray.length / 10);
          for (let id = 0; id < dataArray.length; id++) {
            let date = new Date(dataArray[id][0] * 1000);
            let hour = date.getHours().toString();
            if (hour.length == 1) {
              hour = '0' + hour;
            }
            let minute = date.getMinutes().toString();
            if (minute.length == 1) {
              minute = '0' + minute;
            }
            let second = date.getSeconds().toString();
            if (second.length == 1) {
              second = '0' + second;
            }
            // set categories
            if (id % categoryInterval == 0) {
              vm.lineChartLabels[id] = hour + ':' + minute + ':' + second;
            } else {
              vm.lineChartLabels[id] = '';
            }
            // set data
            vm.lineChartData[resultId].data[id] = dataArray[id][1];
          }
        }
        vm.chart.update();
      });
      vm.setTimeoutTask = setTimeout(func, vm.updateInterval * 1000, vm);
    }
    func(this);
  }

  public onUEDisplayRangeChange(value): void {
    this.lineChartRange = value;
    clearTimeout(this.setTimeoutTask);
    this.getPrometheusData();
  }
}
