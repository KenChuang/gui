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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSuccessTransport, EcompUser } from '../../interfaces/dashboard.types';

@Injectable({
  providedIn: 'root'
})

/**
 * Services to query the dashboard's admin endpoints.
 */
export class DashboardService {

  private adminPath = 'admin';

  constructor(private httpClient: HttpClient) {
    // injects to variable httpClient
  }

  /**
   * Builds the path for a controller method (including arguments) to use as the
   * first argument to a HTTP client method.
   * This function encapsulates the API prefix and RIC instance constants.
   * @param component Controller method prefix; e.g., "admin"
   * @param instanceKey RIC instance key; e.g., "i1" (optional).
   * If null or empty, adds no RIC instance path components.
   * @param args List of method path components, argument keys and values
   * @returns Path string; e.g., "api/admin/method2/arg1/foo"
   */
  buildPath(component: string, instanceKey: string, ...args: any[]) {
    let result = 'api/' + component;
    if (instanceKey) {
      result = result + '/ric/' + instanceKey;
    }
    args.forEach(part => {
      result = result + '/' + part;
    });
    return result;
  }

  /**
    * Checks app health
    * @returns Observable that yields a DashboardSuccessTransport
    */
  getHealth(): Observable<DashboardSuccessTransport> {
    const path = this.buildPath(this.adminPath, null, 'health');
    return this.httpClient.get<DashboardSuccessTransport>(path);
  }

  /**
   * Gets Dashboard version details
   * @returns Observable that yields a DashboardSuccessTransport object
   */
  getVersion(): Observable<DashboardSuccessTransport> {
    const path = this.buildPath(this.adminPath, null, 'version');
    return this.httpClient.get<DashboardSuccessTransport>(path);
  }

  /**
   * Gets Dashboard users
   * @returns Observable that yields an EcompUser array
   */
  getUsers(): Observable<EcompUser[]> {
    const path = this.buildPath(this.adminPath, null, 'user');
    return this.httpClient.get<EcompUser[]>(path);
  }

}
