# Deployment Guide

# Development Guide
## Technologies/Frameworks
Our app was built using the MEAN stack, meaning MongoDB for storage, Express for handling http requests, Angular for front end design, and Node for backend design.

## Configure
To set up a development environment, run ```npm start``` in the main directory and navigate to ```https://localhost:3000``` in your browser of choice.

## API
Our API consists of 7 main routes: users, upload, export, skus, ingredients, product_lines, and manufacturing_goals.

### SKUS
#### Filter SKUs
* Allows the user to filter SKUs by keyword and with assisted selection on ingredients and product lines
**URL**: ```POST /api/skus/filter```

**Parameters**:

| Parameter | Description | Type |    
| ----------- | ----------- |---------    
| sortBy      | **Required**. The field to sort by. | String |    
| pageNum | **Required**. The page of the results you want to view. | integer |    
| keywords | **Required**. List of keywords to filter by. | List |      
| ingredients | **Required**. List of ingredients to filter by. | List |      
| product_lines | **Required**. List of product lines to filter by. | List |    
