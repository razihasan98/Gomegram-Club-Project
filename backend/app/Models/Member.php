<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'name',
        'bangla_name',
        'photo',
        'phone',
        'email',
        'address',
        'date_of_birth',
        'joining_date',
        'membership_type',
        'position',
        'blood_group',
        'status',
        'is_phone_public',
        'is_email_public',
        'is_address_public',
        'is_financial_public',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'joining_date' => 'date',
        'is_phone_public' => 'boolean',
        'is_email_public' => 'boolean',
        'is_address_public' => 'boolean',
        'is_financial_public' => 'boolean',
    ];

    public function eventFees(): HasMany
    {
        return $this->hasMany(EventMemberFee::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class)->orderBy('payment_date', 'desc');
    }

    /**
     * Generate next available member ID in continuous sequential order (1, 2, 3...)
     * Automatically fills any gap when a member is deleted.
     */
    public static function generateNextMemberId(): string
    {
        $existingNumericIds = self::pluck('member_id')
            ->filter(fn($id) => is_numeric($id))
            ->map(fn($id) => (int)$id)
            ->values()
            ->all();

        if (empty($existingNumericIds)) {
            return '1';
        }

        $id = 1;
        while (in_array($id, $existingNumericIds, true)) {
            $id++;
        }

        return (string)$id;
    }

    /**
     * Get the applicable event fee for this member.
     * If an event is completed and the member has no fee record and no payment, fee is 0.
     * Otherwise defaults to event's default fee.
     */
    public function getEventFee(Event $event, ?EventMemberFee $feeRecord = null, float $paid = 0): float
    {
        if ($feeRecord) {
            return (float)$feeRecord->event_fee;
        }

        if ($event->status === 'completed' && $paid <= 0) {
            if ($this->joining_date) {
                $eventDate = $event->event_date ?: $event->updated_at;
                if (\Carbon\Carbon::parse($this->joining_date)->startOfDay()->gt(\Carbon\Carbon::parse($eventDate)->endOfDay())) {
                    return 0.0;
                }
            } else {
                if ($this->created_at && $event->updated_at && $this->created_at->gt($event->updated_at)) {
                    return 0.0;
                }
            }
        }

        return (float)$event->event_fee;
    }

    /**
     * Calculate financial status for a specific event or overall across all running & completed events
     */
    public function getFinancials($eventId = null): array
    {
        // Fetch all published events ordered chronologically
        $allEvents = Event::where('is_published', true)
            ->where('status', '!=', 'cancelled')
            ->orderBy('event_date', 'asc')
            ->get();

        if ($eventId && $eventId !== 'All') {
            $currentEvent = $allEvents->firstWhere('id', $eventId) ?: Event::find($eventId);

            if ($currentEvent) {
                $currentFeeRecord = $this->eventFees()->where('event_id', $currentEvent->id)->first();
                $currentPaid = (float)$this->payments()->where('event_id', $currentEvent->id)->sum('amount');
                $currentEventFee = $this->getEventFee($currentEvent, $currentFeeRecord, $currentPaid);
                $currentDue = max(0, $currentEventFee - $currentPaid);

                // Accumulate unpaid dues from all other events
                $dynamicPrevDue = 0;
                foreach ($allEvents as $otherEvent) {
                    if ($otherEvent->id != $currentEvent->id) {
                        $otherFeeRecord = $this->eventFees()->where('event_id', $otherEvent->id)->first();
                        $otherPaid = (float)$this->payments()->where('event_id', $otherEvent->id)->sum('amount');
                        $otherFee = $this->getEventFee($otherEvent, $otherFeeRecord, $otherPaid);
                        $otherDue = max(0, $otherFee - $otherPaid);
                        $dynamicPrevDue += $otherDue;
                    }
                }

                $totalPreviousDue = $dynamicPrevDue;
                $totalDue = $totalPreviousDue + $currentDue;

                $status = 'Unpaid';
                if ($currentEventFee > 0) {
                    if ($currentPaid >= $currentEventFee) {
                        $status = 'Paid';
                    } elseif ($currentPaid > 0) {
                        $status = 'Partial';
                    } else {
                        $status = 'Unpaid';
                    }
                } else {
                    $status = $totalDue <= 0 ? 'Paid' : 'Unpaid';
                }

                $totalPaidAll = (float)$this->payments()->sum('amount');

                return [
                    'event_id' => $currentEvent->id,
                    'event_title' => $currentEvent->title,
                    'event_fee' => $currentEventFee,
                    'paid' => $currentPaid,
                    'event_paid' => $currentPaid,
                    'total_paid' => $totalPaidAll,
                    'previous_due' => $totalPreviousDue,
                    'current_due' => $currentDue,
                    'total_due' => $totalDue,
                    'status' => $status,
                ];
            }
        }

        // Cumulative Calculation Across ALL Running (ongoing/upcoming) & Completed Events
        $totalFees = 0;
        $totalPaid = (float)$this->payments()->sum('amount');
        $previousDue = 0;
        $currentDue = 0;

        foreach ($allEvents as $event) {
            $feeRecord = $this->eventFees()->where('event_id', $event->id)->first();
            $eventPaid = (float)$this->payments()->where('event_id', $event->id)->sum('amount');
            $eventFee = $this->getEventFee($event, $feeRecord, $eventPaid);
            $eventDue = max(0, $eventFee - $eventPaid);

            $totalFees += $eventFee;

            if ($event->status === 'completed') {
                $previousDue += $eventDue;
            } else {
                $currentDue += $eventDue;
            }
        }

        $totalPreviousDue = $previousDue;
        $totalDue = $totalPreviousDue + $currentDue;

        $status = 'Unpaid';
        if ($totalDue <= 0 && ($totalFees > 0 || $totalPaid > 0)) {
            $status = 'Paid';
        } elseif ($totalPaid > 0 && $totalDue > 0) {
            $status = 'Partial';
        } elseif ($totalFees == 0 && $totalPreviousDue == 0) {
            $status = 'Paid';
        }

        return [
            'event_id' => null,
            'event_title' => 'All Events Cumulative',
            'event_fee' => $totalFees,
            'paid' => $totalPaid,
            'previous_due' => $totalPreviousDue,
            'current_due' => $currentDue,
            'total_due' => $totalDue,
            'status' => $status,
        ];
    }
}
