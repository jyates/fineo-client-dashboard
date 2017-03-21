import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders } from '@angular/core';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule'
  },
  {
    path: 'register',
    loadChildren: 'app/pages/register/register.module#RegisterModule'
  },
  {
    path: 'select-package',
    loadChildren: 'app/pages/select-package/select-package.module#SelectPackageModule'
  },
  {
    path: 'payment',
    loadChildren: 'app/pages/payment/payment.module#PaymentModule'
  },
  {
    path: 'confirm',
    loadChildren: 'app/pages/confirm/confirm.module#ConfirmModule'
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // { path: 'dashboard', loadChildren: 'app/pages/dashboard/dashboard.module#DashboardModule' },
      { path: 'profile', loadChildren: 'app/pages/profile/profile.module#ProfileModule' },
      { path: 'devices', loadChildren: 'app/pages/devices/devices.module#DevicesModule' },
      { path: 'schemas', loadChildren: 'app/pages/schemas/schemas.module#SchemasModule' },
      { path: 'errors', loadChildren: 'app/pages/errors/errors.module#ErrorsModule' },
      { path: 'data', loadChildren: 'app/pages/data/data.module#DataModule' },

      // { path: 'editors', loadChildren: 'app/pages/editors/editors.module') },
      // { path: 'components', loadChildren: 'app/pages/components/components.module') }
      // { path: 'charts', loadChildren: 'app/pages/charts/charts.module') },
      // { path: 'ui', loadChildren: 'app/pages/ui/ui.module') },
      // { path: 'forms', loadChildren: 'app/pages/forms/forms.module') },
      // { path: 'tables', loadChildren: 'app/pages/tables/tables.module') },
      // { path: 'maps', loadChildren: 'app/pages/maps/maps.module') },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
