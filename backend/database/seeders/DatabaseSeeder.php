<?php

namespace Database\Seeders;

use App\Models\ClubSetting;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\GalleryItem;
use App\Models\Member;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        User::updateOrCreate(
            ['email' => 'admin@swapnosiri.org'],
            [
                'name' => 'Club Super Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // 2. Seed Club Settings
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
            'club_description' => 'Gomegram Swapnosiri Tarun Sangha is a non-profit youth organization committed to social development, humanitarian relief, sports, vibrant cultural celebrations, and community brotherhood in Gomegram and surrounding areas.',
            'facebook_url' => 'https://facebook.com/gomegramswapnosiri',
            'youtube_url' => 'https://youtube.com/@gomegramswapnosiri',
            'hide_public_phone' => '0',
            'hide_public_email' => '0',
            'hide_public_address' => '0',
            'hide_public_financials' => '0',
        ];

        foreach ($settings as $k => $v) {
            ClubSetting::set($k, $v);
        }

        // 3. Seed Events
        $event1 = Event::create([
            'title' => 'Annual Puja & Bijoya Sammilani 2026',
            'slug' => 'annual-puja-bijoya-sammilani-2026',
            'description' => 'The grand annual celebration of Sharodiya Durga Puja and Bijoya Sammilani featuring traditional cultural performances, community feast (Prasad/Bhoj), and honorary awards ceremony.',
            'banner_image' => 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
            'event_date' => '2026-10-18',
            'start_time' => '10:00 AM',
            'location' => 'Gomegram Mandir Premises & Community Center',
            'event_fee' => 2000,
            'registration_deadline' => '2026-10-10',
            'status' => 'upcoming',
            'is_published' => true,
        ]);

        $event2 = Event::create([
            'title' => 'Swapnosiri Annual Picnic & Cultural Gala 2026',
            'slug' => 'annual-picnic-cultural-gala-2026',
            'description' => 'An exhilarating day-long retreat for club members and their families featuring outdoor games, grand buffet lunch, raffle draw, musical night, and awards.',
            'banner_image' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
            'event_date' => '2026-03-25',
            'start_time' => '07:30 AM',
            'location' => 'Padma Eco Resort & Convention Park, Munshiganj',
            'event_fee' => 1500,
            'registration_deadline' => '2026-03-15',
            'status' => 'ongoing',
            'is_published' => true,
        ]);

        $event3 = Event::create([
            'title' => 'Swapnosiri Youth Football Premier League',
            'slug' => 'youth-football-premier-league-2026',
            'description' => 'Annual inter-village football tournament aimed at promoting youth fitness, sportsmanship, and talent development across local communities.',
            'banner_image' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
            'event_date' => '2026-01-12',
            'start_time' => '03:00 PM',
            'location' => 'Gomegram High School Playground',
            'event_fee' => 800,
            'registration_deadline' => '2026-01-05',
            'status' => 'completed',
            'is_published' => true,
        ]);

        // 4. Seed Members (22 Diverse Bengali Members with Leadership and General Roles)
        $memberData = [
            [
                'member_id' => '1',
                'name' => 'Rahim Ahmed',
                'bangla_name' => 'রহিম আহমেদ',
                'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1711-123456',
                'email' => 'rahim.ahmed@swapnosiri.org',
                'address' => 'Gomegram West Para, Singair',
                'date_of_birth' => '1988-04-12',
                'joining_date' => '2018-01-01',
                'membership_type' => 'Executive',
                'position' => 'President',
                'status' => 'Active',
            ],
            [
                'member_id' => '2',
                'name' => 'Bikash Chandra Roy',
                'bangla_name' => 'বিকাশ চন্দ্র রায়',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1712-234567',
                'email' => 'bikash.roy@swapnosiri.org',
                'address' => 'Gomegram Mandir Road, Singair',
                'date_of_birth' => '1990-08-20',
                'joining_date' => '2018-01-01',
                'membership_type' => 'Executive',
                'position' => 'Vice President',
                'status' => 'Active',
            ],
            [
                'member_id' => '3',
                'name' => 'Tanvir Hasan',
                'bangla_name' => 'তানভীর হাসান',
                'photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1713-345678',
                'email' => 'tanvir.hasan@swapnosiri.org',
                'address' => 'Gomegram Bazar Road, Singair',
                'date_of_birth' => '1992-11-15',
                'joining_date' => '2018-02-10',
                'membership_type' => 'Executive',
                'position' => 'General Secretary',
                'status' => 'Active',
            ],
            [
                'member_id' => '4',
                'name' => 'Sourav Das',
                'bangla_name' => 'সৌরভ দাস',
                'photo' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1714-456789',
                'email' => 'sourav.das@swapnosiri.org',
                'address' => 'Gomegram School Para, Singair',
                'date_of_birth' => '1993-02-28',
                'joining_date' => '2018-02-15',
                'membership_type' => 'Executive',
                'position' => 'Joint Secretary',
                'status' => 'Active',
            ],
            [
                'member_id' => '5',
                'name' => 'Amitav Sarkar',
                'bangla_name' => 'অমিতাভ সরকার',
                'photo' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1715-567890',
                'email' => 'amitav.sarkar@swapnosiri.org',
                'address' => 'Gomegram East Para, Singair',
                'date_of_birth' => '1991-07-04',
                'joining_date' => '2018-03-01',
                'membership_type' => 'Executive',
                'position' => 'Treasurer',
                'status' => 'Active',
            ],
            [
                'member_id' => '6',
                'name' => 'Mahfuzur Rahman',
                'bangla_name' => 'মাহফুজুর রহমান',
                'photo' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1716-678901',
                'email' => 'mahfuz.rahman@swapnosiri.org',
                'address' => 'Gomegram North Para, Singair',
                'date_of_birth' => '1994-09-18',
                'joining_date' => '2019-01-10',
                'membership_type' => 'Executive',
                'position' => 'Event Coordinator',
                'status' => 'Active',
            ],
            [
                'member_id' => '7',
                'name' => 'Subhashish Ghosh',
                'bangla_name' => 'সুভাশীষ ঘোষ',
                'photo' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1717-789012',
                'email' => 'subhashish.ghosh@swapnosiri.org',
                'address' => 'Gomegram Middle Para, Singair',
                'date_of_birth' => '1995-03-22',
                'joining_date' => '2019-04-05',
                'membership_type' => 'Executive',
                'position' => 'Cultural Secretary',
                'status' => 'Active',
            ],
            [
                'member_id' => '8',
                'name' => 'Ripon Mollah',
                'bangla_name' => 'রিপন মোল্লা',
                'photo' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1718-890123',
                'email' => 'ripon.mollah@swapnosiri.org',
                'address' => 'Gomegram South Para, Singair',
                'date_of_birth' => '1996-06-11',
                'joining_date' => '2019-06-12',
                'membership_type' => 'Executive',
                'position' => 'Sports Secretary',
                'status' => 'Active',
            ],
            [
                'member_id' => '9',
                'name' => 'Anik Sen',
                'bangla_name' => 'অনিক সেন',
                'photo' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1719-901234',
                'email' => 'anik.sen@gmail.com',
                'address' => 'Gomegram Hospital Road, Singair',
                'date_of_birth' => '1997-12-05',
                'joining_date' => '2020-01-15',
                'membership_type' => 'General',
                'position' => 'Executive Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '10',
                'name' => 'Sajidul Islam',
                'bangla_name' => 'সাজিদুল ইসলাম',
                'photo' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1811-123456',
                'email' => 'sajid.islam@gmail.com',
                'address' => 'Gomegram College Road, Singair',
                'date_of_birth' => '2001-05-14',
                'joining_date' => '2021-02-01',
                'membership_type' => 'Youth',
                'position' => 'Youth Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '11',
                'name' => 'Prasenjit Halder',
                'bangla_name' => 'প্রসেনজিৎ হালদার',
                'photo' => 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1812-234567',
                'email' => 'prasenjit.h@gmail.com',
                'address' => 'Gomegram Ghat Road, Singair',
                'date_of_birth' => '1995-10-30',
                'joining_date' => '2020-03-10',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '12',
                'name' => 'Farhan Chowdhury',
                'bangla_name' => 'ফারহান চৌধুরী',
                'photo' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1813-345678',
                'email' => 'farhan.chowdhury@gmail.com',
                'address' => 'Gomegram Central Road, Singair',
                'date_of_birth' => '2002-08-19',
                'joining_date' => '2022-01-20',
                'membership_type' => 'Youth',
                'position' => 'Youth Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '13',
                'name' => 'Joyanto Paul',
                'bangla_name' => 'জয়ন্ত পাল',
                'photo' => 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1814-456789',
                'email' => 'joyanto.paul@gmail.com',
                'address' => 'Gomegram Paul Para, Singair',
                'date_of_birth' => '1998-01-25',
                'joining_date' => '2021-05-15',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '14',
                'name' => 'Mostofa Kamal',
                'bangla_name' => 'মোস্তফা কামাল',
                'photo' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1815-567890',
                'email' => 'mostofa.kamal@gmail.com',
                'address' => 'Gomegram Post Office Road, Singair',
                'date_of_birth' => '1994-07-16',
                'joining_date' => '2020-07-01',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '15',
                'name' => 'Sujoy Debnath',
                'bangla_name' => 'সুজয় দেবনাথ',
                'photo' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1816-678901',
                'email' => 'sujoy.debnath@gmail.com',
                'address' => 'Gomegram High School Para, Singair',
                'date_of_birth' => '1999-04-03',
                'joining_date' => '2021-08-20',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '16',
                'name' => 'Ashikur Rahman',
                'bangla_name' => 'আশিকুর রহমান',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1817-789012',
                'email' => 'ashikur.r@gmail.com',
                'address' => 'Gomegram Dighir Par, Singair',
                'date_of_birth' => '2000-11-28',
                'joining_date' => '2022-03-10',
                'membership_type' => 'Youth',
                'position' => 'Youth Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '17',
                'name' => 'Debabrata Bhowmick',
                'bangla_name' => 'দেবব্রত ভৌমিক',
                'photo' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1818-890123',
                'email' => 'debabrata.b@gmail.com',
                'address' => 'Gomegram Old Road, Singair',
                'date_of_birth' => '1985-02-14',
                'joining_date' => '2018-01-01',
                'membership_type' => 'Lifetime',
                'position' => 'Senior Advisor',
                'status' => 'Active',
            ],
            [
                'member_id' => '18',
                'name' => 'Naimur Reza',
                'bangla_name' => 'নাঈমুর রেজা',
                'photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1819-901234',
                'email' => 'naimur.reza@gmail.com',
                'address' => 'Gomegram Bridge Para, Singair',
                'date_of_birth' => '1997-09-09',
                'joining_date' => '2021-10-05',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '19',
                'name' => 'Dipak Kumar Shil',
                'bangla_name' => 'দীপক কুমার শীল',
                'photo' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1911-123456',
                'email' => 'dipak.shil@gmail.com',
                'address' => 'Gomegram Shil Para, Singair',
                'date_of_birth' => '1996-03-17',
                'joining_date' => '2022-04-12',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '20',
                'name' => 'Shakil Hossain',
                'bangla_name' => 'শাকিল হোসেন',
                'photo' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1912-234567',
                'email' => 'shakil.hossain@gmail.com',
                'address' => 'Gomegram Uttar Para, Singair',
                'date_of_birth' => '2003-06-21',
                'joining_date' => '2023-01-15',
                'membership_type' => 'Youth',
                'position' => 'Youth Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '21',
                'name' => 'Mithun Chakraborty',
                'bangla_name' => 'মিঠুন চক্রবর্তী',
                'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1913-345678',
                'email' => 'mithun.c@gmail.com',
                'address' => 'Gomegram Purbapara, Singair',
                'date_of_birth' => '1995-12-12',
                'joining_date' => '2022-09-01',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Active',
            ],
            [
                'member_id' => '22',
                'name' => 'Kazi Nazmul',
                'bangla_name' => 'কাজী নাজমুল',
                'photo' => 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80',
                'phone' => '+880 1914-456789',
                'email' => 'kazi.nazmul@gmail.com',
                'address' => 'Gomegram Pashchimpara, Singair',
                'date_of_birth' => '1998-05-08',
                'joining_date' => '2023-06-10',
                'membership_type' => 'General',
                'position' => 'General Member',
                'status' => 'Inactive',
            ],
        ];

        $createdMembers = [];
        foreach ($memberData as $data) {
            $createdMembers[] = Member::create($data);
        }

        // 5. Assign Event Fees & Payment Transactions (Rich mix of Paid, Partial with multi-installments, and Unpaid)
        // Event 1: Puja 2026 (Fee: 2000)
        // Event 2: Picnic 2026 (Fee: 1500)
        // Event 3: Football 2026 (Fee: 800)

        // Member 0: Rahim Ahmed (ID: 1) - Fully Paid for all events + Multi-installments demo
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[0]->id, 'event_fee' => 2000, 'previous_due_at_time' => 300]);
        PaymentTransaction::create(['member_id' => $createdMembers[0]->id, 'event_id' => $event1->id, 'amount' => 1000, 'payment_date' => '2026-02-10', 'payment_method' => 'bKash', 'transaction_reference' => 'BK-99214', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Installment 1 via bKash']);
        PaymentTransaction::create(['member_id' => $createdMembers[0]->id, 'event_id' => $event1->id, 'amount' => 1000, 'payment_date' => '2026-02-25', 'payment_method' => 'Cash', 'transaction_reference' => 'CSH-019', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Final installment paid in cash']);

        // Member 1: Bikash Chandra Roy (ID: 2) - Partial Paid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[1]->id, 'event_fee' => 2000, 'previous_due_at_time' => 500]);
        PaymentTransaction::create(['member_id' => $createdMembers[1]->id, 'event_id' => $event1->id, 'amount' => 1200, 'payment_date' => '2026-02-14', 'payment_method' => 'Nagad', 'transaction_reference' => 'NG-88341', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Partial advance for Puja']);

        // Member 2: Tanvir Hasan (ID: 3) - Fully Paid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[2]->id, 'event_fee' => 2000, 'previous_due_at_time' => 0]);
        PaymentTransaction::create(['member_id' => $createdMembers[2]->id, 'event_id' => $event1->id, 'amount' => 2000, 'payment_date' => '2026-02-15', 'payment_method' => 'Bank', 'transaction_reference' => 'TXN-DBBL-7712', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Full one-time payment']);

        // Member 3: Sourav Das (ID: 4) - Partial Paid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[3]->id, 'event_fee' => 2000, 'previous_due_at_time' => 200]);
        PaymentTransaction::create(['member_id' => $createdMembers[3]->id, 'event_id' => $event1->id, 'amount' => 1000, 'payment_date' => '2026-02-20', 'payment_method' => 'bKash', 'transaction_reference' => 'BK-10293', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'First installment']);

        // Member 4: Amitav Sarkar (ID: 5) - Fully Paid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[4]->id, 'event_fee' => 2000, 'previous_due_at_time' => 0]);
        PaymentTransaction::create(['member_id' => $createdMembers[4]->id, 'event_id' => $event1->id, 'amount' => 2000, 'payment_date' => '2026-02-01', 'payment_method' => 'Cash', 'transaction_reference' => 'CSH-001', 'received_by' => 'Tanvir Hasan (Secretary)', 'note' => 'Self contribution recorded']);

        // Member 5: Mahfuzur Rahman (ID: 6) - Fully Paid in 2 installments
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[5]->id, 'event_fee' => 2000, 'previous_due_at_time' => 0]);
        PaymentTransaction::create(['member_id' => $createdMembers[5]->id, 'event_id' => $event1->id, 'amount' => 1000, 'payment_date' => '2026-02-05', 'payment_method' => 'Rocket', 'transaction_reference' => 'RK-5512', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Installment 1']);
        PaymentTransaction::create(['member_id' => $createdMembers[5]->id, 'event_id' => $event1->id, 'amount' => 1000, 'payment_date' => '2026-02-28', 'payment_method' => 'bKash', 'transaction_reference' => 'BK-7721', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => 'Installment 2']);

        // Member 6: Subhashish Ghosh (ID: 7) - Unpaid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[6]->id, 'event_fee' => 2000, 'previous_due_at_time' => 400]);

        // Member 7: Ripon Mollah (ID: 8) - Partial Paid
        EventMemberFee::create(['event_id' => $event1->id, 'member_id' => $createdMembers[7]->id, 'event_fee' => 2000, 'previous_due_at_time' => 0]);
        PaymentTransaction::create(['member_id' => $createdMembers[7]->id, 'event_id' => $event1->id, 'amount' => 1500, 'payment_date' => '2026-02-18', 'payment_method' => 'Cash', 'transaction_reference' => 'CSH-028', 'received_by' => 'Amitav Sarkar (Treasurer)', 'note' => '3/4th payment']);

        // Assign and seed remaining members across events
        for ($i = 8; $i < count($createdMembers); $i++) {
            $m = $createdMembers[$i];
            // Assign Event 1 (Puja)
            $prevDue = ($i % 3 === 0) ? 300 : (($i % 4 === 0) ? 500 : 0);
            EventMemberFee::create([
                'event_id' => $event1->id,
                'member_id' => $m->id,
                'event_fee' => 2000,
                'previous_due_at_time' => $prevDue,
            ]);

            // Vary payments: Paid, Partial, Unpaid
            if ($i % 3 === 0) {
                // Fully Paid
                PaymentTransaction::create([
                    'member_id' => $m->id,
                    'event_id' => $event1->id,
                    'amount' => 2000,
                    'payment_date' => '2026-02-22',
                    'payment_method' => ($i % 2 === 0) ? 'bKash' : 'Cash',
                    'transaction_reference' => 'TXN-' . rand(10000, 99999),
                    'received_by' => 'Amitav Sarkar',
                    'note' => 'Full fee cleared',
                ]);
            } elseif ($i % 3 === 1) {
                // Partial Paid
                PaymentTransaction::create([
                    'member_id' => $m->id,
                    'event_id' => $event1->id,
                    'amount' => 1000,
                    'payment_date' => '2026-02-24',
                    'payment_method' => 'Nagad',
                    'transaction_reference' => 'NG-' . rand(10000, 99999),
                    'received_by' => 'Amitav Sarkar',
                    'note' => 'First partial installment',
                ]);
            }
            // else Unpaid (no transaction)

            // Assign Event 2 (Picnic) to active members
            if ($m->status === 'Active') {
                EventMemberFee::create([
                    'event_id' => $event2->id,
                    'member_id' => $m->id,
                    'event_fee' => 1500,
                    'previous_due_at_time' => 0,
                ]);

                if ($i % 2 === 0) {
                    PaymentTransaction::create([
                        'member_id' => $m->id,
                        'event_id' => $event2->id,
                        'amount' => 1500,
                        'payment_date' => '2026-03-01',
                        'payment_method' => 'Cash',
                        'transaction_reference' => 'PICNIC-CSH-' . $i,
                        'received_by' => 'Amitav Sarkar',
                        'note' => 'Picnic registration full payment',
                    ]);
                }
            }
        }

        // 6. Seed Gallery Items (High-definition, curated event imagery)
        $gallery = [
            [
                'title' => 'Maha Ashtami Cultural Evening & Arati',
                'caption' => 'Devotional arati and grand cultural dance by club members and youth brigade at Gomegram Mandir.',
                'image_path' => 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Puja Celebration',
                'event_id' => $event1->id,
                'is_featured' => true,
                'order' => 1,
            ],
            [
                'title' => 'Annual Picnic River Cruise & Feast',
                'caption' => 'Memorable family cruise and barbecue luncheon organized by Gomegram Swapnosiri Tarun Sangha.',
                'image_path' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Annual Picnic',
                'event_id' => $event2->id,
                'is_featured' => true,
                'order' => 2,
            ],
            [
                'title' => 'Youth Premier League Final Match',
                'caption' => 'Thrilling championship clash at Gomegram High School ground in front of 1500+ cheering locals.',
                'image_path' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Sports',
                'event_id' => $event3->id,
                'is_featured' => true,
                'order' => 3,
            ],
            [
                'title' => 'Free Voluntary Blood Donation Camp',
                'caption' => 'Over 85 units of blood donated by club members in collaboration with Red Crescent Society.',
                'image_path' => 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Social Activities',
                'event_id' => null,
                'is_featured' => true,
                'order' => 4,
            ],
            [
                'title' => 'Winter Clothes & Warm Blanket Distribution',
                'caption' => 'Distributing warm winter blankets to over 300 underprivileged families and elders in Gomegram village.',
                'image_path' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Social Activities',
                'event_id' => null,
                'is_featured' => false,
                'order' => 5,
            ],
            [
                'title' => 'Boishakhi Utsav & Traditional Rally (Shobhajatra)',
                'caption' => 'Colorful celebration of Pahela Baishakh with folk music, dhol beats, and traditional Bengali sweets.',
                'image_path' => 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Cultural Program',
                'event_id' => null,
                'is_featured' => false,
                'order' => 6,
            ],
            [
                'title' => 'Durga Puja Mandap Illumination & Lighting',
                'caption' => 'Spectacular festive illumination and artistic gate crafted by local youth volunteers.',
                'image_path' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Puja Celebration',
                'event_id' => $event1->id,
                'is_featured' => false,
                'order' => 7,
            ],
            [
                'title' => 'Merit Scholarship & Book Distribution',
                'caption' => 'Honoring high school achievers with academic awards, dictionaries, and sports gear.',
                'image_path' => 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
                'category' => 'Other',
                'event_id' => null,
                'is_featured' => false,
                'order' => 8,
            ],
        ];

        foreach ($gallery as $g) {
            GalleryItem::create($g);
        }

        // 7. Seed Contact Messages
        $messages = [
            [
                'name' => 'Dr. Anupam Mukherjee',
                'email' => 'anupam.mukherjee@healthcare.org',
                'phone' => '+880 1715-998877',
                'subject' => 'Volunteering in upcoming Medical and Eye Camp',
                'message' => 'Greetings Swapnosiri team, I am a physician from Singair. We would love to collaborate with your club to provide free medical consultations and diabetes screenings during your next event.',
                'is_read' => false,
            ],
            [
                'name' => 'Suman Roy',
                'email' => 'suman.roy99@yahoo.com',
                'phone' => '+880 1819-334455',
                'subject' => 'Membership Application Inquiry',
                'message' => 'Hello! I recently moved back to Gomegram after completing my studies. How can I register as a Youth / General member of the club? Looking forward to contributing.',
                'is_read' => true,
            ],
            [
                'name' => 'Shanta Ghosh',
                'email' => 'shanta.ghosh@gmail.com',
                'phone' => '+880 1912-778899',
                'subject' => 'Bijoya Cultural Program Participation',
                'message' => 'Can my dance academy participate in the Bijoya Sammilani cultural evening this year? We have prepared a classical and folk dance performance.',
                'is_read' => false,
            ],
        ];

        foreach ($messages as $m) {
            ContactMessage::create($m);
        }
    }
}
