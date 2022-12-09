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
import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';

@Component({
  selector: 'rd-statistics-chart',
  templateUrl: './statistics-chart.component.html',
  styleUrls: ['./statistics-chart.component.scss']
})
export class StatisticsChartComponent implements OnInit {
  @Input() isTracking: boolean;
  @Input() throughput_map: object;
  @Input() ueList: object;

  public exists = true;
  public setTimeoutTask: any;
  public QUERY_INTERVAL: number;
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'Total UE' },
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.

      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            max: 400,
            min: 0
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
      ]
    },
    legend: {
      position: 'right',
      align: 'start'
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const dataset = ctx.dataset;
          const label = dataset.label;
          if (label === this.lineChartData[0].label) {
            return value;
          } else {
            return '';
          }
        }
      }
    }
  };
  public lineChartColors: Color[] = [
    { // green
      backgroundColor: 'rgba(99, 99, 99, 0)',
      borderColor: '#000000',
      //pointBackgroundColor: '#999999',
      //pointBorderColor: '#008000',
      //pointHoverBackgroundColor: '#008000',
      //pointHoverBorderColor: '#ffffff'
    }
  ];
  public ueColors = [
    [], [255, 0, 0], [128, 0, 0], [255, 255, 0], [128, 128, 0], [0, 255, 0], [0, 255, 255], [0, 128, 128], [0, 0, 255],
    [223, 255, 0], [255, 191, 0], [255, 127, 80], [222, 49, 99], [159, 226, 191], [64, 224, 208], [100, 149, 237], [204, 204, 255]
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  // public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  canvasWidth: number = 800;
  @HostListener('window:resize') onResize() {
    this.resize();
  }

  constructor() { }

  ngOnInit(): void {
    this.QUERY_INTERVAL = 1000; // 1s
    this.startQuery();
    window.setTimeout(() => this.resize(), 100);
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
        let total = 0, id = 1;
        for (let key in vm.throughput_map) {
          if (!vm.lineChartData[id]) {
            let color = vm.ueColors[id];
            vm.lineChartData[id] = {
              data: [],
              label: key,
              backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
              borderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
            };
          }
          vm.lineChartData[id].label = vm.ueList[id - 1].name;
          vm.lineChartData[id].data.push(vm.throughput_map[key].value);
          total += vm.throughput_map[key].value;
          id++;
        }
        vm.lineChartData.length = id;
        vm.lineChartData[0].data.push(total.toFixed(2));
        let date = new Date();
        let label = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        vm.lineChartLabels.push(label);
        if (vm.lineChartLabels.length > 10) {
          vm.lineChartLabels.splice(0, 1);
          for (let i = 0; i < vm.lineChartData.length; i++) {
            vm.lineChartData[i].data.splice(0, 1);
          }
        }
        // console.log(vm.lineChartData);
      }
      vm.setTimeoutTask = setTimeout(func, vm.QUERY_INTERVAL, vm);
    }
    func(this);
  }

  stopQuery(): void {
    this.exists = false;
    clearTimeout(this.setTimeoutTask);
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public hideOne(): void {
    const isHidden = this.chart.isDatasetHidden(1);
    this.chart.hideDataset(1, !isHidden);
  }

  resize() {
    // window.setTimeout(() => {
    //   const clientWidth = window.innerWidth;
    //   const el: any = document.getElementById('network');
    //   this.canvasWidth = clientWidth - el.offsetWidth - el.getBoundingClientRect().left;
    // }, 0);
  }
}
