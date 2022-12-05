/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 - 2022 AT&T Intellectual Property
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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../../services/ui/notification.service';

@Component({
  selector: 'rd-offset-setup',
  templateUrl: './offset-setup.component.html',
  styleUrls: ['./offset-setup.component.scss']
})
export class OffsetSetupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<OffsetSetupComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  offsetWidthInput = 0;
  offsetHeightInput = 0;

  ngOnInit(): void {
    this.offsetWidthInput = this.data.offsetData.offsetWidth;
    this.offsetHeightInput = this.data.offsetData.offsetHeight;
  }

  applyOffset(): void {
    // check input available
    let tempWidth = Number(this.offsetWidthInput);
    let tempHeight = Number(this.offsetHeightInput);
    if (isNaN(tempWidth) || isNaN(tempHeight) || !Number.isInteger(tempWidth) || !Number.isInteger(tempHeight)) {
      this.notificationService.error('Setup failed: Field size should be integer!');
    } else {
      // input available
      this.data.offsetData.offsetWidth = tempWidth;
      this.data.offsetData.offsetHeight = tempHeight;
      this.notificationService.success('Offset setup successfully!');
      this.dialogRef.close();
    }
  }
}
