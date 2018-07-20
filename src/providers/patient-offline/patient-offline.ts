import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
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
  isOffline: boolean = false;

  constructor(public http: HttpClient,
    private patientService: PatientProvider,
    private offlineService: OfflineSyncProvider,
    private alertCtrl: AlertController,
    private network: Network) {

    this.isOffline = !this.network.type ? !window.navigator.onLine : this.network.type==="none";
    console.log('Hello PatientOfflineProvider Provider');

    this.network.onDisconnect().subscribe(() => {
      this.isOffline = true;
      this.showNetworkStatus("You're offline");
    });

    this.network.onConnect().subscribe(() => {
      this.isOffline = false;
      this.showNetworkStatus("You're online");
      this.offlineService.syncOfflineActions();
    });
  }

  showNetworkStatus(msg) {
    let alert = this.alertCtrl.create({
      subTitle: msg
    });
    alert.present();
    setTimeout(() => {
      alert.dismiss();
    }, 2000);
  }


  getPatients():Observable<any> {
    if(this.isOffline) {
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

    if(this.isOffline) {
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
