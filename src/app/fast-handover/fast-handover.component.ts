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
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { A1MediatorService } from '../services/a1-mediator/a1-mediator.service';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { UeNameMappingComponent } from './ue-name-mapping/ue-name-mapping.component';
import { FieldSetupComponent } from './field-setup/field-setup.component';
import { GnbSetupComponent } from './gnb-setup/gnb-setup.component';
import { OffsetSetupComponent } from './offset-setup/offset-setup.component';
import { IntervalSetupComponent } from './interval-setup/interval-setup.component';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'rd-fast-handover',
  templateUrl: './fast-handover.component.html',
  styleUrls: ['./fast-handover.component.scss']
})
export class FastHandoverComponent implements OnInit {
  position = { x: 0, y: 0 };
  public setTimeoutTask;
  public readFieldTask;
  constructor(
    private a1MediatorService: A1MediatorService,
    private httpClient: HttpClient,
    private dialog: MatDialog) { }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain'
    }),
    responseType: 'text' as 'text'
  };
  fieldData = {
    fieldWidth: 1000,
    fieldHeight: 800
  }
  ueInfoWidth = 800;
  ueInfoHeight = 300;
  ueInfoIndex = 80;
  bsIcons = ['bs1_bare.png', 'bs3_bare.png', 'bs2_bare.png'];
  bsColorList = ['blue', 'red', 'black'];
  bsList = [];
  bsListInput = [];
  zoomPercentage = 100; // for zoom in, zoom out
  ruler = 10;

  boundarySetup = {
    position: {
      x: this.transformPositionWidth(-20),
      y: this.transformPositionHeight(-20)
    },
    width: 1000,
    height: 800,
    realWidth: 1000,
    realHeight: 800
  }
  // for boundary offset adjust
  offsetData = {
    offsetWidth: -20,
    offsetHeight: -20
  }

  processGaugeOption = {
    arcColors: ['green', 'yellow', 'red'],
    arcDelimiters: [20, 30],
    rangeLabel: ['0', '40'],
    gaugeType: 'PERFORMANCE'
  }
  throughputGaugeOption = {
    arcColors: ['red', 'yellow', 'green'],
    arcDelimiters: [20, 30],
    rangeLabel: ['0', '100'],
    gaugeType: 'THROUGHPUT'
  }
  // throughput statistics
  throughput_map = {};
  avg_throughput = 0;

  ueIcons = ['ue0.png', 'ue1.png', 'ue3.png', 'ue2.png'];
  ueList = [];
  ueAmfMapping = {};
  bsIdMapping = {};
  bsSize = 40;
  ueSize = 40;
  ueFocus = [];
  ueInfoOn = false;

  intervalData = {
    refreshInterval: 5
  };
  isTracking = false;
  readingEnv = true;

  NUM_PRB = 275;
  FULL_BWP = 100;

  selectGnb = 'gNB2';
  gnbGroupAcc = {};
  gnbGroupData = {};
  idMapGroupIdx: Map<string, number> = new Map();
  // bar chart
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      xAxes: [{}],
      yAxes: [{
        ticks: {
          max: 70,
          min: 0
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    {
      data: [],
      label: '',
      backgroundColor: [
        '#EC407A',
        '#AB47BC',
        '#42A5F5',
        '#7E57C2',
        '#66BB6A',
        '#FFCA28',
        '#26A69A',
        '#EC407A',
        '#AB47BC',
        '#42A5F5',
      ]
    }
  ];

  ngOnInit(): void {
    // copy bs data to bsInput
    for (let i = 0; i < this.bsList.length; i++) {
      this.bsListInput.push({
        x: this.bsList[i].realPosition.x,
        y: this.bsList[i].realPosition.y,
        index: i
      })
    }
    this.applyGNB();
    this.updateCellInfo();
  }

  ngOnDestroy(): void {
    this.isTracking = false;
    this.readingEnv = false;
    clearTimeout(this.setTimeoutTask);
    clearTimeout(this.readFieldTask);
  }

  updatePosition(): void {
    var func = function (vm: FastHandoverComponent) {
      if (!vm.isTracking) {
        clearTimeout(vm.setTimeoutTask);
        return;
      }
      vm.a1MediatorService.getUeCurrentPosition(null)
        .subscribe(
          (res: string) => {
            // Answers 204/No content on success
            vm.barChartLabels = [];
            vm.gnbGroupAcc = {};
            for (let i = 0; i < res.length; i++) {
              if (!vm.ueList[i]) {
                vm.ueList[i] = {
                  index: 0,
                  id: '',
                  name: '',
                  position: {
                    x: 0,
                    y: 0
                  },
                  realPosition: {
                    x: 0,
                    y: 0
                  },
                  connectTo: '',
                  rsrp: 0,
                  sinr: 0,
                  bwpData: {
                    bwpId: 0,
                    start: 0,
                    bandwidth: 100
                  }
                }
                vm.ueList[i].index = i;
                vm.ueList[i].id = res[i]['ue_imsi'];
                vm.ueList[i].name = 'UE' + (parseInt(res[i]['ue_imsi']) + 1);

                // initialize throughput data
                vm.throughput_map[res[i]['ue_imsi']] = {
                  value: 0
                }
              }
              vm.ueList[i].connectTo = res[i]['pci'];
              vm.ueList[i].realPosition.x = Math.round(parseFloat(res[i]['pos_x']) * 10) / 10;
              vm.ueList[i].realPosition.y = Math.round(parseFloat(res[i]['pos_y']) * 10) / 10;
              let newX = vm.transformPositionWidth(vm.ueList[i].realPosition.x);
              let newY = vm.transformPositionHeight(vm.ueList[i].realPosition.y);
              vm.ueList[i].position = { x: newX, y: newY };

              // bar chart group
              const groupName = vm.getConnectedBsName(vm.ueList[i]);
              // console.log(groupName);
              if (vm.selectGnb === groupName) {
                vm.barChartLabels.push(vm.ueList[i].name);
              }
              if (!(groupName in vm.gnbGroupAcc)) {
                vm.gnbGroupAcc[groupName] = 0;
              }
              vm.idMapGroupIdx.set(vm.ueList[i].id, vm.gnbGroupAcc[groupName]);
              vm.gnbGroupAcc[groupName]++;
            }

            // get UE AMF Mapping
            vm.a1MediatorService.getSdlData('amf_ns', 'ue_amf')
              .subscribe(
                (res: string) => {
                  res = res[0];
                  for (let i = 0; i < res.length; i++) {
                    vm.ueAmfMapping[res[i]['ran_ue_ngap_id'] + ''] = res[i]['ue_imsi'];
                  }
                  // get UE BWP information
                  vm.a1MediatorService.getSdlData('TS-UE-metrics', '0')
                    .pipe(
                      finalize(() => vm.setTimeoutTask = setTimeout(func, vm.intervalData.refreshInterval, vm))
                    )
                    .subscribe(
                      (res: string) => {
                        for (let i = 0; i < res.length; i++) {
                          let imsi = vm.ueAmfMapping[res[i]['UE-ID']];
                          if (imsi == undefined) {
                            console.log('ERROR: can not get AMF mapping!');
                          } else {
                            // find this UE by imsi
                            for (let j = 0; j < vm.ueList.length; j++) {
                              let ue = vm.ueList[j]
                              if (ue.id == imsi) {
                                // update BWP data
                                let bwpId = res[i]['BWP-Data']['BWP-ID']
                                let start, bandwidth;
                                let locationAndBandwidth = res[i]['BWP-Data']['Location-And-Bandwidth'];
                                let remainder = locationAndBandwidth % vm.NUM_PRB;
                                let quotient = Math.floor(locationAndBandwidth / vm.NUM_PRB);
                                let num_of_rb = quotient + 1;
                                let rb_start = remainder;
                                if (num_of_rb + rb_start > vm.NUM_PRB) {
                                  rb_start = vm.NUM_PRB - 1 - remainder;
                                  num_of_rb = vm.NUM_PRB - quotient + 2;
                                }
                                start = Math.round(vm.FULL_BWP * rb_start / vm.NUM_PRB);
                                bandwidth = Math.round(vm.FULL_BWP * num_of_rb / vm.NUM_PRB);
                                // assign bwp
                                ue.bwpData.bwpId = bwpId;
                                ue.bwpData.start = start;
                                ue.bwpData.bandwidth = bandwidth;
                              }
                            }
                          }
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

  updateCellInfo(): void {
    var update = function (vm, res) {
      // update cell info
      let bsData = res[0]['bs_data'];
      vm.gnbGroupData = {};
      for (let i = 0; i < bsData.length; i++) {
        if (!vm.bsList[i]) {
          vm.bsList[i] = {
            index: 0,
            position: {
              x: 0,
              y: 0
            },
            realPosition: {
              x: -15,
              y: 16
            },
            signalPosition: {
              x: 0,
              y: 0
            },
            signalRealPosition: {
              x: 0,
              y: 0
            },
            icon: vm.bsIcons[i],
            coverage: 900,
            color: vm.bsColorList[i]
          }
        }
        vm.bsList[i].index = parseInt(bsData[i]['cid']);
        vm.bsIdMapping[vm.bsList[i].index] = i + 1;
        vm.bsList[i].realPosition.x = parseInt(bsData[i]['x']);
        vm.bsList[i].realPosition.y = parseInt(bsData[i]['y']);
        if (bsData[i]['radius_of_handover'] != undefined) {
          vm.bsList[i].coverage = parseInt(bsData[i]['radius_of_handover']) * 20;
        }
        // signal center
        vm.bsList[i].signalRealPosition.x = parseInt(bsData[i]['sc_x']);
        vm.bsList[i].signalRealPosition.y = parseInt(bsData[i]['sc_y']);

        // init bar group data
        vm.gnbGroupData['gNB' + (i + 1)] = [];
      }
      vm.bsList.length = bsData.length;
      // update field info
      vm.boundarySetup.realWidth = parseInt(res[0]['width']);
      vm.boundarySetup.realHeight = parseInt(res[0]['height']);
      vm.refreshTopology();
    }
    var func = function (vm) {
      if (!vm.readingEnv) {
        clearTimeout(vm.readFieldTask);
        return;
      }
      vm.a1MediatorService.getSdlData('env_ns', 'ho_env_info')
        .pipe(
          finalize(() => vm.readFieldTask = setTimeout(func, 1000, vm))
        )
        .subscribe(
          (res: string) => {
            // Answers 204/No content on success
            if (res.length == 0) {
              console.log('no cell data in env_ns, try search bwp_env_ns...');
              vm.a1MediatorService.getSdlData('bwp_env_ns', 'bwp_env_info')
                .subscribe(
                  (res: string) => {
                    if (res.length == 0) {
                      console.log('ERROR: no cell data in SDL!');
                    } else {
                      update(vm, res);
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
            } else {
              update(vm, res);
            }
            // update UE throughput if tracking
            if (vm.isTracking) {
              vm.a1MediatorService.getSdlData('mqtt_ns', '0').subscribe(
                (res: string) => {
                  if (res.length == 0) {
                    console.log('ERROR: no throughput data in SDL.');
                  } else {
                    // update throughput data
                    for (let data of res) {
                      vm.throughput_map[data['imsi']].value = Math.floor(data['throughput'] * 8 / 10000) / 100;
                    }
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

  changeTracking() {
    this.isTracking = !this.isTracking;
    if (this.isTracking) {
      this.updatePosition();
    } else {
      clearTimeout(this.setTimeoutTask);
    }
  }

  // startTracking(): void {
  //   this.isTracking = true;
  //   this.updatePosition();
  // }

  // stopTracking(): void {
  //   this.isTracking = false;
  //   clearTimeout(this.setTimeoutTask);
  // }

  getBsCoverageStyle(bs): string {
    let bsCoverage = bs.coverage * this.getZoomPercentage();
    let offsetX = bs.signalPosition.x - bsCoverage / 2 + this.bsSize / 2;
    let offsetY = bs.signalPosition.y - bsCoverage / 2 + this.bsSize / 2;
    return 'position: absolute; left: ' + offsetX + 'px; top: ' + offsetY + 'px; width: ' + bsCoverage + 'px; '
      + 'height: ' + bsCoverage + 'px; background-color: ' + bs.color + '; opacity: 0.2;'
  }

  setUeFocus(ue): void {
    for (let i = 0; i < this.ueFocus.length; i++) {
      this.ueFocus[i] = false;
    }
    if (ue) {
      this.ueFocus[ue.index] = true;
    }
  }

  getConnectBsIndex(ue): number {
    if (ue.connectTo in this.bsIdMapping) {
      return this.bsIdMapping[ue.connectTo];
    }
    return 0;
  }

  getConnectedBsName(ue): string {
    let result = 'gNB';
    result += this.getConnectBsIndex(ue);
    return result
  }

  applyGNB(): void {
    for (let i = 0; i < this.bsList.length; i++) {
      this.bsList[i].position = {
        x: this.transformPositionWidth(this.bsListInput[i].x),
        y: this.transformPositionHeight(this.bsListInput[i].y)
      }
      this.bsList[i].index = this.bsListInput[i].index
    }
    this.refreshTopology();
  }

  getUeInfoLeftOffset(): number {
    let offset = Number(this.fieldData.fieldWidth) + 50;
    offset = (offset < 1000) ? 1000 : offset;
    return offset;
  }

  onboard(): void {
    const dialogRef = this.dialog.open(UeNameMappingComponent, {
      panelClass: '',
      width: '500px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        ueList: this.ueList
      }
    });
  }

  openUeInfo(): void {
    this.ueInfoOn = !this.ueInfoOn;
  }

  openAreaSetup(): void {
    const dialogRef = this.dialog.open(FieldSetupComponent, {
      panelClass: '',
      width: '500px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        fieldData: this.fieldData
      }
    });
  }

  openGnbSetup(): void {
    const dialogRef = this.dialog.open(GnbSetupComponent, {
      panelClass: '',
      width: '500px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        bsList: this.bsList,
        bsListInput: this.bsListInput
      }
    });
  }

  openOffsetSetup(): void {
    const dialogRef = this.dialog.open(OffsetSetupComponent, {
      panelClass: '',
      width: '500px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: {
        offsetData: this.offsetData
      }
    });
  }

  openIntervalSetup(): void {
    const dialogRef = this.dialog.open(IntervalSetupComponent, {
      panelClass: '',
      width: '500px',
      maxHeight: '1000px',
      position: {
        top: '10%'
      },
      data: this.intervalData
    });
  }

  getZoomPercentage(): number {
    return this.zoomPercentage / 100;
  }

  transformPositionWidth(original): number {
    let offset = -20;
    if (this.offsetData) {
      offset = this.offsetData.offsetWidth;
    }
    return Math.round((Number(original) - offset) * 10 * this.getZoomPercentage())
  }

  transformPositionHeight(original): number {
    let offset = -20;
    if (this.offsetData) {
      offset = this.offsetData.offsetHeight;
    }
    return Math.round((Number(original) - offset) * 10 * this.getZoomPercentage())
  }

  refreshTopology(): void {
    // refresh BS position
    for (let i = 0; i < this.bsList.length; i++) {
      let bs = this.bsList[i];
      bs.position = {
        x: this.transformPositionWidth(bs.realPosition.x),
        y: this.transformPositionHeight(bs.realPosition.y)
      }
      bs.signalPosition = {
        x: this.transformPositionWidth(bs.signalRealPosition.x),
        y: this.transformPositionHeight(bs.signalRealPosition.y)
      }
    }
    // refresh UE position
    for (let ue of this.ueList) {
      ue.position = {
        x: this.transformPositionWidth(ue.realPosition.x),
        y: this.transformPositionHeight(ue.realPosition.y)
      }
    }
    // setup field boundary
    this.boundarySetup.position = {
      x: this.transformPositionWidth(this.offsetData.offsetWidth),
      y: this.transformPositionHeight(this.offsetData.offsetHeight)
    }
    this.boundarySetup.width = this.transformPositionWidth(this.boundarySetup.realWidth);
    this.boundarySetup.height = this.transformPositionHeight(this.boundarySetup.realHeight);
  }

  zoomInOperation(): void {
    if (this.zoomPercentage < 400) {
      this.zoomPercentage += 20;
      this.refreshTopology();
    }
  }

  zoomOutOperation(): void {
    if (this.zoomPercentage > 60) {
      this.zoomPercentage -= 20;
      this.refreshTopology();
    }
  }

  getRuler(): number {
    return Math.floor(this.ruler * 100 / this.zoomPercentage * 10) / 10;
  }

  getTotalThroughput(): number {
    let total = 0;
    for (let key in this.throughput_map) {
      total += this.throughput_map[key].value;
    }
    // update avg throughput
    if (this.ueList.length > 0) {
      this.avg_throughput = Math.floor(total * 100 / this.ueList.length) / 100;
    }
    return Math.floor(total * 100) / 100;
  }

  editName(ue, el) {
    ue.__edit = true;
    window.setTimeout(() => el.focus(), 0);
  }

  changeEdit(ue, idx: number) {
    this.barChartLabels[idx] = ue.name;
  }

  changeConnectBS(i) {
    this.selectGnb = ('gNB' + (i + 1));
    this.barChartLabels = [];
    this.ueList.forEach((ue) => {
      if (this.selectGnb === this.getConnectedBsName(ue)) {
        this.barChartLabels.push(ue.name);
      }
    });
    this.barChartData[0].data = this.gnbGroupData[this.selectGnb].slice(0);
  }

  debug() {
    console.log(this.throughput_map);
    console.log(this.ueList)
    console.log(this.bsList)
    console.log(this.selectGnb)
    console.log('~~~>>');
    console.log(this.barChartData);
    console.log(this.barChartLabels);
    console.log(this.gnbGroupAcc);
    console.log(this.gnbGroupData);
  }
}
