<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Google\Client as GoogleClient;

class GoogleDriveController extends Controller
{
    public function getAuthUrl(Request $request)
    {
        $clientId = $request->input('client_id');
        $clientSecret = $request->input('client_secret');
        
        if (!$clientId || !$clientSecret) {
            return response()->json(['error' => 'Client ID and Secret are required'], 400);
        }

        $client = new GoogleClient();
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('http://localhost:5173/admin/settings');
        $client->addScope('https://www.googleapis.com/auth/drive');
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return response()->json(['url' => $client->createAuthUrl()]);
    }

    public function saveCode(Request $request)
    {
        $code = $request->input('code');
        if (!$code) {
            return response()->json(['error' => 'No code provided'], 400);
        }

        $clientId = Setting::where('key', 'gdrive_client_id')->value('value');
        $clientSecret = Setting::where('key', 'gdrive_client_secret')->value('value');

        if (!$clientId || !$clientSecret) {
            return response()->json(['error' => 'Missing credentials in DB'], 400);
        }

        $client = new GoogleClient();
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('http://localhost:5173/admin/settings');

        try {
            $token = $client->fetchAccessTokenWithAuthCode($code);
            if (isset($token['error'])) {
                return response()->json(['error' => $token['error']], 400);
            }
            if (!isset($token['refresh_token'])) {
                return response()->json(['error' => 'No refresh token received. Make sure you are authorizing for the first time.'], 400);
            }

            Setting::updateOrCreate(['key' => 'gdrive_refresh_token'], ['value' => $token['refresh_token']]);
            
            return response()->json(['message' => 'Google Drive connected successfully!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getConfig()
    {
        return response()->json([
            'client_id' => Setting::where('key', 'gdrive_client_id')->value('value') ?? '',
            'client_secret' => Setting::where('key', 'gdrive_client_secret')->value('value') ?? '',
            'folder_id' => Setting::where('key', 'gdrive_folder_id')->value('value') ?? '',
        ]);
    }

    public function saveConfig(Request $request)
    {
        $request->validate([
            'client_id' => 'required|string',
            'client_secret' => 'required|string',
            'folder_id' => 'required|string',
        ]);

        Setting::updateOrCreate(['key' => 'gdrive_client_id'], ['value' => $request->client_id]);
        Setting::updateOrCreate(['key' => 'gdrive_client_secret'], ['value' => $request->client_secret]);
        Setting::updateOrCreate(['key' => 'gdrive_folder_id'], ['value' => $request->folder_id]);

        return response()->json(['message' => 'Google Drive configuration saved.']);
    }
}
