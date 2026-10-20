<?php

require_once("models.php");

try {

    header('Content-Type: application/json');
    echo json_encode([

        "success"=>true,
        "image"=>$db->getAssetImage($_GET["assets_id"])

    ]);

} catch (Exception $e) {

    echo json_encode([
        
        'success'=>false,
        "image"=>null
    
    ]);
    
}
?>