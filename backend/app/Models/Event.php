<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'banner_image',
        'event_date',
        'start_time',
        'location',
        'event_fee',
        'registration_deadline',
        'status',
        'is_published',
    ];

    protected $casts = [
        'event_date' => 'date',
        'registration_deadline' => 'date',
        'event_fee' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title) . '-' . time();
            }
        });
    }

    public function memberFees(): HasMany
    {
        return $this->hasMany(EventMemberFee::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(EventExpense::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(GalleryItem::class);
    }

    public function getStatsAttribute(): array
    {
        $activeMembers = Member::where('status', 'Active')->get();
        $totalExpected = 0;
        $assignedCount = 0;

        foreach ($activeMembers as $member) {
            $feeRecord = $this->memberFees()->where('member_id', $member->id)->first();
            $paid = (float)$member->payments()->where('event_id', $this->id)->sum('amount');
            $eventFee = $member->getEventFee($this, $feeRecord, $paid);
            if ($eventFee > 0) {
                $totalExpected += $eventFee;
                $assignedCount++;
            }
        }

        $totalCollected = (float)$this->payments()->sum('amount');
        $totalDue = max(0, $totalExpected - $totalCollected);
        
        $percentage = $totalExpected > 0 ? round(($totalCollected / $totalExpected) * 100, 1) : 0;

        return [
            'assigned_members' => $assignedCount,
            'total_expected' => $totalExpected,
            'total_collected' => $totalCollected,
            'total_due' => $totalDue,
            'collection_percentage' => min(100, $percentage),
        ];
    }
}
