import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";

import { PatientProvider } from '../patient/patient';
import { OfflineSyncProvider } from '../offline-sync/offline-sync';
/*
  Generated class for the PatientOfflineProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PatientOfflineProvider {
  constructor(public http: HttpClient,
    private patientService: PatientProvider,
    private offlineService: OfflineSyncProvider) {

    console.log('Hello PatientOfflineProvider Provider');
  }

  getPatients():Observable<any> {
    if(this.offlineService.isAppOffline()) {
      let list:any = localStorage.getItem("patientList");
      if(list) {
        list = JSON.parse(list);
      } else {
        list = [];
      }
      return new Observable( observer => {
        observer.next(list);
        observer.complete();
      });
    } else {
      return new Observable( observer => {
        this.patientService.getPatients()
        .subscribe(
          data => {
            // console.log( "Section data:", data );
            localStorage.setItem("patientList", JSON.stringify(data));
            observer.next(data);
            observer.complete();
          },
          (err: HttpErrorResponse) => {
            observer.error( err );
            observer.complete();
          }
        )
      });
    }
  }

  deletePatient(patientId): Observable<any> {
    let list:any = localStorage.getItem("patientList");
    if(list) {
      list = JSON.parse(list);
      list = list.filter(patient => patient.id !== patientId);
      localStorage.setItem("patientList", JSON.stringify(list));
    }

    if(this.offlineService.isAppOffline()) {
      this.offlineService.deletePatient(patientId);

      return new Observable( observer => {
        observer.next("1");
        observer.complete();
      });
    } else {
      return this.patientService.deletePatient(patientId);
    }
  }
}
