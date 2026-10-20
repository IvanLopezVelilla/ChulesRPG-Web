<?php

require_once("models.php");

try {

    header('Content-Type: application/json');
    echo json_encode([

        "success"=>true,
        "user"=> $db->getUser($_GET["users_id"])

    ]);

} catch (Exception $e) {

    echo json_encode([
        
        'success'=>false,
        "user"=>null
    
    ]);
    
}
?>