import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AlertController, LoadingController } from 'ionic-angular';

/*
  Generated class for the OfflineSyncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class OfflineSyncProvider {
  serverUrl: string = "http://58487581.ngrok.io/";
  DELETE_QUEUE_NAME = "offlineDeleteActions";
  deleteLog: string;

  constructor(public http: HttpClient,
    private alertCtrl:AlertController,
    private loadingCtrl: LoadingController) {
    console.log('Hello OfflineSyncProvider Provider');
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
        this.http.delete(this.serverUrl+"deleteByID/"+patientId)
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
      this.deleteLog = "Delete Patient <br/>" + this.deleteLog;

      let alert = this.alertCtrl.create({
        title: "Offline Sync Status",
        subTitle: this.deleteLog,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
