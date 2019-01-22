import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IngredientsTableComponent } from './ingredients-table/ingredients-table.component';
import { TableEditableComponent } from './table-editable/table-editable.component';
import { UiParentComponent } from './ui-parent/ui-parent.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    IngredientsTableComponent,
    TableEditableComponent,
    UiParentComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
