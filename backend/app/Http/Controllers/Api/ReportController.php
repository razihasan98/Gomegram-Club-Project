<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Member Payment Comprehensive Report
     */
    public function getMemberPaymentReport(Request $request): JsonResponse
    {
        $eventId = $request->get('event_id');
        $statusFilter = $request->get('status'); // All, Paid, Partial, Unpaid
        $membershipType = $request->get('membership_type');

        $query = Member::where('status', 'Active');

        if ($membershipType && $membershipType !== 'All') {
            $query->where('membership_type', $membershipType);
        }

        $members = $query->orderByRaw('CAST(member_id AS UNSIGNED) ASC, id ASC')->get();

        $selectedEvent = null;
        if ($eventId && $eventId !== 'All') {
            $selectedEvent = Event::find($eventId);
        } else {
            $selectedEvent = Event::orderBy('event_date', 'desc')->first();
            $eventId = $selectedEvent ? $selectedEvent->id : null;
        }

        $reportData = [];
        $totalFees = 0;
        $totalPaid = 0;
        $totalPrevDue = 0;
        $totalCurrentDue = 0;
        $totalDue = 0;

        foreach ($members as $member) {
            $fin = $member->getFinancials($eventId);

            if ($statusFilter && $statusFilter !== 'All' && $fin['status'] !== $statusFilter) {
                continue;
            }

            $totalFees += $fin['event_fee'];
            $totalPaid += $fin['paid'];
            $totalPrevDue += $fin['previous_due'];
            $totalCurrentDue += $fin['current_due'];
            $totalDue += $fin['total_due'];

            $reportData[] = [
                'id' => $member->id,
                'member_id' => $member->member_id ?: (string)$member->id,
                'name' => $member->name,
                'bangla_name' => $member->bangla_name,
                'phone' => $member->phone,
                'membership_type' => $member->membership_type,
                'event_fee' => $fin['event_fee'],
                'paid' => $fin['paid'],
                'previous_due' => $fin['previous_due'],
                'current_due' => $fin['current_due'],
                'total_due' => $fin['total_due'],
                'status' => $fin['status'],
            ];
        }

        return response()->json([
            'event' => $selectedEvent,
            'report_data' => $reportData,
            'summary' => [
                'total_members' => count($reportData),
                'total_event_fees' => $totalFees,
                'total_collected' => $totalPaid,
                'total_previous_due' => $totalPrevDue,
                'total_current_due' => $totalCurrentDue,
                'total_outstanding_due' => $totalDue,
            ],
        ]);
    }

    /**
     * Outstanding Due Report
     */
    public function getDueReport(Request $request): JsonResponse
    {
        $eventId = $request->get('event_id');
        $members = Member::where('status', 'Active')->orderByRaw('CAST(member_id AS UNSIGNED) ASC, id ASC')->get();

        $selectedEvent = $eventId ? Event::find($eventId) : Event::orderBy('event_date', 'desc')->first();
        $targetEventId = $selectedEvent ? $selectedEvent->id : null;

        $dueMembers = [];
        $totalDueAmount = 0;

        foreach ($members as $member) {
            $fin = $member->getFinancials($targetEventId);
            if ($fin['total_due'] > 0) {
                $totalDueAmount += $fin['total_due'];
                $dueMembers[] = [
                    'id' => $member->id,
                    'member_id' => $member->member_id ?: (string)$member->id,
                    'name' => $member->name,
                    'phone' => $member->phone,
                    'membership_type' => $member->membership_type,
                    'event_fee' => $fin['event_fee'],
                    'paid' => $fin['paid'],
                    'previous_due' => $fin['previous_due'],
                    'current_due' => $fin['current_due'],
                    'total_due' => $fin['total_due'],
                    'status' => $fin['status'],
                ];
            }
        }

        return response()->json([
            'event' => $selectedEvent,
            'due_members' => $dueMembers,
            'total_due_members' => count($dueMembers),
            'total_due_amount' => $totalDueAmount,
        ]);
    }

    /**
     * Event Collection Report
     */
    public function getEventReport($eventId): JsonResponse
    {
        $event = Event::with(['memberFees.member', 'payments.member'])->findOrFail($eventId);

        $memberBreakdown = Member::where('status', 'Active')->orderByRaw('CAST(member_id AS UNSIGNED) ASC, id ASC')->get()->map(function ($member) use ($event) {
            $payments = PaymentTransaction::where('event_id', $event->id)->where('member_id', $member->id)->get();
            $fin = $member->getFinancials($event->id);

            return [
                'id' => $member->id,
                'member_id' => $member->member_id ?: (string)$member->id,
                'name' => $member->name,
                'phone' => $member->phone,
                'fee' => $fin['event_fee'],
                'paid' => $fin['paid'],
                'previous_due' => $fin['previous_due'],
                'current_due' => $fin['current_due'],
                'total_due' => $fin['total_due'],
                'status' => $fin['status'],
                'transactions' => $payments,
            ];
        });

        return response()->json([
            'event' => $event,
            'stats' => $event->stats,
            'member_breakdown' => $memberBreakdown,
            'transactions' => $event->payments()->with('member')->orderBy('payment_date', 'desc')->get(),
        ]);
    }
}
