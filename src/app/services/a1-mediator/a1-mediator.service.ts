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
import { Injectable } from '@angular/core';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class A1MediatorService {

  private component = 'admin/a1';

  constructor(
    private dashboardSvc: DashboardService,
    private httpClient: HttpClient) {
  }

  getUeCurrentPosition(instanceKey: string): Observable<string> {
    // const path = this.dashboardSvc.buildPath(this.component, null, 'ue_current_position');
    const path = 'http://192.168.0.180:8888/ms/current_position';
    return this.httpClient.get<string>(path);
  }

  getPrometheusData(itemName: string, timeBefore: Number, timeTo: Number, granularity: Number): Observable<string> {
    // const path = this.dashboardSvc.buildPath('admin/prometheus', null, itemName, timeBefore, timeTo, granularity);
    const path = 'http://192.168.0.180:8888/prometheus/' + itemName + '/' + timeBefore + '/' + timeTo + '/' + granularity;
    return this.httpClient.get<string>(path);
  }

  getSdlData(namespace: string, dataType: string): Observable<string> {
    // const path = this.dashboardSvc.buildPath('admin/sdlrest', null, 'sdl', namespace, dataType);
    const path = 'http://192.168.0.180:8888/' + namespace + '/' + dataType;
    return this.httpClient.get<string>(path);
  }
}
