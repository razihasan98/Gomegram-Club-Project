<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Submit Contact Form (Public)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:3000',
        ]);

        $message = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Thank you! Your message has been received. Club officials will get back to you soon.',
            'data' => $message,
        ], 201);
    }

    /**
     * Admin Contact Messages List
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ContactMessage::orderBy('created_at', 'desc');

        if ($request->filled('unread_only') && $request->unread_only == '1') {
            $query->where('is_read', false);
        }

        $messages = $query->paginate($request->get('per_page', 20));
        $unreadCount = ContactMessage::where('is_read', false)->count();

        return response()->json([
            'messages' => $messages,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark message as read / unread
     */
    public function markRead($id, Request $request): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->is_read = $request->get('is_read', true);
        $message->save();

        return response()->json([
            'message' => 'Message updated',
            'data' => $message,
        ]);
    }

    /**
     * Delete message
     */
    public function destroy($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully',
        ]);
    }
}
