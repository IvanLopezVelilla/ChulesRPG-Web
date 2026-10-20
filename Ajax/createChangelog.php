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

$name=trim($data["name"] ?? "");
$type=$data["type"] ?? "";
$build=trim($data["build"] ?? "");
$changes=$data["changes"] ?? [];

if($name=="" || $build=="" || $type==""){

    echo json_encode([
        "success"=>false,
        "code"=>400,
        "message"=>"Missing required fields"
    ]);
    exit;
}

if(count($changes)==0){

    echo json_encode([
        "success"=>false,
        "code"=>400,
        "message"=>"At least one change is required"
    ]);
    exit;
}

$userId=$_SESSION["loggedUser"]["users_id"];

$result=$db->insertChangelog($name, $type, $build, $changes, $userId);

if($result){

    echo json_encode([
        "success"=>true
    ]);

}else{

    echo json_encode([
        "success"=>false,
        "code"=>500,
        "message"=>"Could not create changelog"
    ]);
}