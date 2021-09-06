import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { conf } from 'src/config';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isDisabled: boolean = false;
  btnLabel: string = 'Masuk';
  backButtonPressedOnceToExit: boolean = false;
  email: string = '';
  password: string = '';
  subscription: any;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private storageCtrl: Storage,
    private platform: Platform
  ) {}

  async ngOnInit() {
    await this.storageCtrl.create();
    this.storageCtrl.get('isLogin').then((val) => {
      if (val) {
        this.router.navigate(['home'], { replaceUrl: true });
      }
    });
  }

  async goLoginNew() {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers = headers.append(
      'Authorization',
      'Basic ' + btoa(conf._uname + ':' + conf._upass)
    );

    this.isDisabled = true;

    let arrData = {
      action: 'loginapp',
      username: this.email,
      table: 'm_user',
      playerid: '',
    };

    if (!this.email || !this.password) {
      this.showToast('Username atau Password harus diisi');
      this.btnLabel = 'Masuk';
      this.isDisabled = false;
      return false;
    }
    this.http
      .post(conf.api_url_wartek + 'login', arrData, { headers: headers })
      .subscribe(
        (data) => {
          if (data == 'N') {
            this.showToast('User tidak aktif');
            this.isDisabled = false;
            this.btnLabel = 'Maasuk';
            return false;
          }
          this.showToast('Berhasil Masuk');
          this.storageCtrl.set('isLogin', true);
          this.storageCtrl.set('dataLogin', data);
          setTimeout(() => {
            this.router.navigate(['home'], { replaceUrl: true });
          }, 1000);
        },
        (error) => {
          console.log(error);
          this.isDisabled = false;
          this.btnLabel = 'Masuk';
          this.showToast(error.error.text);
        }
      );
  }

  async showToast(param) {
    let toast = await this.toastCtrl.create({
      message: param,
      duration: 1000,
      position: 'bottom',
    });
    toast.present();
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribe(() => {
      if (this.backButtonPressedOnceToExit) {
        navigator['app'].exitApp();
      } else {
        setTimeout(() => {
          this.backButtonPressedOnceToExit = false;
        }, 500);
        this.backButtonPressedOnceToExit = true;
        this.showToast('Press back button twice to exit');
      }
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }
}
