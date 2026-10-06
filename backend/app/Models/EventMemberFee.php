<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventMemberFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'member_id',
        'event_fee',
        'previous_due_at_time',
        'notes',
    ];

    protected $casts = [
        'event_fee' => 'decimal:2',
        'previous_due_at_time' => 'decimal:2',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'event_member_fee_id');
    }
}
