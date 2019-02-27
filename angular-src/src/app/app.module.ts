import { BrowserModule, Title  } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IngredientsTableComponent } from './ingredients-table/ingredients-table.component';
import { TableEditableComponent } from './table-editable/table-editable.component';
import { UploadModule } from './upload/upload.module';
import { RouterModule, Routes } from '@angular/router';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth-guard';;
import { AccountsComponent } from './accounts/accounts.component';
import { AddIngredientModule } from './ingredients-table/add-ingredient/add-ingredient.module';
import { AddProductLineModule } from './product-line-table/add-product-line/add-product-line.module';
import { AddManufacturingGoalModule } from './manufacturing-goal-table/add-manufacturing-goal/add-manufacturing-goal.module';
import { CalculatorModule } from './manufacturing-goal-table/calculator/calculator.module';
import { AddSkuModule } from './sku-table/add-sku/add-sku.module';
import { UploadComponent } from './upload/upload.component';
import { SearchIngredientComponent } from './ingredients-table/search-ingredient/search-ingredient.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductLineTableComponent } from './product-line-table/product-line-table.component';
import { SkuTableComponent } from './sku-table/sku-table.component';
import { IngredientAutocompleteComponent } from './sku-table/ingredient-autocomplete/ingredient-autocomplete.component';
import { IngredientAutocompleteModule } from './sku-table/ingredient-autocomplete/ingredient-autocomplete.module';
import { SearchSkuComponent } from './sku-table/search-sku/search-sku.component';
import { ManufacturingGoalTableComponent } from './manufacturing-goal-table/manufacturing-goal-table.component';
import { MatAutocompleteModule, MatFormFieldModule, MatTabsModule, MatInputModule, MatButtonModule, MatRippleModule, MatDialogModule, MatListModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatMenuModule, MatToolbarModule, MatSnackBarModule, MatTableModule, MatCheckboxModule, MatPaginatorModule, MatSortModule, MatChipsModule, MatSelectModule, MatExpansionModule, MatGridListModule, MatSidenavModule, MatDatepickerModule, MatButtonToggleModule, MatSlideToggleModule, MatBadgeModule, MatTooltipModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CreateDependencyReportComponent } from './ingredients-table/create-dependency-report/create-dependency-report.component';
import { DependencyReportDialogComponent } from './ingredients-table/create-dependency-report/dependency-report-dialog/dependency-report-dialog.component';
import { FormulaTableComponent } from './formula-table/formula-table.component';
import { ManufacturingLineTableComponent } from './manufacturing-line-table/manufacturing-line-table.component';
import { AddManufacturingLineComponent } from './manufacturing-line-table/add-manufacturing-line/add-manufacturing-line.component';
import { AddManufacturingLineDialogComponent } from './manufacturing-line-table/add-manufacturing-line/add-manufacturing-line-dialog/add-manufacturing-line-dialog.component';
import { AddManufacturingLineModule } from './manufacturing-line-table/add-manufacturing-line/add-manufacturing-line.module';
import { ManufacturingScheduleComponent } from './manufacturing-schedule/manufacturing-schedule.component';
import { ManufacturingScheduleDisplayComponent } from './manufacturing-schedule/manufacturing-schedule-display/manufacturing-schedule-display.component';
import { SearchGoalsComponent } from './manufacturing-schedule/search-goals/search-goals.component';
import { BulkSkuEditComponent } from './sku-table/bulk-sku-edit/bulk-sku-edit.component';
import { BulkSkuEditDialogComponent } from './sku-table/bulk-sku-edit/bulk-sku-edit-dialog/bulk-sku-edit-dialog.component';
import { ActivityDialogComponent } from './manufacturing-schedule/activity-dialog/activity-dialog.component';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
        	{ path: '', component: DashboardComponent },
        	{ path: 'ingredients', component: IngredientsTableComponent },
          { path: 'product-lines', component: ProductLineTableComponent },
          { path: 'skus', component: SkuTableComponent },
          { path: 'formulas', component: FormulaTableComponent },
          { path: 'accounts', component: AccountsComponent },
          { path: 'upload', component: UploadComponent },
          { path: 'manufacturing-goals', component: ManufacturingGoalTableComponent },
          { path: 'manufacturing-lines', component: ManufacturingLineTableComponent },
          { path: 'manufacturing-schedule', component: ManufacturingScheduleDisplayComponent },
    ]
  },
  {path: 'login', component: LoginComponent },
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    IngredientsTableComponent,
    TableEditableComponent,
    PagenotfoundComponent,
    DashboardComponent,
    AccountsComponent,
    SearchIngredientComponent,
    ProductLineTableComponent,
    SkuTableComponent,
    SearchSkuComponent,
    ManufacturingGoalTableComponent,
    CreateDependencyReportComponent,
    DependencyReportDialogComponent,
    FormulaTableComponent,
    ManufacturingLineTableComponent,
    ManufacturingScheduleComponent,
    ManufacturingScheduleDisplayComponent,
    SearchGoalsComponent,
    BulkSkuEditComponent,
    BulkSkuEditDialogComponent,
    ActivityDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    UploadModule,
    AddIngredientModule,
    AddProductLineModule,
    AddManufacturingGoalModule,
    AddManufacturingLineModule,
    CalculatorModule,
    AddSkuModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IngredientAutocompleteModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRippleModule,
    MatDialogModule,
    MatListModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatSelectModule,
    MatExpansionModule,
    MatGridListModule,
    DragDropModule,
    MatSidenavModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  providers: [Title],
  bootstrap: [AppComponent],
  entryComponents: [DependencyReportDialogComponent, ActivityDialogComponent, BulkSkuEditDialogComponent]
})
export class AppModule { }
