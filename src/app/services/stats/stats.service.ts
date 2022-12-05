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
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';
import { StatsDetails, AppStats } from '../../interfaces/e2-mgr.types';

@Injectable({
    providedIn: 'root'
})

export class StatsService {

    private component = 'admin';
    private appmetricPath = 'appmetric';
    private appId = 'appid';

    baseJSONServerUrl = 'http://localhost:3000';
    dataMetrics = [{}];
    latencyMetrics;
    load: Observable<number>;
    cpuMetrics;
    hostURL = 'http://localhost:10080';
    jsonURL = 'http://localhost:3000';
    metricsPath = '/a1ric/metrics';
    delayPath = '/a1ric/delay';
    loadPath = '/a1ric/load';
    delayMax = '15';
    loadMax = '100000';
    httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            })
          };

    constructor(
        private dashboardSvc: DashboardService,
        private httpClient: HttpClient) {
        // this.loadConfig();
        // this.getLoad();
    }

    getMetrics() {
        return this.dataMetrics; // @TODO implement the service to fetch the backend data
    }

    getLatencyMetrics() {
        this.latencyMetrics = this.getRandomValue();
        return this.latencyMetrics;
    }

    getLoad(): Observable<number> {
        // this.loadMetrics = this.getRandomValue();
        this.httpClient.get(this.hostURL + this.loadPath).subscribe((res) => {
            console.log(res);
            console.log('stats.service.getLoad(): ' + res['load']);
            this.load = res['load'];
            return this.load;
        });
        return this.load;
    }

    getRandomValue() {
        return Math.round((Math.random() * (20 - 0)) + 0);
    }

    // Gets xApp metrics Kibana url for the named application
    getAppMetricsUrl(appName: string)  {
        const path = this.dashboardSvc.buildPath(this.component, null, 'metrics');
        return this.httpClient.get(path, {
            params: new HttpParams()
                .set('app', appName)
        });
    }

    getAppMetrics(instanceKey: string): Observable<Array<StatsDetails>> {
        const path = this.dashboardSvc.buildPath(this.component, instanceKey, this.appmetricPath);
        return this.httpClient.get<Array<StatsDetails>>(path);
      }

    getAppMetricsById(instanceKey: string, appId: number): Observable<AppStats> {
        const path = this.dashboardSvc.buildPath(this.component, instanceKey, this.appmetricPath, this.appId, appId);
        return this.httpClient.get<AppStats>(path);
      }

    setupAppMetrics(instanceKey: string, req: StatsDetails): Observable<HttpResponse<Object>> {
        const path = this.dashboardSvc.buildPath(this.component, instanceKey,  this.appmetricPath);
        return this.httpClient.post(path, req, { observe: 'response' });
      }

    editAppMetrics(instanceKey: string, req: StatsDetails): Observable<HttpResponse<Object>> {
        const path = this.dashboardSvc.buildPath(this.component, instanceKey,  this.appmetricPath);
        return this.httpClient.put(path, req, { observe: 'response' });
    }

    deleteAppMetrics(instanceKey: string, appId: number): Observable<HttpResponse<Object>> {
        const path = this.dashboardSvc.buildPath(this.component, instanceKey, this.appmetricPath, this.appId, appId);
        return this.httpClient.delete(path, { observe: 'response' });
    }

    saveConfig(key: string, value: string) {
        if (key === 'jsonURL') {
            this.baseJSONServerUrl = value;
        }
        console.log('save this.baseJSONServerUrl ' + this.baseJSONServerUrl);
        const jsonValue = '{"id": "' + key + '", "value": "' + value + '"}';
        console.log(jsonValue);
        this.httpClient.put(this.baseJSONServerUrl + '/config/' + key , jsonValue, this.httpOptions).subscribe((res) => {
            console.log(res);
        });
    }

    loadConfig() {
        console.log('load this.baseJSONServerUrl ' + this.baseJSONServerUrl);
        const httpOptions = {
                headers: new HttpHeaders({
                  'Content-Type':  'application/json'
                })
              };
        this.httpClient.get(this.baseJSONServerUrl + '/config/', httpOptions).subscribe((res) => {
            console.log(res);
            this.jsonURL = res[0].value;
            this.hostURL = res[1].value;
            this.metricsPath = res[2].value;
            this.delayPath = res[3].value;
            this.loadPath = res[4].value;
            this.delayMax = res[5].value;
            this.loadMax = res[6].value;
        },
        (her: HttpErrorResponse) => {
            console.log ('loadConfig failed: ' + her.message);
          });
    }
}

interface Delay {
    delay: number;
}
