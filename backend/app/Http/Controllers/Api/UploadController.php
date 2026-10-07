<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClubSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Handle image / file upload from phone gallery, laptop, or PC with Cloudinary & Local Support.
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

            $url = null;

            // 1. Check Cloudinary Integration (Primary Cloud Storage)
            $cloudName = env('CLOUDINARY_CLOUD_NAME') ?: ClubSetting::get('cloudinary_cloud_name');
            $apiKey = env('CLOUDINARY_API_KEY') ?: ClubSetting::get('cloudinary_api_key');
            $apiSecret = env('CLOUDINARY_API_SECRET') ?: ClubSetting::get('cloudinary_api_secret');
            $uploadPreset = env('CLOUDINARY_UPLOAD_PRESET') ?: ClubSetting::get('cloudinary_upload_preset');

            if (!empty($cloudName)) {
                try {
                    $timestamp = time();
                    $postData = [
                        'folder' => "gomegram_club/{$folder}",
                    ];

                    if (!empty($uploadPreset)) {
                        $postData['upload_preset'] = $uploadPreset;
                    } elseif (!empty($apiKey) && !empty($apiSecret)) {
                        $paramsToSign = "folder=gomegram_club/{$folder}&timestamp={$timestamp}{$apiSecret}";
                        $signature = sha1($paramsToSign);
                        $postData['api_key'] = $apiKey;
                        $postData['timestamp'] = $timestamp;
                        $postData['signature'] = $signature;
                    }

                    $resourceType = str_starts_with($file->getMimeType() ?? '', 'video/') ? 'video' : 'image';
                    $cloudinaryEndpoint = "https://api.cloudinary.com/v1_1/{$cloudName}/{$resourceType}/upload";

                    $response = Http::attach(
                        'file',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )->post($cloudinaryEndpoint, $postData);

                    if ($response->successful()) {
                        $cData = $response->json();
                        if (!empty($cData['secure_url'])) {
                            $url = $cData['secure_url'];
                        }
                    } else {
                        Log::warning('Cloudinary upload returned non-200: ' . $response->body());
                    }
                } catch (\Exception $cEx) {
                    Log::error('Cloudinary upload exception: ' . $cEx->getMessage());
                }
            }

            // 2. Local Storage Fallback if Cloudinary not used or failed
            if (!$url) {
                $path = $file->storeAs($folder, $filename, 'public');

                // Copy directly to public/storage/{folder} if needed for Windows dev server
                $publicDir = public_path("storage/{$folder}");
                if (!file_exists($publicDir)) {
                    @mkdir($publicDir, 0755, true);
                }
                @copy(storage_path("app/public/{$folder}/{$filename}"), public_path("storage/{$folder}/{$filename}"));

                $url = "/storage/{$folder}/{$filename}";
            }

            // 3. Google Drive Backup (if requested or if Google Drive is connected in settings)
            $shouldBackup = filter_var($request->input('backup_to_drive', true), FILTER_VALIDATE_BOOLEAN);
            $hasDriveConfig = \App\Models\Setting::where('key', 'gdrive_refresh_token')->exists();

            if ($shouldBackup || $hasDriveConfig) {
                try {
                    $googlePath = "{$folder}/{$filename}";
                    $stream = fopen($file->getRealPath(), 'r');
                    if ($stream) {
                        Storage::disk('google')->put($googlePath, $stream);
                        if (is_resource($stream)) {
                            fclose($stream);
                        }
                        Log::info("Image backed up to Google Drive: {$googlePath}");
                    }
                } catch (\Exception $driveEx) {
                    Log::error('Google Drive backup error: ' . $driveEx->getMessage());
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
