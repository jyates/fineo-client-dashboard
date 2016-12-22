import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing } from './devices.routing';

import { DeviceDataService }  from './deviceData.service';
import { DeviceHoverTable }   from './components/basicTables/components/hoverTable';

// import { ResponsiveTable }     from './components/basicTables/components/responsiveTable';
// import { StripedTable }        from './components/basicTables/components/stripedTable';
// import { BorderedTable }       from './components/basicTables/components/borderedTable';
// import { CondensedTable }      from './components/basicTables/components/condensedTable';
// import { ContextualTable }     from './components/basicTables/components/contextualTable';

// import { Ng2SmartTableModule } from 'ng2-smart-table';
// import { SmartTablesService } from './smartTables.service';

import { Devices } from './devices.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    // Ng2SmartTableModule,
    routing
  ],
  declarations: [
    Devices,
    DeviceHoverTable,
    // BasicTables,
    // BorderedTable,
    // CondensedTable,
    // StripedTable,
    // ContextualTable,
    // ResponsiveTable
  ],
  providers: [
    DeviceDataService,
    // SmartTablesService
  ]
})
export default class DevicesModule {}
