Transaction Management API

Description

This document details the API for a transaction management system built using Express and MongoDB. It offers functionalities to manage transactions, retrieve statistics, and generate charts based on transaction data.

Prerequisites

Node.js (latest stable version recommended)
MongoDB (with a running instance)
Axios (for making HTTP requests)
Setup

Clone the Repository:

Bash
git clone https://your-repository-url.git
Use code with caution.
content_copy
Install Dependencies:
Navigate to the project directory and run:

Bash
npm install
Use code with caution.
content_copy
Create .env File:
In the project root directory, create a file named .env (make sure it's not included in version control). Add the following environment variables, replacing placeholders with your actual values:

PORT=3001  # The port on which the API will run (default: 3001)
MONGODB_URI=mongodb://your_mongo_host:port/your_database_name  # Connection string for your MongoDB database
Endpoints

1. Seed Database

URL: /seed-database
Method: GET
Description: Seeds the database with transaction data from a third-party API (implementation details omitted for security reasons).
Response:
200 OK: Database seeded successfully.
500 Internal Server Error: Failed to seed database.
2. List All Transactions

URL: /transactions
Method: GET
Query Parameters:
page (optional, default: 1): Page number for pagination.
perPage (optional, default: 10): Number of transactions per page.
search (optional): Search term to filter transactions by title, description, or price.
Description: Lists all transactions with optional search and pagination.
Response:
200 OK: Returns a list of transactions and the total count.
500 Internal Server Error: Failed to fetch transactions.
3. Get Statistics

URL: /statistics
Method: GET
Query Parameters:
month (required): The month for which to retrieve statistics (format: YYYY-MM).
Description: Retrieves statistics for the total sale amount, total sold items, and total unsold items for the selected month.
Response:
200 OK: Returns the statistics for the selected month.
400 Bad Request: Month parameter is required.
500 Internal Server Error: Failed to fetch statistics.
4. Get Bar Chart Data

URL: /bar-chart
Method: GET
Query Parameters:
month (required): The month for which to generate the bar chart (format: YYYY-MM).
Description: Retrieves data for a bar chart showing price ranges and item counts for the selected month. Requires a charting library on the frontend to visualize the data (e.g., Chart.js).
Response:
200 OK: Returns the bar chart data for the selected month.
400 Bad Request: Month parameter is required.
500 Internal Server Error: Failed to generate bar chart.
5. Get Pie Chart Data

URL: /pie-chart
Method: GET
Query Parameters:
month (required): The month for which to generate the pie chart (format: YYYY-MM).
Description: Retrieves data for a pie chart showing unique categories and item counts for the selected month. Requires a charting library on the frontend to visualize the data (e.g., Chart.js).
Response:
200 OK: Returns the pie chart data for the selected month.
400 Bad Request: Month parameter is required.
500 Internal Server Error: Failed to generate pie chart.
6. Get Combined Data

URL: /combined-data
Method: GET
Query Parameters:
month (required): The month for which to fetch combined data (format: YYYY-MM).
Description: Retrieves