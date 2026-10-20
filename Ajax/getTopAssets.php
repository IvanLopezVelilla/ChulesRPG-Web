<?php
require_once("models.php");

header('Content-Type: application/json');

$assets=$db->getTopAssets();

echo json_encode([

    "success" => true,
    "assets" => $assets

]);