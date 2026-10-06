<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get Complete Dashboard Analytics & KPIs
     */
    public function getStats(): JsonResponse
    {
        $totalMembers = Member::count();
        $activeMembers = Member::where('status', 'Active')->count();
        $allTimeCollected = (float)PaymentTransaction::sum('amount');
        $todayCollection = (float)PaymentTransaction::whereDate('payment_date', today())->sum('amount');
        $thisMonthCollection = (float)PaymentTransaction::whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');

        // Identify ongoing event, or fallback to the nearest upcoming event by date
        $ongoingEvent = Event::where('status', 'ongoing')->orderBy('event_date', 'asc')->first();

        $upcomingEvent = Event::where('status', 'upcoming')
            ->whereDate('event_date', '>=', today())
            ->orderBy('event_date', 'asc')
            ->first()
            ?: Event::where('status', 'upcoming')->orderBy('event_date', 'asc')->first();

        $activeEvent = $ongoingEvent ?: $upcomingEvent ?: Event::orderBy('event_date', 'desc')->first();

        $eventCardTitle = $ongoingEvent 
            ? 'Ongoing Event' 
            : ($upcomingEvent ? 'Upcoming Event' : 'Latest Event');

        $activeEventStats = $activeEvent ? $activeEvent->stats : [
            'assigned_members' => 0,
            'total_expected' => 0,
            'total_collected' => 0,
            'total_due' => 0,
            'collection_percentage' => 0,
        ];

        $ongoingCollected = (float)($activeEventStats['total_collected'] ?? 0);
        $ongoingDue = (float)($activeEventStats['total_due'] ?? 0);

        // Count Paid vs Due Members for active ongoing event and cumulative total due
        $paidMembersCount = 0;
        $partialMembersCount = 0;
        $unpaidMembersCount = 0;
        $totalOutstandingDueAll = 0;

        $members = Member::where('status', 'Active')->get();
        foreach ($members as $member) {
            $financials = $member->getFinancials($activeEvent ? $activeEvent->id : null);
            if ($financials['status'] === 'Paid') {
                $paidMembersCount++;
            } elseif ($financials['status'] === 'Partial') {
                $partialMembersCount++;
            } else {
                $unpaidMembersCount++;
            }

            $allFin = $member->getFinancials(null);
            $totalOutstandingDueAll += $allFin['total_due'];
        }

        // Monthly Collection Trends for the last 6 months
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M Y');
            $monthShort = $date->format('M');
            $sum = (float)PaymentTransaction::whereYear('payment_date', $date->year)
                ->whereMonth('payment_date', $date->month)
                ->sum('amount');

            $monthlyTrends[] = [
                'month' => $monthShort,
                'full_month' => $monthName,
                'amount' => $sum,
            ];
        }

        // Event Comparison
        $eventsData = Event::orderBy('event_date', 'desc')->take(5)->get()->map(function ($event) {
            $stats = $event->stats;
            return [
                'name' => strlen($event->title) > 20 ? substr($event->title, 0, 18) . '...' : $event->title,
                'full_name' => $event->title,
                'expected' => $stats['total_expected'],
                'collected' => $stats['total_collected'],
                'due' => $stats['total_due'],
            ];
        });

        // Payment Methods Breakdown
        $paymentMethods = PaymentTransaction::select('payment_method', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get();

        // Recent Transactions (Last 8)
        $recentTransactions = PaymentTransaction::with(['member', 'event'])
            ->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(8)
            ->get();

        // Outstanding Dues Alert List (Top 6 members with highest dues)
        $topDueMembers = $members->map(function ($m) use ($activeEvent) {
            $fin = $m->getFinancials($activeEvent ? $activeEvent->id : null);
            return [
                'id' => $m->id,
                'member_id' => $m->member_id ?: (string)$m->id,
                'name' => $m->name,
                'phone' => $m->phone,
                'total_due' => $fin['total_due'],
                'status' => $fin['status'],
                'current_due' => $fin['current_due'],
                'previous_due' => $fin['previous_due'],
            ];
        })->filter(fn($m) => $m['total_due'] > 0)->sortByDesc('total_due')->values()->take(6);

        // Unread Messages Count & Preview
        $unreadMessagesCount = ContactMessage::where('is_read', false)->count();
        $recentMessages = ContactMessage::where('is_read', false)->orderBy('created_at', 'desc')->take(4)->get();

        return response()->json([
            'kpis' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'total_collected' => $ongoingCollected,
                'total_due' => $ongoingDue,
                'event_card_title' => $eventCardTitle,
                'all_time_collected' => $allTimeCollected,
                'all_time_due' => $totalOutstandingDueAll,
                'today_collection' => $todayCollection,
                'month_collection' => $thisMonthCollection,
                'paid_members_count' => $paidMembersCount,
                'partial_members_count' => $partialMembersCount,
                'unpaid_members_count' => $unpaidMembersCount,
                'latest_event' => $activeEvent ? [
                    'id' => $activeEvent->id,
                    'title' => $activeEvent->title,
                    'date' => $activeEvent->event_date ? $activeEvent->event_date->format('Y-m-d') : null,
                    'status' => $activeEvent->status,
                    'stats' => $activeEventStats,
                ] : null,
            ],
            'charts' => [
                'monthly_trends' => $monthlyTrends,
                'status_distribution' => [
                    ['name' => 'Paid Members', 'value' => $paidMembersCount, 'color' => '#10B981'],
                    ['name' => 'Partial Paid', 'value' => $partialMembersCount, 'color' => '#F59E0B'],
                    ['name' => 'Unpaid Members', 'value' => $unpaidMembersCount, 'color' => '#EF4444'],
                ],
                'events_comparison' => $eventsData,
                'payment_methods' => $paymentMethods,
            ],
            'recent_transactions' => $recentTransactions,
            'top_due_members' => $topDueMembers,
            'messages_summary' => [
                'unread_count' => $unreadMessagesCount,
                'recent' => $recentMessages,
            ],
        ]);
    }
}
