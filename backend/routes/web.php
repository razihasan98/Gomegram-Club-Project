<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Direct storage file serving fallback for local dev & Windows
Route::get('/storage/{folder}/{filename}', function ($folder, $filename) {
    $paths = [
        public_path("storage/{$folder}/{$filename}"),
        storage_path("app/public/{$folder}/{$filename}"),
        storage_path("app/private/public/{$folder}/{$filename}"),
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            return response()->file($path);
        }
    }

    abort(404);
})->where('filename', '.*');
