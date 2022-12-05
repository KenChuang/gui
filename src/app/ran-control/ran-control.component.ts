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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { RicInstance } from '../interfaces/dashboard.types';
import { E2ManagerService } from '../services/e2-mgr/e2-mgr.service';
import { InstanceSelectorService } from '../services/instance-selector/instance-selector.service';
import { ConfirmDialogService } from '../services/ui/confirm-dialog.service';
import { ErrorDialogService } from '../services/ui/error-dialog.service';
import { LoadingDialogService } from '../services/ui/loading-dialog.service';
import { NotificationService } from '../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';
import { RANControlDataSource } from './ran-control.datasource';

@Component({
  selector: 'rd-ran-control',
  templateUrl: './ran-control.component.html',
  styleUrls: ['./ran-control.component.scss']
})
export class RanControlComponent implements OnInit, OnDestroy {

  darkMode: boolean;
  panelClass: string;
  displayedColumns: string[] = ['nbId', 'nodeType', 'ranName', 'ranIp', 'ranPort', 'connectionStatus'];
  dataSource: RANControlDataSource;
  private instanceChange: Subscription;
  private instanceKey: string;

  constructor(private e2MgrSvc: E2ManagerService,
    private errorDialogService: ErrorDialogService,
    private confirmDialogService: ConfirmDialogService,
    private notificationService: NotificationService,
    private loadingDialogService: LoadingDialogService,
    public instanceSelectorService: InstanceSelectorService,
    public dialog: MatDialog,
    public ui: UiService) { }

  ngOnInit() {
    this.dataSource = new RANControlDataSource(this.e2MgrSvc, this.notificationService);
    // this.dataSource.loadTable('i1'); // keep it for test purpose

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });

    this.instanceChange = this.instanceSelectorService.getSelectedInstance().subscribe((instance: RicInstance) => {
      // if (instance.key) {
      if (true) {
        this.instanceKey = instance.key;
        this.dataSource.loadTable(instance.key);
      }
    });
  }

  ngOnDestroy() {
    this.instanceChange.unsubscribe();
  }

  disconnectAllRANConnections() {
    const aboutError = 'Disconnect all RAN Connections Failed: ';
    this.confirmDialogService.openConfirmDialog('Are you sure you want to disconnect all RAN connections?')
      .afterClosed().subscribe((res: boolean) => {
        if (res) {
          this.loadingDialogService.startLoading('Disconnecting');
          this.e2MgrSvc.nodebPut(this.instanceKey)
            .pipe(
              finalize(() => this.loadingDialogService.stopLoading())
            )
            .subscribe(
              (body: any) => {
                this.notificationService.success('Disconnect succeeded!');
                this.dataSource.loadTable(this.instanceKey);
              },
              (her: HttpErrorResponse) => {
                // the error field should have an ErrorTransport object
                let msg = her.message;
                if (her.error && her.error.message) {
                  msg = her.error.message;
                }
                this.errorDialogService.displayError('Disconnect failed: ' + msg);
              }
            );
        }
      });
  }

}
