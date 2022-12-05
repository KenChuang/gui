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
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChartType } from 'chart.js';
import { MultiDataSet, Label, BaseChartDirective } from 'ng2-charts';
import { A1MediatorService } from '../../services/a1-mediator/a1-mediator.service';

@Component({
  selector: 'rd-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {
  // Doughnut
  @Input() componentId: string;
  @Input() chartLabels: Label[];
  @Input() sdlNamespace: string;
  @Input() sdlKey: string;
  @Input() size: number;
  public doughnutChartLabels: Label[] = ['label1', 'label2'];
  public doughnutChartData: MultiDataSet = [
    [0, 20]
  ];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutColors = [
    {
      backgroundColor: [
        'rgba(0, 82, 22, 1)',
        'rgba(0, 82, 22, 0.3)'
      ]
    }
  ];
  public domInfo: DOMRect;
  public delay: number;
  public setTimeoutTask: any;
  public QUERY_INTERVAL: number;

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  constructor(private a1MediatorService: A1MediatorService) { }

  ngOnInit() {
    this.domInfo = document.getElementById(this.componentId).getBoundingClientRect();
    this.delay = 0;
    this.QUERY_INTERVAL = 1000; // 1s
    this.startQuery();
  }

  ngOnDestroy(): void {
    this.stopQuery();
  }

  getMsgStyle(): string {
    // let style = 'position: relative; top: ' + (this.domInfo.height * 0.7) + 'px; left: ' + (this.domInfo.width * 0.4) + 'px;';
    let fontSize = Math.floor(this.size / 20);
    let top = Math.floor((this.size - fontSize * 5) / 2);
    // let style = 'position: relative; top: ' + top + 'px;';
    let style = 'position: relative; top: 40%;';
    let color = this.delay <= 20 ? 'blue' : 'red';
    style += 'font-size: ' + fontSize + 'px; color:' + color + ';';
    return style;
  }

  startQuery(): void {
    let func = function(vm) {
      vm.a1MediatorService.getSdlData(vm.sdlNamespace, vm.sdlKey)
      .subscribe((res: string) => {
        vm.delay = Math.floor(res[0][vm.sdlKey + '_time'] / 1000);
        vm.doughnutChartData[0][0] = vm.delay;
        if (vm.delay <= 20) {
          vm.doughnutChartData[0][1] = 20 - vm.delay;
        } else {
          vm.doughnutChartData[0][1] = 0;
        }
        vm.chart.update();
      });
      vm.setTimeoutTask = setTimeout(func, vm.QUERY_INTERVAL, vm);
    }
    func(this);
  }

  stopQuery(): void {
    clearTimeout(this.setTimeoutTask);
  }
}
