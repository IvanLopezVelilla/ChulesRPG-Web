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

if($_SESSION["loggedUser"]["admin"]!=1){

    echo json_encode([
        "success"=>false,
        "code"=>403,
        "message"=>"Admin access required"
    ]);

    exit;
}

if(!isset($_POST["data"])){

    echo json_encode([
        "success"=>false,
        "code"=>400,
        "message"=>"Missing data"
    ]);

    exit;
}

$data=json_decode($_POST["data"], true);

if(!$data){

    echo json_encode([
        "success"=>false,
        "code"=>400,
        "message"=>"Invalid JSON"
    ]);

    exit;
}

$title=trim($data["title"] ?? "");
$textContent=trim($data["textContent"] ?? "");

if($title=="" || $textContent==""){

    echo json_encode([
        "success"=>false,
        "code"=>400,
        "message"=>"Missing required fields"
    ]);

    exit;
}

$result=$db->insertNews($title, $textContent);

if($result){

    echo json_encode([
        "success"=>true
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "code"=>500,
        "message"=>"Could not create news"
    ]);

}