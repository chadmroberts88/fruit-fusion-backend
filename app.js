const express = require('express');
const app = express();
const mysql = require('mysql2');

const port = process.env.PORT || 3000;

app.listen(port);
console.log(`Server is listening on port ${port}.`);

