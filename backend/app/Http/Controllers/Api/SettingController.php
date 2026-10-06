<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClubSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Public Club Identity & Settings
     */
    public function publicSettings(): JsonResponse
    {
        $settings = [
            'club_name' => ClubSetting::get('club_name', 'Gomegram Swapnosiri Tarun Sangha'),
            'club_bangla_name' => ClubSetting::get('club_bangla_name', 'গোমেগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ'),
            'club_tagline' => ClubSetting::get('club_tagline', 'একতা • সংস্কৃতি • সমাজসেবা'),
            'club_tagline_en' => ClubSetting::get('club_tagline_en', 'Unity, Culture & Community Welfare'),
            'established_year' => ClubSetting::get('established_year', '2018'),
            'registration_no' => ClubSetting::get('registration_no', 'REG-GS-2018-092'),
            'club_phone' => ClubSetting::get('club_phone', '+880 1712-345678'),
            'club_email' => ClubSetting::get('club_email', 'info@swapnosiri.org'),
            'club_address' => ClubSetting::get('club_address', 'Gomegram, Upazila: Singair, Dist: Manikganj, Dhaka, Bangladesh'),
            'club_description' => ClubSetting::get('club_description', 'Gomegram Swapnosiri Tarun Sangha is a leading socio-cultural youth organization dedicated to community empowerment, cultural preservation, blood donation camps, education support, and festive celebrations.'),
            'facebook_url' => ClubSetting::get('facebook_url', 'https://facebook.com/gomegramswapnosiri'),
            'youtube_url' => ClubSetting::get('youtube_url', 'https://youtube.com'),
            'hide_public_phone' => ClubSetting::get('hide_public_phone', '0') === '1',
            'hide_public_email' => ClubSetting::get('hide_public_email', '0') === '1',
            'hide_public_address' => ClubSetting::get('hide_public_address', '0') === '1',
            'hide_public_financials' => ClubSetting::get('hide_public_financials', '0') === '1',
            'slider_interval' => (int) ClubSetting::get('slider_interval', 5), // default 5 seconds
        ];

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Admin Settings List
     */
    public function adminSettings(): JsonResponse
    {
        $all = ClubSetting::all()->pluck('value', 'key');
        return response()->json([
            'settings' => $all,
        ]);
    }

    /**
     * Update Settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            ClubSetting::set($key, $value);
        }

        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }
}
