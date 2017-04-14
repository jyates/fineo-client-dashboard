import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TooltipModule } from 'ng2-bootstrap';
import {DndModule} from 'ng2-dnd';

import { NgaModule } from '../../theme/nga.module';

import { Dashboard, DashboardDataService } from './dashboard.component';
import { DashboardOutlet } from './dashboard.outlet.component';
import { routing }       from './dashboard.routing';

import { PopularApp } from './popularApp';

import { PieChart } from './pieChart';
import { Gauge } from './gauge';
import { Donut } from './donut'
import { Line, LineComponent } from './line'

import { TrafficChart } from './trafficChart';
import { UsersMap } from './usersMap';
import { LineChart } from './lineChart';
import { Feed } from './feed';
import { Todo } from './todo';
import { Calendar } from './calendar';

import { CalendarService } from './calendar/calendar.service';
import { FeedService } from './feed/feed.service';
import { LineChartService } from './lineChart/lineChart.service';
import { PieChartService } from './pieChart/pieChart.service';
import { TodoService } from './todo/todo.service';
import { TrafficChartService } from './trafficChart/trafficChart.service';
import { UsersMapService } from './usersMap/usersMap.service';

import {CreateComponent} from './create'
import {CreateItem, GaugeItem, DonutItem, LineItem} from './createItem'

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
    PopularApp,
    PieChart,
    TrafficChart,
    UsersMap,
    LineChart,
    Feed,
    Todo,
    Calendar,
    Dashboard,
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
    Line
  ],
  providers: [
    CalendarService,
    FeedService,
    LineChartService,
    PieChartService,
    TodoService,
    TrafficChartService,
    UsersMapService
  ]
})
export class DashboardModule {}
