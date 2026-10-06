<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * List all payment transactions
     */
    public function index(Request $request): JsonResponse
    {
        $query = PaymentTransaction::with(['member', 'event']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('member_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            })->orWhere('transaction_reference', 'like', "%{$search}%")
              ->orWhere('received_by', 'like', "%{$search}%");
        }

        if ($request->filled('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        if ($request->filled('event_id') && $request->event_id !== 'All') {
            $query->where('event_id', $request->event_id);
        }

        if ($request->filled('payment_method') && $request->payment_method !== 'All') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('payment_date', [$request->start_date, $request->end_date]);
        }

        $transactions = $query->orderBy('payment_date', 'desc')->orderBy('id', 'desc')->paginate($request->get('per_page', 50));

        $totalCollected = (float)PaymentTransaction::sum('amount');
        $todayCollected = (float)PaymentTransaction::whereDate('payment_date', today())->sum('amount');

        return response()->json([
            'transactions' => $transactions,
            'summary' => [
                'total_collected' => $totalCollected,
                'today_collected' => $todayCollected,
            ],
        ]);
    }

    /**
     * Store a Single Payment / Installment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'event_id' => 'nullable|exists:events,id',
            'amount' => 'required|numeric|min:1',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:Cash,Bank,bKash,Nagad,Rocket,Other',
            'transaction_reference' => 'nullable|string|max:100',
            'received_by' => 'nullable|string|max:255',
            'note' => 'nullable|string',
            'create_fee_if_missing' => 'nullable|boolean',
            'event_fee_amount' => 'nullable|numeric|min:0',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $eventId = $validated['event_id'] ?? null;
        $feeRecordId = null;

        if ($eventId) {
            $event = Event::find($eventId);
            if ($event) {
                $feeRecord = EventMemberFee::firstOrCreate(
                    ['event_id' => $eventId, 'member_id' => $member->id],
                    [
                        'event_fee' => $event->event_fee,
                        'previous_due_at_time' => 0,
                    ]
                );
                $feeRecordId = $feeRecord->id;
            }
        }

        $transaction = PaymentTransaction::create([
            'member_id' => $member->id,
            'event_id' => $eventId,
            'event_member_fee_id' => $feeRecordId,
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['transaction_reference'] ?? null,
            'received_by' => $validated['received_by'] ?? ($request->user() ? $request->user()->name : 'Admin'),
            'note' => $validated['note'] ?? null,
        ]);

        $financials = $member->getFinancials($eventId);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'transaction' => $transaction->load(['member', 'event']),
            'updated_financials' => $financials,
        ], 201);
    }

    /**
     * Bulk Store Payments (For spreadsheet-style batch updates during club meetings)
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'payments' => 'required|array|min:1',
            'payments.*.member_id' => 'required|exists:members,id',
            'payments.*.event_id' => 'nullable|exists:events,id',
            'payments.*.amount' => 'required|numeric|min:1',
            'payments.*.payment_date' => 'required|date',
            'payments.*.payment_method' => 'required|in:Cash,Bank,bKash,Nagad,Rocket,Other',
            'payments.*.transaction_reference' => 'nullable|string|max:100',
            'payments.*.received_by' => 'nullable|string|max:255',
            'payments.*.note' => 'nullable|string',
        ]);

        $createdCount = 0;
        $totalAmount = 0;

        DB::transaction(function () use ($request, &$createdCount, &$totalAmount) {
            $adminName = $request->user() ? $request->user()->name : 'Admin';

            foreach ($request->payments as $item) {
                $feeRecordId = null;
                if (!empty($item['event_id'])) {
                    $event = Event::find($item['event_id']);
                    if ($event) {
                        $feeRecord = EventMemberFee::firstOrCreate(
                            ['event_id' => $item['event_id'], 'member_id' => $item['member_id']],
                            [
                                'event_fee' => $event->event_fee,
                                'previous_due_at_time' => 0,
                            ]
                        );
                        $feeRecordId = $feeRecord->id;
                    }
                }

                PaymentTransaction::create([
                    'member_id' => $item['member_id'],
                    'event_id' => $item['event_id'] ?? null,
                    'event_member_fee_id' => $feeRecordId,
                    'amount' => $item['amount'],
                    'payment_date' => $item['payment_date'],
                    'payment_method' => $item['payment_method'],
                    'transaction_reference' => $item['transaction_reference'] ?? null,
                    'received_by' => $item['received_by'] ?? $adminName,
                    'note' => $item['note'] ?? null,
                ]);

                $createdCount++;
                $totalAmount += (float)$item['amount'];
            }
        });

        return response()->json([
            'message' => "Successfully recorded {$createdCount} payments totaling ৳" . number_format($totalAmount, 2),
            'count' => $createdCount,
            'total_amount' => $totalAmount,
        ]);
    }

    /**
     * Delete a payment transaction
     */
    public function destroy($id): JsonResponse
    {
        $transaction = PaymentTransaction::findOrFail($id);
        $transaction->delete();

        return response()->json([
            'message' => 'Payment transaction deleted successfully',
        ]);
    }

    /**
     * Get member ledger
     */
    public function memberLedger($memberId): JsonResponse
    {
        $member = Member::findOrFail($memberId);
        $transactions = PaymentTransaction::where('member_id', $memberId)
            ->with('event')
            ->orderBy('payment_date', 'desc')
            ->get();

        return response()->json([
            'member' => $member,
            'transactions' => $transactions,
            'financials' => $member->getFinancials(),
        ]);
    }
}
