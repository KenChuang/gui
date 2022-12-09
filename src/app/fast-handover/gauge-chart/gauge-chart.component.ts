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
import { A1MediatorService } from '../../services/a1-mediator/a1-mediator.service';
import { FastHandoverComponent } from '../fast-handover.component';

@Component({
  selector: 'rd-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit {
  @Input() fastHandoverComponent: FastHandoverComponent;
  @Input() ueList = [];
  @Input() idx: number;
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
    let func = function (vm) {
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
                  vm.updatBarData();
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
              vm.updatBarData();
              break;
            } else {
              console.log('SDL no data for %s', vm.sdlKey);
            }
            break;
        }
        // console.log(vm.needleValue);
        // console.log(vm.centralLabel);
        // console.log(vm.options)
        // console.log(vm.name)          // UE1
        // console.log(vm.bottomLabel)   // 數值
      }
      vm.setTimeoutTask = setTimeout(func, vm.QUERY_INTERVAL, vm);
    }
    func(this);
  }

  stopQuery(): void {
    this.exists = false;
    clearTimeout(this.setTimeoutTask);
  }

  updatBarData() {
    const data: any = this.fastHandoverComponent.barChartData[0].data.slice(0);
    data[this.idx] = this.bottomLabel as any;
    this.fastHandoverComponent.barChartData[0].data = data;

    // const selectGnb = this.fastHandoverComponent.selectGnb;
    // this.ueList[this.idx]['__barValue'] = this.bottomLabel;
    // const data = [];
    // this.ueList.forEach((ue) => {
    //   if (selectGnb === this.fastHandoverComponent.getConnectedBsName(ue)) {
    //     const barValue = this.ueList[this.idx]['__barValue'];
    //     if (barValue) {
    //       data.push(barValue);
    //     } else {
    //       data.push(0);
    //     }
    //   }
    // });
    // this.fastHandoverComponent.barChartData[0].data = data;
  }
}

export class GaugeOptions {
  public arcColors: Array<string>;
  public arcDelimiters: Array<number>;
  public rangeLabel: Array<string>;
  public gaugeType: string; // PERFORMANCE, THROUGHPUT
}
