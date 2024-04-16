/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Component, OnInit, ViewChild } from '@angular/core';

import { NgForm } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ParkingPlaceMasterService } from 'src/app/core/services/ProviderAdminServices/parking-place-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-parking-place',
  templateUrl: './parking-place-master.component.html',
})
export class ParkingPlaceComponent implements OnInit {
  status!: string;
  userID: any;
  service: any;
  state: any;
  zoneID: any;
  districtID: any;
  parkingPlaceID: any;
  parkingPlaceName: any;
  parkingPlaceDesc: any;
  stateID: any;
  talukID: any;
  areaHQAddress: any;
  showTableFlag = false;
  disableSelection = false;
  showParkingPlaces: any = true;
  parkingPlaceNameExist: any = false;
  showListOfParking: any = true;

  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  editable: any = false;
  createButton = false;
  enableHubFlag = false;

  countryID: any;
  serviceID: any;
  createdBy: any;
  bufferCount: any = 0;

  /* Arrays*/
  services: any = [];
  states: any = [];
  zones: any = [];
  availableParkingPlaces: any = [];
  availableParkingPlaceNames: any = [];
  displayedColumns = [
    'sno',
    'zoneName',
    'parkingPlaceName',
    'parkingPlaceDesc',
    'areaHQAddress',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'stateName',
    'zoneName',
    'parkingPlaceName',
    'parkingPlaceDesc',
    'areaHQAddress',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredavailableParkingPlaces = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredavailableParkingPlaces.paginator = this.paginator;
  }
  @ViewChild('searchForm') searchForm!: NgForm;
  @ViewChild('parkingPlaceForm') parkingPlaceForm!: NgForm;
  parkingPlaceList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) addZonePaginator: MatPaginator | null = null;
  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public parkingPlaceMasterService: ParkingPlaceMasterService,
    private alertMessage: ConfirmationDialogsService,
  ) {
    this.data = [];
    this.service_provider_id = this.commonDataService.service_providerID;
    this.countryID = 1; // hardcoded as country is INDIA
    this.serviceID = this.commonDataService.serviceIDMMU;
    this.createdBy = this.commonDataService.uname;
    this.filteredavailableParkingPlaces.paginator = this.paginator;
    this.filteredavailableParkingPlaces.sort = this.sort;
  }

  showForm() {
    this.showParkingPlaces = false;
    this.showTableFlag = false;
    this.disableSelection = true;
    this.showListOfParking = false;
  }
  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServiceLines();
  }
  AfterViewInit() {
    this.filteredavailableParkingPlaces.paginator = this.paginator;
    this.filteredavailableParkingPlaces.sort = this.sort;
  }
  getServiceLines() {
    this.parkingPlaceMasterService
      .getServiceLinesNew(this.userID)
      .subscribe((response: any) => {
        this.getServicesSuccessHandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
            // this.alertMessage.alert(err, 'error');
          };
      });
  }
  getServicesSuccessHandeler(response: any) {
    this.services = response.data;
  }
  parkAndHub!: string;
  getStates(value: any) {
    this.zones = [];
    this.filteredavailableParkingPlaces.data = [];
    if (value.serviceID === 4) {
      this.parkAndHub = 'Hub';
    } else {
      this.parkAndHub = 'Parking Place';
    }
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.parkingPlaceMasterService.getStatesNew(obj).subscribe((response) => {
      this.getStatesSuccessHandeler(response),
        (err: any) => {
          console.log('error in fetching states', err);
        };
      //this.alertMessage.alert(err, 'error');
    });
  }

  getStatesSuccessHandeler(response: any) {
    this.states = response.data;
    this.createButton = false;
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.zones = [];
    this.filteredavailableParkingPlaces.data = [];
    this.filteredavailableParkingPlaces.paginator = this.paginator;
    this.filteredavailableParkingPlaces.sort = this.sort;
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }
  getAvailableZones(providerServiceMapID: any) {
    this.parkingPlaceMasterService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe((response) => this.getZonesSuccessHandler(response));
  }
  getZonesSuccessHandler(response: any) {
    this.createButton = false;
    if (response !== undefined) {
      for (const zone of response.data) {
        if (!zone.deleted) {
          this.zones.push(zone);
        }
      }
    }
  }

  getParkingPlaces(zoneID: any, providerServiceMapID: any) {
    this.parkingPlaceObj = {
      zoneID: zoneID,
      providerServiceMapID: providerServiceMapID,
    };
    this.parkingPlaceMasterService
      .getParkingPlaces(this.parkingPlaceObj)
      .subscribe((response) => this.getParkingPlaceSuccessHandler(response));
  }

  getParkingPlaceSuccessHandler(response: any) {
    this.showTableFlag = true;
    this.editable = false;
    this.createButton = true;
    this.availableParkingPlaces.data = response.data;
    this.filteredavailableParkingPlaces.data = response.data;
    for (const availableParkingPlace of this.availableParkingPlaces) {
      this.availableParkingPlaceNames.data.push(
        availableParkingPlace.parkingPlaceName,
      );
    }
  }

  parkingPlaceObj: any;
  addParkingPlaceToList(values: any) {
    this.parkingPlaceObj = {};
    this.parkingPlaceObj.parkingPlaceName = values.parkingPlaceName;
    this.parkingPlaceObj.parkingPlaceDesc = values.parkingPlaceDesc;
    this.parkingPlaceObj.countryID = this.countryID;

    this.parkingPlaceObj.stateID = this.state.stateID;
    this.parkingPlaceObj.stateName = this.state.stateName;

    this.parkingPlaceObj.zoneID = this.zoneID.zoneID;
    this.parkingPlaceObj.zoneName = this.zoneID.zoneName;

    this.parkingPlaceObj.areaHQAddress =
      values.areaHQAddress !== undefined && values.areaHQAddress !== null
        ? values.areaHQAddress.trim()
        : null;
    this.parkingPlaceObj.providerServiceMapID = this.providerServiceMapID;
    this.parkingPlaceObj.createdBy = this.createdBy;
    this.checkDuplicates(this.parkingPlaceObj);
  }
  checkDuplicates(parkingPlaceObj: any) {
    if (this.parkingPlaceList.data.length === 0) {
      this.parkingPlaceList.data.push(this.parkingPlaceObj);
      this.parkingPlaceForm.resetForm();
    } else if (this.parkingPlaceList.data.length > 0) {
      for (let a = 0; a < this.parkingPlaceList.data.length; a++) {
        if (
          this.parkingPlaceList.data[a].parkingPlaceName ===
            this.parkingPlaceObj.parkingPlaceName &&
          this.parkingPlaceList.data[a].stateID ===
            this.parkingPlaceObj.stateID &&
          this.parkingPlaceList.data[a].zoneID ===
            this.parkingPlaceObj.zoneID &&
          this.parkingPlaceList.data[a].areaHQAddress ===
            this.parkingPlaceObj.areaHQAddress
        ) {
          this.bufferCount = this.bufferCount + 1;
          console.log('Duplicate Combo Exists', this.bufferCount);
        }
      }
      if (this.bufferCount > 0) {
        this.alertMessage.alert('Already exists');
        this.bufferCount = 0;
        this.parkingPlaceForm.resetForm();
      } else {
        this.parkingPlaceList.data.push(this.parkingPlaceObj);
        this.parkingPlaceForm.resetForm();
      }
    }
  }

  remove_obj(i: any) {
    this.parkingPlaceList.data.splice(i, 1);
  }

  storeParkingPlaces() {
    const obj = { parkingPlaces: this.parkingPlaceList.data };
    this.parkingPlaceMasterService
      .saveParkingPlace(obj)
      .subscribe((response) => this.parkingPlaceSuccessHandler(response));
  }

  parkingPlaceSuccessHandler(response: any) {
    this.parkingPlaceList.data = [];
    this.alertMessage.alert('Saved successfully', 'success');
    this.showList();
  }

  dataObj: any = {};
  updateParkingPlaceStatus(parkingPlace: any) {
    const flag = !parkingPlace.deleted;
    let status;
    if (flag === true) {
      status = 'Deactivate';
      this.status = 'Deactivate';
    }
    if (flag === false) {
      status = 'Activate';
      this.status = 'Activate';
    }

    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to ' + status + '?')
      .subscribe((response) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.parkingPlaceID = parkingPlace.parkingPlaceID;
          this.dataObj.deleted = !parkingPlace.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.parkingPlaceMasterService
            .updateParkingPlaceStatus(this.dataObj)
            .subscribe((response) => this.updateStatusHandler(response));

          parkingPlace.deleted = !parkingPlace.deleted;
        }
      });
  }
  updateStatusHandler(response: any) {
    console.log('Parking place status changed');
    this.alertMessage.alert(this.status + 'd successfully', 'success');
  }

  showList() {
    this.getParkingPlaces(this.zoneID.zoneID, this.state.providerServiceMapID);
    this.showParkingPlaces = true;
    this.editable = false;
    this.disableSelection = false;
    this.showListOfParking = true;
  }

  checkExistance(parkingPlaceName: any) {
    this.parkingPlaceNameExist =
      this.availableParkingPlaceNames.includes(parkingPlaceName);
  }

  initializeObj() {
    this.parkingPlaceID = '';
    this.parkingPlaceName = '';
    this.parkingPlaceDesc = '';
    this.areaHQAddress = '';
  }
  editParkingPlaceData(parkingPlace: any) {
    this.editable = true;
    this.disableSelection = true;
    this.showListOfParking = false;
    this.parkingPlaceID = parkingPlace.parkingPlaceID;
    this.parkingPlaceName = parkingPlace.parkingPlaceName;
    this.parkingPlaceDesc = parkingPlace.parkingPlaceDesc;
    this.areaHQAddress =
      parkingPlace.areaHQAddress !== undefined &&
      parkingPlace.areaHQAddress !== null
        ? parkingPlace.areaHQAddress.trim()
        : null;
  }

  updateParkingPlaceData() {
    this.dataObj = {};
    this.dataObj.parkingPlaceID = this.parkingPlaceID;
    this.dataObj.service = this.service.serviceID;
    this.dataObj.stateID = this.state.stateID;
    this.dataObj.zoneID = this.zoneID.zoneID;
    this.dataObj.parkingPlaceName = this.parkingPlaceName;
    this.dataObj.parkingPlaceDesc = this.parkingPlaceDesc;
    this.dataObj.areaHQAddress =
      this.areaHQAddress !== undefined && this.areaHQAddress !== null
        ? this.areaHQAddress.trim()
        : null;
    this.parkingPlaceMasterService
      .updateParkingPlaceDetails(this.dataObj)
      .subscribe((response) => this.updateHandler(response));
  }

  updateHandler(response: any) {
    this.editable = true;
    this.alertMessage.alert('Updated successfully', 'success');
    this.showList();
    this.initializeObj();
    this.availableParkingPlaceNames = [];
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableParkingPlaces = this.availableParkingPlaces;
    } else {
      this.filteredavailableParkingPlaces.data = [];
      this.availableParkingPlaces.forEach((item: any) => {
        for (const key in item) {
          if (key === 'parkingPlaceName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableParkingPlaces.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.parkingPlaceForm.resetForm();
          this.showList();
          this.parkingPlaceList.data = [];
        }
      });
  }
}