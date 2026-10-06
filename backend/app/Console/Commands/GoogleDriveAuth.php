<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Setting;

class GoogleDriveAuth extends Command
{
    protected $signature = 'gdrive:auth';
    protected $description = 'Authenticate Google Drive and save refresh token';

    public function handle()
    {
        $clientId = env('GOOGLE_DRIVE_CLIENT_ID');
        $clientSecret = env('GOOGLE_DRIVE_CLIENT_SECRET');

        Setting::updateOrCreate(['key' => 'gdrive_client_id'], ['value' => $clientId]);
        Setting::updateOrCreate(['key' => 'gdrive_client_secret'], ['value' => $clientSecret]);

        $client = new \Google\Client();
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('http://localhost');
        $client->addScope('https://www.googleapis.com/auth/drive');
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $authUrl = $client->createAuthUrl();

        $this->info("দয়া করে নিচের লিংকটি কপি করে আপনার ব্রাউজারে ওপেন করুন:");
        $this->line($authUrl);
        $this->line("");
        
        $authCode = $this->ask("ব্রাউজারে পারমিশন দেওয়ার পর যে কোডটি পাবেন, সেটি এখানে পেস্ট করুন");

        try {
            $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
            if (array_key_exists('error', $accessToken)) {
                $this->error("Error: " . implode(', ', $accessToken));
                return;
            }

            if (isset($accessToken['refresh_token'])) {
                Setting::updateOrCreate(['key' => 'gdrive_refresh_token'], ['value' => $accessToken['refresh_token']]);
                $this->info("Refresh Token সফলভাবে সেভ হয়েছে! গুগল ড্রাইভ কানেক্টেড!");
            } else {
                $this->error("Refresh Token পাওয়া যায়নি। অনুগ্রহ করে গুগল অ্যাকাউন্টের অ্যাক্সেস রিমুভ করে আবার চেষ্টা করুন।");
            }
        } catch (\Exception $e) {
            $this->error("Exception: " . $e->getMessage());
        }
    }
}
