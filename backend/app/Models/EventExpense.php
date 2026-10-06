<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'description',
        'amount',
        'expense_date'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
