<?php
// Set the response content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Create a response array
$response = [
    [
        "_id" => 1,
        "todo" => "Todo 1"
    ],
    [
        "_id" => 2,
        "todo" => "Todo 2"
    ],
    [
        "_id" => 3,
        "todo" => "Todo 3"
    ],
    [
        "_id" => 4,
        "todo" => "Todo 4"
    ]
];

// Encode the response array as JSON
$jsonResponse = json_encode($response);

// Output the JSON response
echo $jsonResponse;