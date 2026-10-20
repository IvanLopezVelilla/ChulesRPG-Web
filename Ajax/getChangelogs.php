<?php

require_once("models.php");
header("Content-Type: application/json");

$data=$db->getChangelogs();

if($data===false){

    echo json_encode([
        "success"=>false,
        "code"=>500,
        "message"=>"Could not load changelogs"
    ]);

}else{

    echo json_encode([
        "success"=>true,
        "data"=>$data
    ]);

}

