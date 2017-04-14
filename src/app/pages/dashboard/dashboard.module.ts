import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'ng2-bootstrap';
import { DndModule } from 'ng2-dnd';

import { NgaModule } from '../../theme/nga.module';

import { Dashboard } from './dashboard.component';
import { DashboardOutlet } from './dashboard.outlet.component';
import { routing } from './dashboard.routing';

import { Gauge } from './gauge';
import { Donut } from './donut'
import { Line, LineComponent } from './line'
import { DashboardDataService } from './dashboard.data.service'

import {DashboardCard} from './components'

import { CreateComponent } from './create'
import { CreateItem, GaugeItem, DonutItem, LineItem } from './createItem'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgaModule,
        TooltipModule.forRoot(),
        DndModule.forRoot(),
        routing
    ],
    declarations: [
        Dashboard,
        DashboardCard,
        DashboardDataService,
        DashboardOutlet,
        CreateComponent,
        // creating items for the dashboard
        CreateItem,
        // individual items that can be created
        GaugeItem,
        DonutItem,
        LineItem,
        //LineChartItem
        // custom components from the standard ng2-admin dashaboard
        Gauge,
        Donut,
        Line,
        LineComponent
    ],
    providers: [
    ]
})
export class DashboardModule { }
