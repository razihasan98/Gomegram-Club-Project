<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClubSetting;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemberController extends Controller
{
    /**
     * Public Members Directory
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Member::query()->where('status', 'Active');

        // Search by Name, Member ID, or Phone
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bangla_name', 'like', "%{$search}%")
                  ->orWhere('member_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by Membership Type
        if ($request->filled('membership_type') && $request->membership_type !== 'All') {
            $query->where('membership_type', $request->membership_type);
        }

        $eventId = $request->get('event_id');
        if (!$eventId) {
            $latestEvent = Event::where('is_published', true)->orderBy('event_date', 'desc')->first();
            $eventId = $latestEvent ? $latestEvent->id : null;
        }

        $members = $query->orderByRaw('CAST(member_id AS INTEGER) ASC, id ASC')->get();

        // Attach financials and apply privacy settings
        $globalHidePhone = ClubSetting::get('hide_public_phone', '0') === '1';
        $globalHideEmail = ClubSetting::get('hide_public_email', '0') === '1';
        $globalHideAddress = ClubSetting::get('hide_public_address', '0') === '1';
        $globalHideFinancials = ClubSetting::get('hide_public_financials', '0') === '1';

        $data = $members->map(function ($member) use ($eventId, $globalHidePhone, $globalHideEmail, $globalHideAddress, $globalHideFinancials) {
            $financials = $member->getFinancials($eventId);

            return [
                'id' => $member->id,
                'member_id' => $member->member_id ?: (string)$member->id,
                'name' => $member->name,
                'bangla_name' => $member->bangla_name,
                'photo' => $member->photo,
                'phone' => ($globalHidePhone || !$member->is_phone_public) ? null : $member->phone,
                'email' => ($globalHideEmail || !$member->is_email_public) ? null : $member->email,
                'address' => ($globalHideAddress || !$member->is_address_public) ? null : $member->address,
                'membership_type' => $member->membership_type,
                'position' => $member->position,
                'blood_group' => $member->blood_group,
                'joining_date' => $member->joining_date ? $member->joining_date->format('Y-m-d') : null,
                'financials' => ($globalHideFinancials || !$member->is_financial_public) ? null : $financials,
            ];
        });

        // Filter by Payment Status if requested
        if ($request->filled('payment_status') && $request->payment_status !== 'All') {
            $status = $request->payment_status;
            $data = $data->filter(function ($item) use ($status) {
                return isset($item['financials']['status']) && $item['financials']['status'] === $status;
            })->values();
        }

        // Sorting
        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'name_asc':
                    $data = $data->sortBy('name')->values();
                    break;
                case 'name_desc':
                    $data = $data->sortByDesc('name')->values();
                    break;
                case 'due_desc':
                    $data = $data->sortByDesc(fn($m) => $m['financials']['total_due'] ?? 0)->values();
                    break;
                case 'due_asc':
                    $data = $data->sortBy(fn($m) => $m['financials']['total_due'] ?? 0)->values();
                    break;
                case 'paid_desc':
                    $data = $data->sortByDesc(fn($m) => $m['financials']['paid'] ?? 0)->values();
                    break;
                default:
                    $data = $data->sortBy(fn($m) => (int)($m['member_id'] ?? $m['id']))->values();
            }
        }

        return response()->json([
            'members' => $data,
            'selected_event_id' => $eventId,
        ]);
    }

    /**
     * Public Member Detail
     */
    public function publicShow($id): JsonResponse
    {
        $member = Member::where('status', 'Active')->findOrFail($id);
        
        $globalHidePhone = ClubSetting::get('hide_public_phone', '0') === '1';
        $globalHideEmail = ClubSetting::get('hide_public_email', '0') === '1';
        $globalHideAddress = ClubSetting::get('hide_public_address', '0') === '1';
        $globalHideFinancials = ClubSetting::get('hide_public_financials', '0') === '1';

        $financials = $member->getFinancials();

        return response()->json([
            'member' => [
                'id' => $member->id,
                'member_id' => $member->member_id,
                'name' => $member->name,
                'bangla_name' => $member->bangla_name,
                'photo' => $member->photo,
                'phone' => ($globalHidePhone || !$member->is_phone_public) ? null : $member->phone,
                'email' => ($globalHideEmail || !$member->is_email_public) ? null : $member->email,
                'address' => ($globalHideAddress || !$member->is_address_public) ? null : $member->address,
                'membership_type' => $member->membership_type,
                'position' => $member->position,
                'blood_group' => $member->blood_group,
                'joining_date' => $member->joining_date ? $member->joining_date->format('Y-m-d') : null,
                'financials' => ($globalHideFinancials || !$member->is_financial_public) ? null : $financials,
            ],
        ]);
    }

    /**
     * Admin Members List
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Member::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bangla_name', 'like', "%{$search}%")
                  ->orWhere('member_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('membership_type') && $request->membership_type !== 'All') {
            $query->where('membership_type', $request->membership_type);
        }

        $eventId = $request->get('event_id');
        if (!$eventId) {
            $latestEvent = Event::orderBy('event_date', 'desc')->first();
            $eventId = $latestEvent ? $latestEvent->id : null;
        }

        $members = $query->orderByRaw('CAST(member_id AS INTEGER) ASC, id ASC')->get();

        $data = $members->map(function ($member) use ($eventId) {
            $financials = $member->getFinancials($eventId);
            return [
                'id' => $member->id,
                'member_id' => $member->member_id ?: (string)$member->id,
                'name' => $member->name,
                'bangla_name' => $member->bangla_name,
                'photo' => $member->photo,
                'phone' => $member->phone,
                'email' => $member->email,
                'address' => $member->address,
                'date_of_birth' => $member->date_of_birth ? $member->date_of_birth->format('Y-m-d') : null,
                'joining_date' => $member->joining_date ? $member->joining_date->format('Y-m-d') : null,
                'membership_type' => $member->membership_type,
                'position' => $member->position,
                'blood_group' => $member->blood_group,
                'status' => $member->status,
                'is_phone_public' => $member->is_phone_public,
                'is_email_public' => $member->is_email_public,
                'is_address_public' => $member->is_address_public,
                'is_financial_public' => $member->is_financial_public,
                'financials' => $financials,
            ];
        });

        // Filter by Payment Status if requested
        if ($request->filled('payment_status') && $request->payment_status !== 'All') {
            $status = $request->payment_status;
            $data = $data->filter(function ($item) use ($status) {
                return isset($item['financials']['status']) && $item['financials']['status'] === $status;
            })->values();
        }

        // Sorting
        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'name_asc':
                    $data = $data->sortBy('name')->values();
                    break;
                case 'name_desc':
                    $data = $data->sortByDesc('name')->values();
                    break;
                case 'due_desc':
                    $data = $data->sortByDesc(fn($m) => $m['financials']['total_due'] ?? 0)->values();
                    break;
                case 'due_asc':
                    $data = $data->sortBy(fn($m) => $m['financials']['total_due'] ?? 0)->values();
                    break;
                case 'paid_desc':
                    $data = $data->sortByDesc(fn($m) => $m['financials']['paid'] ?? 0)->values();
                    break;
                default:
                    $data = $data->sortBy(fn($m) => (int)($m['member_id'] ?? $m['id']))->values();
            }
        }

        return response()->json([
            'members' => $data,
            'selected_event_id' => $eventId,
            'total_count' => $members->count(),
            'active_count' => $members->where('status', 'Active')->count(),
        ]);
    }

    /**
     * Get Next Suggested Member ID
     */
    public function getNextId(): JsonResponse
    {
        return response()->json([
            'next_id' => Member::generateNextMemberId(),
        ]);
    }

    /**
     * Store Member
     */
    public function store(Request $request): JsonResponse
    {
        $memberId = $request->filled('member_id') ? trim($request->member_id) : Member::generateNextMemberId();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bangla_name' => 'nullable|string|max:255',
            'photo' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date',
            'membership_type' => 'nullable|string',
            'position' => 'nullable|string',
            'blood_group' => 'nullable|string|max:10',
            'status' => 'nullable|string',
            'is_phone_public' => 'boolean',
            'is_email_public' => 'boolean',
            'is_address_public' => 'boolean',
            'is_financial_public' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['member_id'] = $memberId;
        $validated['membership_type'] = $validated['membership_type'] ?? 'General';
        $validated['status'] = ucfirst(strtolower($validated['status'] ?? 'Active'));

        $member = Member::create($validated);

        // If previous due is provided, attach/update to latest event fee
        if ($request->filled('previous_due') && (float)$request->previous_due > 0) {
            $latestEvent = Event::orderBy('event_date', 'desc')->first();
            if ($latestEvent) {
                EventMemberFee::updateOrCreate(
                    ['event_id' => $latestEvent->id, 'member_id' => $member->id],
                    [
                        'event_fee' => $latestEvent->event_fee,
                        'previous_due_at_time' => (float)$request->previous_due,
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Member created successfully',
            'member' => $member,
        ], 201);
    }

    /**
     * Show Member with Full Ledger and Event History
     */
    public function show($id): JsonResponse
    {
        $member = Member::with(['eventFees.event', 'payments.event'])->findOrFail($id);

        $eventsHistory = Event::where('is_published', true)->orderBy('event_date', 'desc')->get()->map(function ($event) use ($member) {
            $fin = $member->getFinancials($event->id);

            return [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'event_date' => $event->event_date,
                'status_state' => $event->status,
                'event_fee' => $fin['event_fee'],
                'paid' => $fin['paid'],
                'previous_due' => $fin['previous_due'],
                'current_due' => $fin['current_due'],
                'total_due' => $fin['total_due'],
                'status' => $fin['status'],
            ];
        });

        $financials = $member->getFinancials();

        return response()->json([
            'member' => $member,
            'financials' => $financials,
            'events_history' => $eventsHistory,
            'payments' => $member->payments()->orderBy('payment_date', 'desc')->get(),
        ]);
    }

    /**
     * Update Member
     */
    public function update(Request $request, $id): JsonResponse
    {
        $member = Member::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bangla_name' => 'nullable|string|max:255',
            'photo' => 'nullable|string',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'joining_date' => 'nullable|date',
            'membership_type' => 'nullable|string',
            'position' => 'nullable|string',
            'blood_group' => 'nullable|string|max:10',
            'status' => 'nullable|string',
            'is_phone_public' => 'boolean',
            'is_email_public' => 'boolean',
            'is_address_public' => 'boolean',
            'is_financial_public' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = ucfirst(strtolower($validated['status']));
        }

        if ($request->filled('photo') && $request->photo !== $member->photo) {
            $this->deleteStoredFile($member->photo);
        }

        $member->update($validated);

        // Update previous due if provided
        if ($request->has('previous_due')) {
            $latestEvent = Event::orderBy('event_date', 'desc')->first();
            if ($latestEvent) {
                EventMemberFee::updateOrCreate(
                    ['event_id' => $latestEvent->id, 'member_id' => $member->id],
                    [
                        'event_fee' => $latestEvent->event_fee,
                        'previous_due_at_time' => (float)$request->previous_due,
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Member updated successfully',
            'member' => $member,
        ]);
    }

    /**
     * Delete Member
     */
    public function destroy($id): JsonResponse
    {
        $member = Member::findOrFail($id);

        // Clean up member photo file from storage
        $this->deleteStoredFile($member->photo);

        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully',
        ]);
    }

    /**
     * Safely delete uploaded file from local storage and public directories
     */
    private function deleteStoredFile(?string $filePath): void
    {
        if (empty($filePath)) {
            return;
        }

        $parsedPath = parse_url($filePath, PHP_URL_PATH);
        if (!$parsedPath) {
            return;
        }

        $relativePath = preg_replace('/^\/?storage\//', '', $parsedPath);

        if (!empty($relativePath)) {
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }

            $publicFilePath = public_path('storage/' . $relativePath);
            if (file_exists($publicFilePath) && is_file($publicFilePath)) {
                @unlink($publicFilePath);
            }
        }
    }

    /**
     * Toggle Member Active / Inactive Status
     */
    public function toggleStatus($id): JsonResponse
    {
        $member = Member::findOrFail($id);
        $member->status = ($member->status === 'Active') ? 'Inactive' : 'Active';
        $member->save();

        return response()->json([
            'message' => "Member status updated to {$member->status}",
            'status' => $member->status,
        ]);
    }

    /**
     * Member Financial Statement (Print / Download format)
     */
    public function getStatement($id, Request $request): JsonResponse
    {
        $member = Member::findOrFail($id);
        $eventId = $request->get('event_id');

        $events = Event::where('is_published', true)->orderBy('event_date', 'asc')->get();
        $ledger = [];
        $totalFeesAll = 0;
        $totalPaidAll = 0;

        foreach ($events as $event) {
            $feeRecord = EventMemberFee::where('member_id', $member->id)->where('event_id', $event->id)->first();
            $payments = PaymentTransaction::where('member_id', $member->id)->where('event_id', $event->id)->get();
            $paid = (float)$payments->sum('amount');
            $fee = $member->getEventFee($event, $feeRecord, $paid);
            $due = max(0, $fee - $paid);

            // Skip events completed before member joined (where fee is 0 and no payments made)
            if ($event->status === 'completed' && $fee <= 0 && $paid <= 0) {
                continue;
            }

            $totalFeesAll += $fee;
            $totalPaidAll += $paid;

            $status = 'Unpaid';
            if ($due <= 0 && ($fee > 0 || $paid > 0)) {
                $status = 'Paid';
            } elseif ($paid > 0 && $due > 0) {
                $status = 'Partial';
            } elseif ($fee == 0 && $due == 0) {
                $status = 'Paid';
            }

            $ledger[] = [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'event_date' => $event->event_date ? $event->event_date->format('Y-m-d') : null,
                'event_fee' => $fee,
                'paid' => $paid,
                'total_due' => $due,
                'status' => $status,
                'transactions' => $payments,
            ];
        }

        $allTransactions = PaymentTransaction::where('member_id', $member->id)
            ->with('event')
            ->orderBy('payment_date', 'desc')
            ->get();

        $clubInfo = [
            'name' => ClubSetting::get('club_name', 'Gomegram Swapnosiri Tarun Sangha'),
            'bangla_name' => ClubSetting::get('club_bangla_name', 'গোমেগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ'),
            'tagline' => ClubSetting::get('club_tagline', 'একতা • সংস্কৃতি • সমাজসেবা'),
            'address' => ClubSetting::get('club_address', 'Gomegram, Bangladesh'),
            'phone' => ClubSetting::get('club_phone', '+880 1700-000000'),
            'email' => ClubSetting::get('club_email', 'contact@swapnosiri.org'),
        ];

        return response()->json([
            'club_info' => $clubInfo,
            'member' => $member,
            'statement_date' => now()->format('d M, Y'),
            'financial_summary' => [
                'total_events_assigned' => count(array_filter($ledger, fn($item) => $item['event_fee'] > 0)),
                'total_fees_charged' => $totalFeesAll,
                'total_amount_paid' => $totalPaidAll,
                'total_outstanding_due' => max(0, $totalFeesAll - $totalPaidAll),
            ],
            'event_ledger' => $ledger,
            'transactions' => $allTransactions,
        ]);
    }
}
