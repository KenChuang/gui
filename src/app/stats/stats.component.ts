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
import { Component, OnInit } from '@angular/core';
import { StatsService } from '../services/stats/stats.service';
import { ConfirmDialogService } from '../services/ui/confirm-dialog.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NotificationService } from '../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';
import { InstanceSelectorService } from '../services/instance-selector/instance-selector.service';
import { StatsDataSource } from './stats-datasource';
import { Subscription } from 'rxjs';
import { StatsDialogComponent } from './stats-dialog.component';
import { AppStats } from '../interfaces/e2-mgr.types';
import {FormControl} from '@angular/forms';
import { RicInstance} from '../interfaces/dashboard.types';

@Component({
    selector: 'rd-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

    checked = false;
    darkMode: boolean;
    panelClass: string;
    displayedColumns: string[] = ['appName', 'metricUrl', 'editmetricUrl'];
    dataSource: StatsDataSource;
    private instanceChange: Subscription;
    private instanceKey: string;
    metricsUrl: SafeResourceUrl;
    tabs = [];
    showTabs = false;
    selected = new FormControl(0);

    constructor(private statsservice: StatsService,
        private sanitize: DomSanitizer,
        private confirmDialogService: ConfirmDialogService,
        private notificationService: NotificationService,
        public instanceSelectorService: InstanceSelectorService,
        public dialog: MatDialog,
        public ui: UiService) {
    }

    ngOnInit() {
        this.dataSource = new StatsDataSource(this.statsservice, this.notificationService);

        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });

        this.instanceChange = this.instanceSelectorService.getSelectedInstance().subscribe((instance: RicInstance) => {
            if (instance.key) {
                this.instanceKey = instance.key;
                this.dataSource.loadTable(instance.key);
              }
        });

    }

    ngOnDestroy() {
        this.instanceChange.unsubscribe();
    }

    setupAppMetrics() {
        if (this.darkMode) {
          this.panelClass = 'dark-theme';
        } else {
          this.panelClass = '';
        }
        const dialogRef = this.dialog.open(StatsDialogComponent, {
          panelClass: this.panelClass,
          width: '450px',
          data: {
            instanceKey: this.instanceKey
          }
        });
        dialogRef.afterClosed()
          .subscribe((result: boolean) => {
            if (result) {
              this.dataSource.loadTable(this.instanceKey);
            }
          });
    }

    editAppMetrics(stats?) {
        const dialogRef = this.dialog.open(StatsDialogComponent, {
          hasBackdrop: false,
          data: {
            instanceKey: this.instanceKey,
            appName: stats.statsDetails.appName ? stats.statsDetails.appName : '',
            metricUrl: stats.statsDetails.metricUrl ? stats.statsDetails.metricUrl : '',
            appId: stats.statsDetails.appId ? stats.statsDetails.appId : 0,
            isEdit: 'true'
          }
        });
        dialogRef.afterClosed()
          .subscribe((result: boolean) => {
            if (result) {
              this.dataSource.loadTable(this.instanceKey);
            }
          });
      }

      viewAppMetrics(stats?) {
        this.statsservice.getAppMetricsById(this.instanceKey, stats.statsDetails.appId)  .subscribe((res: AppStats) => {
          this.metricsUrl = this.sanitize.bypassSecurityTrustResourceUrl(res.statsDetails.metricUrl);
          let tabNotThere:boolean = true;
          if (this.tabs.length <= 0) {
            this.tabs.push(res);
            this.selected.setValue(this.tabs.length - 1);
          }
          else {
            for(let i=0; i<this.tabs.length; i++){
              if (this.tabs[i].statsDetails.appId == res.statsDetails.appId) {
                this.tabs[i].statsDetails.appName = res.statsDetails.appName;
                this.tabs[i].statsDetails.metricUrl = res.statsDetails.metricUrl;
                this.selected.setValue(i);
                tabNotThere  = false;
                break;
              }
            }
            if (tabNotThere) {
              this.tabs.push(res);
              this.selected.setValue(this.tabs.length - 1);
            }
          }
        });
      }

      onTabChanged(event: MatTabChangeEvent) {
        if (event.index>=0)
          this.viewAppMetrics(this.tabs[event.index]);
      }

      deleteAppMetrics(stats?) {
        this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this entry?')
      .afterClosed().subscribe((res: boolean) => {
        if (res) {

        this.statsservice.deleteAppMetrics(this.instanceKey, stats.statsDetails.appId).subscribe(() => {
            for(let i=0; i<this.tabs.length; i++){
              if (this.tabs[i].instanceKey === this.instanceKey && this.tabs[i].statsDetails.appId == stats.statsDetails.appId) {
                this.tabs.splice(i, 1);
                if (this.tabs.length>0) {
                  if (this.tabs[i] == null)
                    i=i-1;
                  this.viewAppMetrics(this.tabs[i]);
                }
                break;
              }
            }
            this.dataSource.loadTable(this.instanceKey);
        });
      }
    });
  }
}
