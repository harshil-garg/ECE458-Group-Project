import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { IngredientsTableComponent } from './ingredients-table/ingredients-table.component';
import { TableEditableComponent } from './table-editable/table-editable.component';
import { UploadModule } from './upload/upload.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    IngredientsTableComponent,
    TableEditableComponent,
  ],
  imports: [
    BrowserModule,
    UploadModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
