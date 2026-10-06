<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Handle image / file upload from phone gallery, laptop, or PC.
     */
    public function upload(Request $request): JsonResponse
    {
        // Check for file key: 'file', 'photo', or 'image'
        $fileKey = null;
        if ($request->hasFile('file')) {
            $fileKey = 'file';
        } elseif ($request->hasFile('photo')) {
            $fileKey = 'photo';
        } elseif ($request->hasFile('image')) {
            $fileKey = 'image';
        }

        if (!$fileKey) {
            return response()->json([
                'success' => false,
                'message' => 'No file was uploaded. Please select an image file.'
            ], 422);
        }

        $request->validate([
            $fileKey => 'required|file|max:51200', // 50MB max
            'folder' => 'nullable|string|alpha_dash',
        ]);

        try {
            $file = $request->file($fileKey);
            $folder = $request->input('folder', 'members');
            
            // Clean extension
            $origExt = strtolower($file->getClientOriginalExtension() ?: '');
            $extension = $origExt ?: 'jpg';
            if ($extension === 'jpeg' || $extension === 'jfif') {
                $extension = 'jpg';
            }
            $filename = time() . '_' . Str::random(10) . '.' . $extension;

            // Store in storage/app/public/{folder}
            $path = $file->storeAs($folder, $filename, 'public');

            // Also copy directly to public/storage/{folder} if needed for Windows dev server
            $publicDir = public_path("storage/{$folder}");
            if (!file_exists($publicDir)) {
                @mkdir($publicDir, 0755, true);
            }
            @copy(storage_path("app/public/{$folder}/{$filename}"), public_path("storage/{$folder}/{$filename}"));

            // Construct relative storage URL
            $url = "/storage/{$folder}/{$filename}";

            // Google Drive Backup
            $shouldBackup = filter_var($request->input('backup_to_drive', false), FILTER_VALIDATE_BOOLEAN);

            if ($shouldBackup) {
                try {
                    $googlePath = "{$folder}/{$filename}";
                    $localSavedPath = storage_path("app/public/{$folder}/{$filename}");
                    
                    if (file_exists($localSavedPath)) {
                        $fileStream = fopen($localSavedPath, 'r');
                        $success = \Illuminate\Support\Facades\Storage::disk('google')->put($googlePath, $fileStream);
                        if (is_resource($fileStream)) {
                            fclose($fileStream);
                        }
                    }
                } catch (\Exception $driveEx) {
                    // Ignore drive backup errors gracefully
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'url' => $url,
                'filename' => $filename,
                'size' => $file->getSize(),
                'original_name' => $file->getClientOriginalName(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}
