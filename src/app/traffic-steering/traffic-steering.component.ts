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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { A1MediatorService } from '../services/a1-mediator/a1-mediator.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Label } from 'ng2-charts';
import { MatDialog } from '@angular/material/dialog';
import { LogAreaComponent } from './log-area/log-area.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'rd-traffic-steering',
  templateUrl: './traffic-steering.component.html',
  styleUrls: ['./traffic-steering.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class TrafficSteeringComponent implements OnInit {
  fieldWidth = 1200;
  fieldHeight = 900;
  ueInfoWidth = 400;
  ueInfoHeight = 600;
  ueInfoIndex = 80;
  prbChartHeight = 400;
  xOffset = 200;
  yOffset = 0;
  bsList = [];
  // fixed values for demo
  bsPositions = [[400, 200], [250, 400], [550, 400]];
  bsColorList = ['blue', 'red', 'green'];
  ueList = [];
  ueMapping = {} // key: imsi, value: index
  // fixed values for demo
  uePositions = [[483, 336], [77, 165], [343, 435], [186, 242], [299, 321]
    , [262, 477], [190, 309], [163, 126], [290, 176], [372, 186]];
  oldUeList = [];
  ueFocus = [];
  bsSize = 40;
  ueSize = 30;
  bsIcons = ['bs1_bare.png', 'bs2_bare.png', 'bs3_bare.png'];
  ueIcons = ['ue1.png', 'ue2.png', 'ue3.png'];
  graphicLegend = 'legend.png';
  lineColor = {
    blue: 'rgb(0,0,255)',
    red: 'rgb(255,0,0)',
    green: 'rgb(0,255,0)'
  };
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'text/plain'
    }),
    responseType: 'text' as 'text'
  };

  public setTimeoutTask;
  public setTimeoutTask2;
  active = false;
  QUERY_INTERVAL = 5000;
  REDLINE_DELAY = 2000;
  handoverLog = '';

  // chart related
  PRB_INTERVAL = 1000;
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

  

  constructor(private a1MediatorService: A1MediatorService,
    private dialog: MatDialog,
    private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.active = true;
    this.getBsPosition();
    this.getMsPosition();
    this.updateMsInfo();
    this.updateBsPrb();
  }

  ngOnDestroy(): void {
    this.active = false;
    clearTimeout(this.setTimeoutTask);
    clearTimeout(this.setTimeoutTask2);
  }

  getBsPosition(): void {
    // fixed value for demo
    for (let i = 0; i < 3; i++) {
      let newBs = {
        index: i,
        position: {
          x: this.bsPositions[i][0] + this.xOffset,
          y: this.bsPositions[i][1] + this.yOffset
        },
        icon: this.bsIcons[i],
        coverage: 0,
        color: this.bsColorList[i]
      };
      this.bsList.push(newBs);
    }
    this.a1MediatorService.getSdlData('TS-cell-metrics', 'keys')
    .subscribe(
      (res: string) => {
        for (let i = 0; i < res.length; i++) {
          this.bsList[i].index = res[i];
        }
      },
      ((her: HttpErrorResponse) => {
        // the error field should have an ErrorTransport object
        let msg = her.message;
        if (her.error && her.error.message) {
          msg = her.error.message;
        }
        console.log(her);
      })
    );
  }

  getMsPosition(): void {
    // fixed value for demo
    this.ueList.length = 0;
    for (let i = 0; i < this.uePositions.length; i++) {
      this.ueList[i] = {
        index: i,
        position: {
          x: this.uePositions[i][0] + this.xOffset,
          y: this.uePositions[i][1] + this.yOffset
        },
        connectTo: 0,
        rsrp: 0,
        sinr: 0,
        lineColor: this.lineColor.blue
      }
      this.ueFocus[i] = false;
    }
  }

  updateMsInfo(): void {
    let func = function(vm) {
      if (!vm.active) {
        return;
      }
      vm.a1MediatorService.getSdlData('TS-UE-metrics', 'values')
      .pipe(
        finalize(() => vm.setTimeoutTask = setTimeout(func, vm.QUERY_INTERVAL, vm))
      )
      .subscribe(
        (res: string) => {
          for (let i = 0; i < res.length; i++) {
            let imsi = res[i]['UE-ID'];
            if (vm.ueMapping[imsi] == undefined) {
              vm.ueMapping[imsi] = i;
            }
            let ueId = vm.ueMapping[imsi];
            for (let j = 0; j < vm.bsList.length; j++) {
              if (res[i]['Serving-Cell-ID'] == vm.bsList[j].index) {
                vm.ueList[ueId].connectTo = j;
                break;
              }
            }
            vm.ueList[ueId].rsrp = res[i]['Serving-Cell-RF']['rsrp'];
            vm.ueList[ueId].sinr = res[i]['Serving-Cell-RF']['rsSinr'];
            vm.ueList[ueId].lineColor = vm.lineColor.blue;
          }
          let changedUEs = [];
          if (vm.oldUeList.length != 0) {
            for (let i = 0; i < vm.ueList.length; i++) {
              if (vm.ueList[i].connectTo != vm.oldUeList[i].connectTo) {
                vm.oldUeList[i].lineColor = vm.lineColor.red;
                changedUEs.push(vm.ueList[i]);
              }
            }
          }
          let func = function() {
            for (let ueId in changedUEs) {
              let index = changedUEs[ueId].index;
              vm.ueList[index].lineColor = vm.lineColor.green;
              let oldData = vm.oldUeList[index];
              let nowData = vm.ueList[index];
              vm.handoverLog += 'UE[' + nowData.index + '] from BS[' + oldData.connectTo + '] changes to BS['
                + nowData.connectTo + '], (RSRP, SINR) from (' + oldData.rsrp + ', ' + oldData.sinr + ') changes to ('
                + nowData.rsrp + ', ' + nowData.sinr + ')\n';
            }
            vm.oldUeList = JSON.parse(JSON.stringify(vm.ueList));
            vm.calcBsCoverage();
          }
          setTimeout(func, vm.REDLINE_DELAY);
        },
        ((her: HttpErrorResponse) => {
          // the error field should have an ErrorTransport object
          let msg = her.message;
          if (her.error && her.error.message) {
            msg = her.error.message;
          }
          console.log(her);
        })
      );
    }
    func(this);
  }

  calDistance(a, b): number {
    return Math.ceil(Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)));
  }
  
  calcBsCoverage(): void {
    for (let bsId in this.bsList) {
      let bs = this.bsList[bsId];
        let coverage = 0;
        for (let ueId in this.oldUeList) {
          let ue = this.oldUeList[ueId];
          if (ue.connectTo == bsId) {
            let distance = this.calDistance(ue.position, bs.position);
            if (distance > coverage) {
              coverage = distance;
            }
          }
        }
        bs.coverage = coverage * 2 + 50;
    }
  }

  getBsCoverageStyle(bs): string {
    let offsetX = bs.position.x - bs.coverage / 2 + this.bsSize / 2;
    let offsetY = bs.position.y - bs.coverage / 2 + this.bsSize / 2;
    return 'position: absolute; left: ' + offsetX + 'px; top: ' + offsetY + 'px; width: ' + bs.coverage + 'px; '
      + 'height: ' + bs.coverage + 'px; background-color: ' + bs.color + '; opacity: 0.2;'
  }

  updateBsPrb(): void {
    let func = function(vm) {
      if (!vm.active) {
        return;
      }
      vm.a1MediatorService.getSdlData('TS-cell-metrics', 'values')
      .pipe(
        finalize(() => vm.setTimeoutTask = setTimeout(func, vm.PRB_INTERVAL, vm))
      )
      .subscribe(
        (res: string) => {
          let newDataList = [];
          let newUeConnectedList = [];
          for (let i = 0; i < res.length; i++) {
            let nowValue = 100 - res[i]['Avail-PRB-DL'];
            newDataList[i] = nowValue;
          }
          for (let i = 0; i < vm.bsList.length; i++) {
            newUeConnectedList[i] = 0;
          }
          for (let i = 0; i < vm.ueList.length; i++) {
            newUeConnectedList[vm.ueList[i].connectTo]++;
          }
          vm.barChartData[0].data = newDataList;
          vm.barChartData[1].data = newUeConnectedList;
        },
        ((her: HttpErrorResponse) => {
          // the error field should have an ErrorTransport object
          let msg = her.message;
          if (her.error && her.error.message) {
            msg = her.error.message;
          }
          console.log(her);
        })
      );
    }
    func(this);
  }

  setUeFocus(ue): void {
    for (let i = 0; i < this.ueFocus.length; i++) {
      this.ueFocus[i] = false;
    }
    if (ue) {
      this.ueFocus[ue.index] = true;
    }
  }

  openLogArea(): void {
    const dialogRef = this.dialog.open(LogAreaComponent, {
      width: '800px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        log: this.handoverLog
      }
    });
  }

  print(msg): void {
    console.log("msg: " + msg);
  }
}
