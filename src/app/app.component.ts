import { Route, Routes } from '@angular/router';
import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';

import { GlobalState } from './global.state';
import { BaImageLoaderService, BaThemePreloader, BaThemeSpinner } from './theme/services';
import { BaThemeConfig } from './theme/theme.config';
import { BaMenuService } from './theme';
import { ComponentsHelper } from 'ng2-bootstrap';
import { SchemaService } from './services/schema.service'
import { UserService } from './services/user.service'
import { layoutPaths } from './theme/theme.constants';

import 'style-loader!./app.scss';
import 'style-loader!./theme/initial.scss';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
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
              private themeConfig: BaThemeConfig,
              private _menuService: BaMenuService,
              private viewContainerRef: ViewContainerRef,
              private schemaService: SchemaService,) {

    var routes = this.updateMenuForSchemas(<Routes>MENU);
    this._menuService.updateMenuByRoutes(routes);

    themeConfig.config();

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
