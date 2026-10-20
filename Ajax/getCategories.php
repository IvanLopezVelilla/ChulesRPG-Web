<?php

require_once("models.php");

try {

    header('Content-Type: application/json');
    echo json_encode($db->getCategories());
} catch (Exception $e) {

    echo json_encode(['error' => $e->getMessage()]);
    
}
?>