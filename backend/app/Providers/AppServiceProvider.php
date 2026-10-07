<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            \Illuminate\Support\Facades\Storage::extend('google', function($app, $config) {
                $clientId = \App\Models\Setting::where('key', 'gdrive_client_id')->value('value');
                $clientSecret = \App\Models\Setting::where('key', 'gdrive_client_secret')->value('value');
                $refreshToken = \App\Models\Setting::where('key', 'gdrive_refresh_token')->value('value');

                $client = new \Google\Client();
                if ($clientId && $clientSecret && $refreshToken) {
                    $client->setClientId($clientId);
                    $client->setClientSecret($clientSecret);
                    $client->refreshToken($refreshToken);
                } else {
                    // Fallback to service account if somehow OAuth is not configured
                    $client->setAuthConfig(storage_path('app/private/google-credentials.json'));
                }
                $client->addScope(\Google\Service\Drive::DRIVE);
                
                $service = new \Google\Service\Drive($client);
                
                // Get folder ID dynamically from Settings
                $folderId = \App\Models\Setting::where('key', 'gdrive_folder_id')->value('value');
                $options = [];
                if (!empty($folderId)) {
                    $folderId = trim($folderId);
                    // Extract ID if full Google Drive URL was entered
                    if (preg_match('/folders\/([a-zA-Z0-9_-]+)/', $folderId, $matches)) {
                        $folderId = $matches[1];
                    }
                    if ($folderId !== '/' && !empty($folderId)) {
                        $options['sharedFolderId'] = $folderId;
                    }
                }
                
                $adapter = new \Masbug\Flysystem\GoogleDriveAdapter($service, null, $options);
                $driver = new \League\Flysystem\Filesystem($adapter);

                return new \Illuminate\Filesystem\FilesystemAdapter($driver, $adapter, $config);
            });
        } catch(\Exception $e) {
            // Ignore exception during early boot when DB might not be ready
        }
    }
}
