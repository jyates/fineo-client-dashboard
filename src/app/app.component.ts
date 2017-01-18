import { Route, Routes } from '@angular/router';
import './app.loader.ts';
import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { GlobalState } from './global.state';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner } from './theme/services';
import { layoutPaths } from './theme/theme.constants';
import { BaThemeConfig } from './theme/theme.config';
import { BaMenuService } from './theme';
import {ComponentsHelper } from 'ng2-bootstrap';
import { SchemaService } from './services/schema.service'
import { UserService } from './services/user.service'

import { MENU } from './app.menu';
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('normalize.css'), require('./app.scss')],
  template: `
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App {

  isMenuCollapsed: boolean = false;

  constructor(private _state: GlobalState,
              private _imageLoader: BaImageLoaderService,
              private _spinner: BaThemeSpinner,
              private _config: BaThemeConfig,
              private _menuService: BaMenuService,
              private viewContainerRef: ViewContainerRef,
              private schemaService: SchemaService) {

    var routes = this.updateMenuForSchemas(<Routes>MENU);
    this._menuService.updateMenuByRoutes(routes);

    this._fixModals();

    this._loadImages();

    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public ngAfterViewInit(): void {
    // hide spinner once all loaders are completed
    BaThemePreloader.load().then((values) => {
      this._spinner.hide();
    });
  }

  private _loadImages(): void {
    // register some loaders
    BaThemePreloader.registerLoader(this._imageLoader.load(layoutPaths.images.root + 'sky-bg.jpg'));
  }

  private _fixModals(): void {
    ComponentsHelper.prototype.getRootViewContainerRef = function () {
      // https://github.com/angular/angular/issues/9293
      if (this.root) {
        return this.root;
      }
      var comps = this.applicationRef.components;
      if (!comps.length) {
        throw new Error("ApplicationRef instance not found");
      }
      try {
        /* one more ugly hack, read issue above for details */
        var rootComponent = this.applicationRef._rootComponents[0];
        this.root = rootComponent._component.viewContainerRef;
        return this.root;
      }
      catch (e) {
        throw new Error("ApplicationRef instance not found");
      }
    };
  }

  private updateMenuForSchemas(menu:Route[]):Route[]{
    var schemaMenu = menu[0]["children"].filter(function(route){
      return route.path == "schemas";
    })[0];
    var schemas = [];
    // start by setting the children to 'loading'
    schemas.push({
        path: ["schemas", "loading"],
        data: {
          menu: {
            title: "LOADING..."
          }
        }
    });
    schemaMenu["children"] = schemas

    // add a listener for when we set the api key to ensure that we update the schema
    let self = this;
    this._state.subscribe(UserService.API_KEY_STATE, (key) =>{
      console.log("Updating schema for initial api key load");
      self.updateSchemas(menu, schemas);
    });

    this._state.subscribe(SchemaService.SCHEMA_CHANGE_STATE, (key) =>{
      console.log("Updating schema for "+key);
      self.updateSchemas(menu, schemas);
    });
    return menu;
  }

  private updateSchemas(menu:Route[], schemas:any[]):void{
    let self = this;
    console.log("Updating schemas!");
    this.schemaService.schemas().then(schemaMeta =>{
      console.log("Making menu update");
      // reset the schemas array
      schemas.length = 0;
      // add all the schemas that we hear about
      schemaMeta.forEach(function(schema){
        schemas.push({
          path: ["schemas", "inst", schema["id"]],
          data: {
            menu: {
              title: schema["name"]
            }
          }
        })
      });

        // add a 'plus' schema with no name
      schemas.push({
        path: "create",
        data: {
          menu:{
            title: "",
            icon: 'ion-plus-circled',
          }
        }
      })

      // finally, update the actual menu
      self._menuService.updateMenuByRoutes(menu);
    })
    // reading failed!
    .catch(error =>{
      let err = JSON.stringify(error);
      console.log("Failed to load schema...");
      console.log(err)
      alert("Failed to load schema information. Please login again and send console information to help@fineo.io");
    });
  }
}
