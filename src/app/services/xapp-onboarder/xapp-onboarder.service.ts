/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
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

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';
@Injectable({
  providedIn: 'root'
})
export class XappOnboarderService {

  private component = 'xappobrd';

  constructor(
    private dashboardSvc: DashboardService,
    private httpClient: HttpClient
  ) { }

  onboardXappFile(descriptor: any, instanceKey: string): Observable<HttpResponse<Object>> {
    const path = this.dashboardSvc.buildPath(this.component, instanceKey, 'onboard');
    return this.httpClient.post(path, descriptor, { observe: 'response' });
  }

  onboardXappURL(descriptor_remote: any, instanceKey: string): Observable<HttpResponse<Object>> {
    // const path = this.dashboardSvc.buildPath(this.component, instanceKey, 'onboard','download');
    const path = 'http://127.0.0.1:8888/onboard/download';
    return this.httpClient.post(path, descriptor_remote, { observe: 'response' });
  }
}
