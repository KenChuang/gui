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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { finalize } from 'rxjs/operators';
import { XappOnboarderService } from '../services/xapp-onboarder/xapp-onboarder.service';
import { ErrorDialogService } from '../services/ui/error-dialog.service';
import { LoadingDialogService } from '../services/ui/loading-dialog.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NotificationService } from '../services/ui/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'rd-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.scss']
})
export class OnboardComponent implements OnInit {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  public urlOnboardForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<OnboardComponent>,
    private xappOnboarderService: XappOnboarderService,
    private errorDiaglogService: ErrorDialogService,
    private loadingDialogService: LoadingDialogService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) private data
  ) { }

  ngOnInit(): void {
    this.urlOnboardForm = new FormGroup({
      configURL: new FormControl('', [Validators.required]),
      schemaURL: new FormControl('')
    })
  }
  ;
  configFile: File;
  controlsSchema: File;
  descriptor = {
    "config-file.json": {},
    "controls-schema.json": {}
  }
  descriptor_url = {
    "config-file.json_url": "",
    "controls-schema.json_url": ""
  }

  uploadFromLocal() {
    // change to url
    let obj = {
      configURL: "",
      schemaURL: ""
    };
    obj.configURL = this.descriptor["config-file.json"]["config-file.json_url"];
    obj.schemaURL = this.descriptor["controls-schema.json"]["controls-schema.json_url"];
    this.uploadFromURL(obj);
  }

  uploadFromURL(data) {
    this.descriptor_url["config-file.json_url"] = data.configURL;
    if (data.schemaURL) {
      this.descriptor_url["controls-schema.json_url"] = data.schemaURL;
    } else {
      this.descriptor_url["controls-schema.json_url"] = "";
    }
    // console.log(this.descriptor_url);
    this.loadingDialogService.startLoading('Onboarding xApp');
    this.xappOnboarderService.onboardXappURL(this.descriptor_url, this.data.instanceKey)
      .pipe(
        finalize(() => {
          this.loadingDialogService.stopLoading();
          this.dialogRef.close(true);
        })
      )
      .subscribe(
        (response: HttpResponse<Object>) => {
          this.notificationService.success('Onboard succeeded!');
        },
        ((her: HttpErrorResponse) => {
          let msg = her.message;
          if (her.error && her.error.message) {
            msg = her.error.message;
          }
          this.notificationService.warn('Onboard failed: ' + msg);
        })
      );
  }


  selectConfigFile(event) {
    if (event.target.files.length) {
      this.configFile = event.target.files[0];
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.descriptor["config-file.json"] = JSON.parse(fileReader.result as string);
      }
      fileReader.readAsText(this.configFile);
    }
  }

  selectControlsSchema(event) {
    if (event.target.files.length) {
      this.controlsSchema = event.target.files[0];
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.descriptor["controls-schema.json"] = JSON.parse(fileReader.result as string);
      }
      fileReader.readAsText(this.controlsSchema);
    }
  }
}
