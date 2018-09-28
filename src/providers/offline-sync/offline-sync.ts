import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { AlertController, LoadingController } from 'ionic-angular';

import { PatientProvider } from '../patient/patient';
/*
  Generated class for the OfflineSyncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class OfflineSyncProvider {
  isOffline: boolean = false;
  DELETE_QUEUE_NAME: string = "offlineDeleteActions";
  deleteLog: string;

  constructor(public http: HttpClient,
    private alertCtrl:AlertController,
    private loadingCtrl: LoadingController,
    private patientService: PatientProvider,
    private network: Network) {

    console.log('Hello OfflineSyncProvider Provider');

    this.isOffline = !this.network.type ? !window.navigator.onLine : this.network.type==="none";

    this.network.onDisconnect().subscribe(() => {
      this.isOffline = true;
      this.showNetworkStatus("You're offline");
    });

    this.network.onConnect().subscribe(() => {
      this.isOffline = false;
      this.showNetworkStatus("You're online");
      this.syncOfflineActions();
    });
  }

  isAppOffline(){
    return this.isOffline;
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

  deletePatient(patientId){
    let list:any = localStorage.getItem(this.DELETE_QUEUE_NAME);
    list = list ? JSON.parse(list) : [];
    list.push(patientId);
    localStorage.setItem(this.DELETE_QUEUE_NAME, JSON.stringify(list));
  }

  syncOfflineActions(){
    // Sync delete action queue
    if(!localStorage.getItem(this.DELETE_QUEUE_NAME)) {
      return;
    }
    this.deleteLog = "";
    this.syncOfflineDelete();
  }

  syncOfflineDelete(){
    // Sync delete action queue
    let list:any = localStorage.getItem(this.DELETE_QUEUE_NAME);
    if(list) {
      list = JSON.parse(list);
      let patientId = list.shift();
      if(patientId) {
        localStorage.setItem(this.DELETE_QUEUE_NAME, (list.length>0 ? JSON.stringify(list) : ""));

        let loading = this.loadingCtrl.create({
          content: 'Sync in progress <br/> Deleting Patient '+patientId
        });
        loading.present();
        this.patientService.deletePatient(patientId)
        .subscribe(
          data => {
            this.deleteLog += "Patient " + patientId+": "+ (data=="1"? "Success" : "Failed") + "<br/>";
            loading.dismiss();
            this.syncOfflineDelete();
          },
          (err: HttpErrorResponse) => {
            this.deleteLog += patientId+": Failed <br/>";
            loading.dismiss();
            this.syncOfflineDelete();
          }
        )
      }
    } else if(this.deleteLog) {
      this.deleteLog = "Delete Patient(s) <br/>" + this.deleteLog;

      let alert = this.alertCtrl.create({
        title: "Offline Sync Status",
        subTitle: this.deleteLog,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
