<?php
require_once("models.php");
header("Content-Type: application/json");

//Check admin
if(!isset($_SESSION["loggedUser"]) || $_SESSION["loggedUser"]["admin"]!=1){

    echo json_encode([
        "success"=>false,
        "message"=>"This account is not an admin"
    ]);

}else{

    if(!isset($_GET["id"])){

        echo json_encode([
            "success"=>false,
            "message"=>"Missing asset id"
        ]);

        exit;

    }

    $assetId=$_GET["id"];

    $result=$db->deleteAsset($assetId);

    if($result){

        echo json_encode([
            "success"=>true
        ]);

    }else{

        echo json_encode([
            "success"=>false,
            "message"=>"Could not delete asset"
        ]);

    }

}

?>