<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventMemberFee;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Public Events List
     */
    public function publicIndex(): JsonResponse
    {
        $events = Event::where('is_published', true)
            ->orderBy('event_date', 'desc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'description' => $event->description,
                    'banner_image' => $event->banner_image,
                    'event_date' => $event->event_date->format('Y-m-d'),
                    'start_time' => $event->start_time,
                    'location' => $event->location,
                    'event_fee' => (float)$event->event_fee,
                    'registration_deadline' => $event->registration_deadline ? $event->registration_deadline->format('Y-m-d') : null,
                    'status' => $event->status,
                    'stats' => $event->stats,
                ];
            });

        return response()->json([
            'events' => $events,
        ]);
    }

    /**
     * Public Event Detail
     */
    public function publicShow($id): JsonResponse
    {
        $event = Event::where('is_published', true)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('slug', $id);
            })
            ->firstOrFail();

        return response()->json([
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'banner_image' => $event->banner_image,
                'event_date' => $event->event_date->format('Y-m-d'),
                'start_time' => $event->start_time,
                'location' => $event->location,
                'event_fee' => (float)$event->event_fee,
                'registration_deadline' => $event->registration_deadline ? $event->registration_deadline->format('Y-m-d') : null,
                'status' => $event->status,
                'stats' => $event->stats,
                'gallery' => $event->galleryItems,
            ],
        ]);
    }

    /**
     * Admin Events List
     */
    public function adminIndex(): JsonResponse
    {
        $events = Event::orderBy('id', 'desc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'description' => $event->description,
                    'banner_image' => $event->banner_image,
                    'event_date' => $event->event_date->format('Y-m-d'),
                    'start_time' => $event->start_time,
                    'location' => $event->location,
                    'event_fee' => (float)$event->event_fee,
                    'registration_deadline' => $event->registration_deadline ? $event->registration_deadline->format('Y-m-d') : null,
                    'status' => $event->status,
                    'is_published' => $event->is_published,
                    'stats' => $event->stats,
                ];
            });

        return response()->json([
            'events' => $events,
        ]);
    }

    /**
     * Store Event
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'event_date' => 'required|date',
            'start_time' => 'nullable|string',
            'location' => 'required|string|max:255',
            'event_fee' => 'required|numeric|min:0',
            'registration_deadline' => 'nullable|date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'is_published' => 'boolean',
            'assign_to_all_active' => 'nullable|boolean',
        ]);

        $event = Event::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'description' => $validated['description'] ?? null,
            'banner_image' => $validated['banner_image'] ?? null,
            'event_date' => $validated['event_date'],
            'start_time' => $validated['start_time'] ?? null,
            'location' => $validated['location'],
            'event_fee' => $validated['event_fee'],
            'registration_deadline' => $validated['registration_deadline'] ?? null,
            'status' => $validated['status'],
            'is_published' => $validated['is_published'] ?? true,
        ]);

        // Bulk assign fee if selected
        if (!empty($validated['assign_to_all_active']) && $event->event_fee > 0) {
            $this->assignFeeToActiveMembers($event);
        }

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event,
        ], 201);
    }

    /**
     * Show Event with Member Payment Breakdown
     */
    public function show($id): JsonResponse
    {
        $event = Event::with(['memberFees.member', 'payments.member'])->findOrFail($id);

        $memberBreakdown = Member::where('status', 'Active')->orderBy('id', 'asc')->get()->map(function ($member) use ($event) {
            $feeRecord = EventMemberFee::where('event_id', $event->id)->where('member_id', $member->id)->first();
            $payments = PaymentTransaction::where('event_id', $event->id)->where('member_id', $member->id)->get();
            $isAssigned = !is_null($feeRecord);
            $fin = $member->getFinancials($event->id);

            return [
                'member_id' => $member->id,
                'member_code' => $member->member_id ?: (string)$member->id,
                'member_name' => $member->name,
                'photo' => $member->photo,
                'phone' => $member->phone,
                'is_assigned' => $isAssigned,
                'event_fee' => $fin['event_fee'],
                'paid' => $fin['paid'],
                'previous_due' => $fin['previous_due'],
                'current_due' => $fin['current_due'],
                'total_due' => $fin['total_due'],
                'status' => $fin['status'],
                'payments' => $payments,
            ];
        });

        return response()->json([
            'event' => $event,
            'stats' => $event->stats,
            'member_payments' => $memberBreakdown,
        ]);
    }

    /**
     * Update Event
     */
    public function update(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'event_date' => 'required|date',
            'start_time' => 'nullable|string',
            'location' => 'required|string|max:255',
            'event_fee' => 'required|numeric|min:0',
            'registration_deadline' => 'nullable|date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'is_published' => 'boolean',
        ]);

        // If a new banner image path is provided and different from current, delete the old file
        if ($request->filled('banner_image') && $request->banner_image !== $event->banner_image) {
            $this->deleteStoredFile($event->banner_image);
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event,
        ]);
    }

    /**
     * Delete Event
     */
    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);

        // Delete banner image from storage
        $this->deleteStoredFile($event->banner_image);

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully',
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
     * Assign Bulk Fee to Members for an Event
     */
    public function assignBulkFee(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $request->validate([
            'fee_amount' => 'required|numeric|min:0',
            'target' => 'required|in:all_active,selected',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:members,id',
        ]);

        $feeAmount = (float)$request->fee_amount;

        if ($request->target === 'all_active') {
            $members = Member::where('status', 'Active')->get();
        } else {
            $members = Member::whereIn('id', $request->member_ids ?? [])->get();
        }

        $assignedCount = 0;
        foreach ($members as $member) {
            EventMemberFee::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'member_id' => $member->id,
                ],
                [
                    'event_fee' => $feeAmount,
                    'previous_due_at_time' => 0,
                ]
            );
            $assignedCount++;
        }

        return response()->json([
            'message' => "Event fee of ৳{$feeAmount} assigned to {$assignedCount} members successfully.",
            'assigned_count' => $assignedCount,
        ]);
    }

    /**
     * Helper to assign fee to all active members
     */
    private function assignFeeToActiveMembers(Event $event): void
    {
        $activeMembers = Member::where('status', 'Active')->get();
        foreach ($activeMembers as $member) {
            EventMemberFee::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'member_id' => $member->id,
                ],
                [
                    'event_fee' => $event->event_fee,
                    'previous_due_at_time' => 0,
                ]
            );
        }
    }

    /**
     * Update individual fees for multiple members at once (Bulk Edit)
     */
    public function updateIndividualFees(Request $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $request->validate([
            'fees' => 'required|array',
            'fees.*.member_id' => 'required|exists:members,id',
            'fees.*.event_fee' => 'required|numeric|min:0',
        ]);

        $updatedCount = 0;
        foreach ($request->fees as $feeData) {
            EventMemberFee::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'member_id' => $feeData['member_id'],
                ],
                [
                    'event_fee' => $feeData['event_fee'],
                ]
            );
            $updatedCount++;
        }

        return response()->json([
            'message' => "Successfully updated fees for {$updatedCount} members.",
            'updated_count' => $updatedCount,
        ]);
    }
}
