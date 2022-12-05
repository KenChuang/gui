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

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { finalize } from 'rxjs/operators';
import { XMXappDescriptor} from '../../interfaces/app-mgr.types';
import { AppMgrService } from '../../services/app-mgr/app-mgr.service';
import { NotificationService } from '../../services/ui/notification.service';
import { LoadingDialogService } from '../../services/ui/loading-dialog.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'rd-deploy-dialog',
  templateUrl: './deploy-dialog.component.html',
  styleUrls: ['./deploy-dialog.component.scss']
})
export class DeployDialogComponent implements OnInit {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public deployForm: FormGroup;
  xappDescriptor: XMXappDescriptor ;
  overrideFile: File;

  constructor(
    private dialogRef: MatDialogRef<DeployDialogComponent>,
    private appMgrService: AppMgrService,
    private loadingDialogService: LoadingDialogService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    this.deployForm = new FormGroup({
      xappName: new FormControl(this.data.xappName, [Validators.required]),
      helmVersion: new FormControl(''),
      releaseName: new FormControl(''),
      namespace: new FormControl(''),
      overrideFile: new FormControl({}),
    })
  }

  selectoverrideFile(event) {
    if (event.target.files.length) {
      this.overrideFile = event.target.files[0];
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.deployForm.value.overrideFile = JSON.parse(fileReader.result as string);
      }
      fileReader.readAsText(this.overrideFile);
    }
    else {
      this.deployForm.value.overrideFile =null
    }
  }

  deploy(xapp: XMXappDescriptor) {   
    this.xappDescriptor = xapp
    this.loadingDialogService.startLoading('Deploying ' + this.xappDescriptor.xappName);
    this.appMgrService.deployXapp(this.data.instanceKey, this.xappDescriptor)
      .pipe(
        finalize(() => {
          this.loadingDialogService.stopLoading();
          this.dialogRef.close();
        })
      )
      .subscribe(
        (response: HttpResponse<Object>) => {
          this.notificationService.success('App deploy succeeded!');
        },
        ((her: HttpErrorResponse) => {
          // the error field should have an ErrorTransport object
          let msg = her.message;
          if (her.error && her.error.message) {
            msg = her.error.message;
          }
          this.notificationService.warn('App deploy failed: ' + msg);
        })
    );
  }
}
