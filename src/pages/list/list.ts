import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { PatientOfflineProvider } from '../../providers/patient-offline/patient-offline';
import { ItemDetailsPage } from '../item-details/item-details';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  patients: Array<{id: number, name: string, email: string, phone_no: string, gender: number, icon: string}>;

  constructor(public navCtrl: NavController,
      private alertCtrl:AlertController,
      public loadingCtrl: LoadingController,
      public navParams: NavParams,
      private patientService: PatientOfflineProvider) {
    this.patients = [];

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.patientService.getPatients()
    .subscribe(
      data => {
        console.log( "patient data:", data );
        this.patients = data;
        for(let i = 0; i < this.patients.length; i++) {
          let patient = this.patients[i];
          patient.icon = patient.gender === 1 ? "male" : "female";
        }
        loading.dismiss();
      },
      err => {
        console.log( "Error patient data", err);
        loading.dismiss();
      }
    );
  }

  itemTapped(event, patient) {
    this.navCtrl.push(ItemDetailsPage, {
      patient: patient
    });
  }

  confirmDeletePatient(event, patientId) {
    event.stopPropagation();
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Do you want to delete this patient?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deletePatient(patientId);
          }
        }
      ]
    });
    alert.present();
  }

  deletePatient(patientId) {
    this.patientService.deletePatient(patientId)
    .subscribe(
      data => {
        console.log( "Delete Patient:", data );
        if(data == "1") {
          this.patients = this.patients.filter(patient => patient.id !== patientId);
        }
      },
      err => {
        console.log( "Error deleting patient", err);
      }
    );
  }

}
