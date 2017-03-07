import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => System.import('./login/login.module')
  },
  {
    path: 'register',
    loadChildren: () => System.import('./register/register.module')
  },
  {
    path: 'select-package',
    loadChildren: () => System.import('./select-package/select-package.module')
  },
  {
    path: 'payment',
    loadChildren: () => System.import('./payment/payment.module')
  },
  {
    path: 'confirm',
    loadChildren: () => System.import('./confirm/confirm.module')
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // { path: 'dashboard', loadChildren: () => System.import('./dashboard/dashboard.module') },
      { path: 'profile', loadChildren: () => System.import('./profile/profile.module') },
      { path: 'devices', loadChildren: () => System.import('./devices/devices.module') },
      { path: 'schemas', loadChildren: () => System.import('./schemas/schemas.module') },
      { path: 'data', loadChildren: () => System.import('./data/data.module') },

      // { path: 'editors', loadChildren: () => System.import('./editors/editors.module') },
      // { path: 'components', loadChildren: () => System.import('./components/components.module') }
      // { path: 'charts', loadChildren: () => System.import('./charts/charts.module') },
      // { path: 'ui', loadChildren: () => System.import('./ui/ui.module') },
      // { path: 'forms', loadChildren: () => System.import('./forms/forms.module') },
      // { path: 'tables', loadChildren: () => System.import('./tables/tables.module') },
      // { path: 'maps', loadChildren: () => System.import('./maps/maps.module') },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
