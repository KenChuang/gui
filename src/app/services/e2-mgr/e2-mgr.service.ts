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
import { map } from 'rxjs/operators';
import { DashboardSuccessTransport } from '../../interfaces/dashboard.types';
import { E2RanDetails } from '../../interfaces/e2-mgr.types';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable({
  providedIn: 'root'
})

export class E2ManagerService {

  private component = 'e2mgr';
  private nodebPath = 'nodeb';

  constructor(
    private dashboardSvc: DashboardService,
    private httpClient: HttpClient) {
  }

  /**
   * Gets E2 client version details
   * @returns Observable that yields a String
   */
  getVersion(instanceKey: string): Observable<string> {
    const path = this.dashboardSvc.buildPath(this.component, null, 'version');
    return this.httpClient.get<DashboardSuccessTransport>(path).pipe(
      // Extract the string here
      map(res => res['data'])
    );
  }

  /**
   * Gets RAN details
   * @returns Observable that yields an array of E2RanDetails objects
   */
  getRan(instanceKey: string): Observable<Array<E2RanDetails>> {
    // const path = this.dashboardSvc.buildPath(this.component, instanceKey, this.nodebPath, 'ran');
    const path = 'http://127.0.0.1:8888/e2mgr/v1/nodeb/states';
    return this.httpClient.get<Array<E2RanDetails>>(path);
  }

  /**
   * Sends a request to drop all RAN connections
   * @returns Observable with body.
   */
  nodebPut(instanceKey: string): Observable<any> {
    const path = this.dashboardSvc.buildPath(this.component, instanceKey,  this.nodebPath, 'shutdown');
    return this.httpClient.put(path, { observe: 'body' });
  }

}
