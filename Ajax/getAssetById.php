<?php

require_once("models.php");

$id=$_GET["id"] ?? 0;
$asset=$db->getAssetById($id);

if($asset){

    echo json_encode([

        "success" => true,
        "asset" => $asset

    ]);

}else{

    echo json_encode([

        "success" => false

    ]);

}