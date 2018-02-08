import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../_services/_user.service';
import { UserPage } from '../../../../_models/user.model';
import { UserPageLayer, LayerPermission } from '../../../../_models/layer.model';
import { UserPageService } from '../../../../_services/_userPage.service';
import { LayerPermissionService } from '../../../../_services/_layerPermission.service';
import { UserPageLayerService } from '../../../../_services/_userPageLayer.service';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'page-config',
    templateUrl: './pageConfig.component.html',
    providers: [UserService, UserPageLayerService, UserPageService],
    styleUrls: ['./pageConfig.component.scss']
})

export class PageConfigComponent implements OnInit {
    @Input() pageID;
    @Input() userID;
    @Input() pageName;

    private newUserPage: string;
    private newUserPageLayer = new UserPageLayer;
    private layerPermissions: LayerPermission[];
    private userPageLayers: UserPageLayer[]; //insert instantiation if error **REMOVE**
    private token: string;
    private selectedUserPage: UserPage;
    
    constructor(private userPageLayerService: UserPageLayerService, private userPageService: UserPageService, private layerPermissionService: LayerPermissionService) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    ngOnInit() {
        this.getUserPageLayers();
        this.getLayers();
    }

    private getUserPageLayers(): void {
        this.userPageLayerService
            .GetPageLayers(this.pageID)
            .subscribe((data: UserPageLayer[]) => {
                this.userPageLayers = data;
            });
    }

    private getLayers(): void {
        this.layerPermissionService
            .GetByUser(this.userID)
            .subscribe((data: LayerPermission[]) => {
                console.log(data)
                this.layerPermissions = data; 
            });
    }

    private addUserPageLayer(newUserPageLayer: UserPageLayer): void {
        this.newUserPageLayer.userPageID = this.pageID ;
        this.newUserPageLayer.userID = this.userID ;
        this.newUserPageLayer.layerON = true;
        this.newUserPageLayer.layerID = newUserPageLayer.layerID;

        this.userPageLayerService
            //.Add(this.newUserPageLayer, this.token)
            .Add(this.newUserPageLayer)
            .subscribe(() => {
                this.getUserPageLayers();
            });
    }

    private updateUserPageLayer(userPage: UserPage): void {
        this.userPageLayerService
            .Update(userPage)
            .subscribe(() => {
                this.getUserPageLayers();
            });
    }

    public deleteUserPageLayer(userPageID: number): void {
        this.userPageLayerService
            .Delete(userPageID)
            .subscribe(() => {
                this.getUserPageLayers();
            });
    }
}