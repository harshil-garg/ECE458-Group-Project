import { BrowserModule } from '@angular/platform-browser';
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
import { AuthGuard } from './auth-guard';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccountsComponent } from './accounts/accounts.component';
import { AddIngredientModule } from './ingredients-table/add-ingredient/add-ingredient.module';
import { AddProductLineModule } from './product-line-table/add-product-line/add-product-line.module';
import { AddSkuModule } from './sku-table/add-sku/add-sku.module';
import { UploadComponent } from './upload/upload.component';
import { SearchIngredientComponent } from './ingredients-table/search-ingredient/search-ingredient.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductLineTableComponent } from './product-line-table/product-line-table.component';
import { SkuTableComponent } from './sku-table/sku-table.component';
import { IngredientAutocompleteComponent } from './sku-table/ingredient-autocomplete/ingredient-autocomplete.component';
import { SearchSkuComponent } from './sku-table/search-sku/search-sku.component';
import { ManufacturingComponent } from './manufacturing/manufacturing.component';

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
          { path: 'accounts', component: AccountsComponent },
          { path: 'upload', component: UploadComponent},
          { path: 'manufacturing', component: ManufacturingComponent}
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
    IngredientAutocompleteComponent,
    SearchSkuComponent,
    ManufacturingComponent
  ],
  imports: [
    BrowserModule,
    UploadModule,
    AddIngredientModule,
    AddProductLineModule,
    AddSkuModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    BsDropdownModule.forRoot(),
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
