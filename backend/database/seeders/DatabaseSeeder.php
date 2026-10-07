<?php

namespace Database\Seeders;

use App\Models\ClubSetting;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\EventExpense;
use App\Models\GalleryItem;
use App\Models\Member;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\Journey;
use App\Models\Slider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Initial Admin Users (Only if not already created)
        User::firstOrCreate(
            ['email' => 'admin@swapnosiri.org'],
            [
                'name' => 'Club Super Admin',
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'emon@gmail.com'],
            [
                'name' => 'Emon Admin',
                'password' => Hash::make('emon123'),
                'role' => 'super_admin',
            ]
        );

        // 2. Seed Default Club Settings (Only if not already set)
        $settings = [
            'club_name' => 'Gomegram Swapnosiri Tarun Sangha',
            'club_bangla_name' => 'গোমেগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ',
            'club_tagline' => 'একতা • সংস্কৃতি • সমাজসেবা',
            'club_tagline_en' => 'Unity, Culture & Community Welfare',
            'established_year' => '2018',
            'registration_no' => 'REG-GS-2018-092',
            'club_phone' => '+880 1712-345678',
            'club_email' => 'contact@swapnosiri.org',
            'club_address' => 'Gomegram, Singair, Manikganj, Dhaka, Bangladesh',
            'club_description' => 'Gomegram Swapnosiri Tarun Sangha is a non-profit youth organization committed to social development, humanitarian relief, sports, vibrant cultural celebrations, and community brotherhood.',
            'facebook_url' => 'https://facebook.com/gomegramswapnosiri',
            'youtube_url' => 'https://youtube.com/@gomegramswapnosiri',
            'hide_public_phone' => '0',
            'hide_public_email' => '0',
            'hide_public_address' => '0',
            'hide_public_financials' => '0',
        ];

        foreach ($settings as $k => $v) {
            if (!ClubSetting::where('key', $k)->exists()) {
                ClubSetting::set($k, $v);
            }
        }
    }
}
