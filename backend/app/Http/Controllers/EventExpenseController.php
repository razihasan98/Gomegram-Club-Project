<?php

namespace App\Http\Controllers;

use App\Models\EventExpense;
use Illuminate\Http\Request;

class EventExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = EventExpense::with('event')->orderBy('expense_date', 'desc')->orderBy('created_at', 'desc');

        if ($request->has('event_id') && $request->event_id != '') {
            $query->where('event_id', $request->event_id);
        }

        return response()->json([
            'status' => 'success',
            'expenses' => $query->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'nullable|date'
        ]);

        $expense = EventExpense::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Expense recorded successfully',
            'expense' => $expense->load('event')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'nullable|date'
        ]);

        $expense = EventExpense::findOrFail($id);
        $expense->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Expense updated successfully',
            'expense' => $expense->load('event')
        ]);
    }

    public function destroy($id)
    {
        $expense = EventExpense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Expense deleted successfully'
        ]);
    }
}
