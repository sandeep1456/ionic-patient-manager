
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";

/*
  Generated class for the PatientProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PatientProvider {
  serverUrl: string = "http://703c5297.ngrok.io/";

  constructor(public http: HttpClient) {
    console.log('Hello PatientProvider Provider');
  }

  getPatients():Observable<any> {
    return this.http.get(this.serverUrl+"getAllList");
  }

  deletePatient(patientId): Observable<any> {
    return this.http.delete(this.serverUrl+"deleteByID/"+patientId);
  }
}
