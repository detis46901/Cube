import { Component, Input, OnInit } from '@angular/core';
import { Api2Service } from '../../api2.service';
import { Configuration } from '../../../_api/api.constants'

@Component({
  selector: 'password',
  templateUrl: './password.component.html',
  providers: [Api2Service, Configuration]
  //styleUrls: ['./app.component.css', './styles/w3.css'],
})

export class PasswordComponent{}