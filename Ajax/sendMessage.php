<?php

require_once("models.php");
header("Content-Type: application/json");

if(!isset($_SESSION["loggedUser"])){

    echo json_encode([

        "success"=>false,
        "code"=>401,
        "message"=>"You must be logged in"

    ]);

    exit;

}

if(!isset($_POST["message"])){

    echo json_encode([

        "success"=>false,
        "code"=>400,
        "message"=>"Message is required"

    ]);

    exit;

}

$message=trim($_POST["message"]);

if($message==""){

    echo json_encode([

        "success"=>false,
        "code"=>400,
        "message"=>"Message cannot be empty"

    ]);

    exit;

}

if(strlen($message)>500){

    echo json_encode([

        "success"=>false,
        "code"=>400,
        "message"=>"Message is too long"

    ]);

    exit;

}

$userId=$_SESSION["loggedUser"]["users_id"];

$result=$db->insertMessage($message, $userId);

if($result){

    echo json_encode([

        "success"=>true

    ]);

}else{

    echo json_encode([

        "success"=>false,
        "code"=>500,
        "message"=>"Could not save message, please try again"

    ]);

}