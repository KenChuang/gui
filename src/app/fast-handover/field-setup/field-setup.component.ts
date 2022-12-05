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
  selector: 'rd-field-setup',
  templateUrl: './field-setup.component.html',
  styleUrls: ['./field-setup.component.scss']
})
export class FieldSetupComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<FieldSetupComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  fieldWidthInput = 0;
  fieldHeightInput = 0;

  ngOnInit(): void {
    this.fieldWidthInput = this.data.fieldData.fieldWidth;
    this.fieldHeightInput = this.data.fieldData.fieldHeight;
  }

  applyArea(): void {
    // check input available
    let tempWidth = Number(this.fieldWidthInput);
    let tempHeight = Number(this.fieldHeightInput);
    if (isNaN(tempWidth) || isNaN(tempHeight) || tempWidth <= 0 || tempHeight <= 0 || !Number.isInteger(tempWidth) || !Number.isInteger(tempHeight)) {
      this.notificationService.error('Setup failed: Field size should be positive integer!');
    } else {
      // input available
      this.data.fieldData.fieldWidth = tempWidth;
      this.data.fieldData.fieldHeight = tempHeight;
      this.notificationService.success('Area setup successfully!');
      this.dialogRef.close();
    }
  }
}
