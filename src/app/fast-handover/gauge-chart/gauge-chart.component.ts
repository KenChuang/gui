/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 - 2022 AT&T Intellectual Property
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
import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { A1MediatorService } from '../../services/a1-mediator/a1-mediator.service';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'rd-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit {
  @Input() name: string;
  @Input() canvasWidth: number;
  @Input() optionVal: GaugeOptions;
  @Input() sdlNamespace: string;
  @Input() sdlKey: string;
  @Input() isTracking: boolean;
  @Input() throughput_map: object;

  constructor(private a1MediatorService: A1MediatorService) { }
  public needleValue = 0
  public centralLabel = ''
  public bottomLabel = '0'
  public options = {
    hasNeedle: true,
    needleColor: 'black',
    needleUpdateSpeed: 1000,
    arcColors: ['rgb(167, 0, 0)', 'rgb(0, 120, 5)'],
    arcDelimiters: [70],
    rangeLabel: ['0', '100'],
    needleStartValue: 0,
  }
  public gaugeLimit = 100; // to normalize gauge value
  public exists = true;
  public setTimeoutTask: any;
  public QUERY_INTERVAL: number;

  // bar chart
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      xAxes: [{}],
      yAxes: [{
        ticks: {
          max : 100,
          min: 0
        }
      }] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = ['BS0', 'BS1', 'BS2'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'BS Loading (%)' },
    { data: [], label: 'Connected UEs' }
  ];

  ngOnInit(): void {
    this.options.arcColors = this.optionVal.arcColors;
    this.options.rangeLabel = this.optionVal.rangeLabel;
    this.gaugeLimit /= Number(this.options.rangeLabel[this.options.rangeLabel.length - 1]);
    this.options.arcDelimiters = [...this.optionVal.arcDelimiters];
    // process arcDelimiters
    for (let i = 0; i < this.options.arcDelimiters.length; i++) {
      this.options.arcDelimiters[i] = Math.floor(this.options.arcDelimiters[i] * this.gaugeLimit);
    }
    this.QUERY_INTERVAL = 1000; // 1s
    this.startQuery();
  }

  ngOnDestroy(): void {
    this.stopQuery();
  }

  startQuery(): void {
    let func = function(vm) {
      if (!vm.exists) {
        clearTimeout(vm.setTimeoutTask);
        return;
      }
      if (vm.isTracking) {
        switch (vm.optionVal.gaugeType) {
          case 'PERFORMANCE':
            vm.a1MediatorService.getSdlData(vm.sdlNamespace, vm.sdlKey)
            .subscribe((res: string) => {
              let key = vm.sdlKey + '_time';
              if (res[0][key] != undefined) {
                let delay = Math.floor(res[0][vm.sdlKey + '_time'] / 1000);
                vm.bottomLabel = delay;
                vm.needleValue = Math.floor(vm.gaugeLimit * delay);
              } else {
                console.log('Performance %s no data.', key);
              }
            });
            break;
          case 'THROUGHPUT':
            if (vm.throughput_map[vm.sdlKey]) {
              let throughput = vm.throughput_map[vm.sdlKey].value;
              vm.bottomLabel = throughput;
              vm.needleValue = Math.floor(vm.gaugeLimit * throughput);
              break;
            } else {
              console.log('SDL no data for %s', vm.sdlKey);
            }
            break;
        }
        console.log(vm.needleValue);
        console.log(vm.centralLabel);
        console.log(vm.options)
        console.log(vm.name)          // UE1
        console.log(vm.bottomLabel)   // 數值
      }
      vm.setTimeoutTask = setTimeout(func, vm.QUERY_INTERVAL, vm);
    }
    func(this);
  }

  stopQuery(): void {
    this.exists = false;
    clearTimeout(this.setTimeoutTask);
  }
}

export class GaugeOptions {
  public arcColors: Array<string>;
  public arcDelimiters: Array<number>;
  public rangeLabel: Array<string>;
  public gaugeType: string; // PERFORMANCE, THROUGHPUT
}
