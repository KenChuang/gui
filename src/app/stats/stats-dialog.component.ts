/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 AT&T Intellectual Property
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
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { StatsDialogFormData, StatsDetails } from '../interfaces/e2-mgr.types';
import { ErrorDialogService } from '../services/ui/error-dialog.service';
import { LoadingDialogService } from '../services/ui/loading-dialog.service';
import { NotificationService } from '../services/ui/notification.service';
import { StatsService } from '../services/stats/stats.service';

@Component({
  selector: 'stats-dialog',
  templateUrl: './stats-dialog.component.html',
  styleUrls: ['./stats-dialog.component.scss']
})

export class StatsDialogComponent implements OnInit {

  public statsDialogForm: FormGroup;
  public processing = false;

  constructor(
    private dialogRef: MatDialogRef<StatsDialogComponent>,
    private service: StatsService,
    private errorService: ErrorDialogService,
    private loadingDialogService: LoadingDialogService,
    private notifService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data) {
    // opens with empty fields; accepts no data to display
  }

  ngOnInit() {
    this.statsDialogForm = new FormGroup({
      appName: this.data? new FormControl(this.data.appName) : new FormControl(''),
      metricUrl: this.data? new FormControl(this.data.metricUrl) : new FormControl('')
    });
  }

  setupStats = (statsFormValue: StatsDialogFormData) => {
    if (!this.statsDialogForm.valid) {
      console.log('Invalid dialog form data, appname and/or metrics url failed to pass its validation checks');
      return;
    }
    this.processing = true;
    const setupRequest: StatsDetails = {
      appId: this.data.appId,
      appName: statsFormValue.appName.trim(),
      metricUrl: statsFormValue.metricUrl.trim()
    };
    this.loadingDialogService.startLoading('Setting up app metrics list');
    let observable: Observable<HttpResponse<Object>>;
    if(!(this.data.isEdit==='true'))
      observable = this.service.setupAppMetrics(this.data.instanceKey, setupRequest);
    else
      observable = this.service.editAppMetrics(this.data.instanceKey, setupRequest);
    observable
      .pipe(
        finalize(() => this.loadingDialogService.stopLoading())
      )
      .subscribe(
        (response: any) => {
          this.processing = false;
          this.notifService.success('App metrics setup!');
          this.dialogRef.close(true);
        },
        ((her: HttpErrorResponse) => {
          this.processing = false;
          // the error field carries the server's response
          let msg = her.message;
          if (her.error && her.error.message) {
            msg = her.error.message;
          }
          this.errorService.displayError('App Metrics setup request failed: ' + msg);
          // keep the dialog open
        })
      );
  }

  hasError(controlName: string, errorName: string) {
    if (this.statsDialogForm.controls[controlName].hasError(errorName)) {
      return true;
    }
    return false;
  }

  validateControl(controlName: string) {
    if (this.statsDialogForm.controls[controlName].invalid && this.statsDialogForm.controls[controlName].touched) {
      return true;
    }
    return false;
  }

}
