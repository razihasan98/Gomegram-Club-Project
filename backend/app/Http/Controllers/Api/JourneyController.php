<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journey;
use Illuminate\Http\Request;

class JourneyController extends Controller
{
    public function publicIndex()
    {
        $journeys = Journey::orderBy('year', 'asc')->get();
        return response()->json($journeys);
    }

    public function adminIndex()
    {
        $journeys = Journey::orderBy('year', 'desc')->get();
        return response()->json($journeys);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'image' => 'nullable|string'
        ]);

        $journey = Journey::create($validated);

        return response()->json([
            'message' => 'Journey milestone created successfully',
            'journey' => $journey
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $journey = Journey::findOrFail($id);

        $validated = $request->validate([
            'year' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'image' => 'nullable|string'
        ]);

        $journey->update($validated);

        return response()->json([
            'message' => 'Journey milestone updated successfully',
            'journey' => $journey
        ]);
    }

    public function destroy($id)
    {
        $journey = Journey::findOrFail($id);
        $journey->delete();

        return response()->json([
            'message' => 'Journey milestone deleted successfully'
        ]);
    }
}
