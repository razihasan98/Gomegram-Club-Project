<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Public Gallery List
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = GalleryItem::with('event')->orderBy('is_featured', 'desc')->orderBy('order', 'asc')->orderBy('id', 'desc');

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('event_id') && $request->event_id !== 'All') {
            $query->where('event_id', $request->event_id);
        }

        $items = $query->get();

        return response()->json([
            'gallery' => $items,
            'categories' => ['All', 'Puja Celebration', 'Annual Picnic', 'Sports', 'Cultural Program', 'Social Activities', 'Other'],
        ]);
    }

    /**
     * Admin Gallery List
     */
    public function adminIndex(): JsonResponse
    {
        $items = GalleryItem::with('event')->orderBy('is_featured', 'desc')->orderBy('order', 'asc')->orderBy('id', 'desc')->get();

        return response()->json([
            'gallery' => $items,
        ]);
    }

    /**
     * Store Single or Multiple Gallery Items
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'caption' => 'nullable|string',
            'type' => 'required|string|in:image,video',
            'image_path' => 'required|string',
            'category' => 'required|string',
            'event_id' => 'nullable|exists:events,id',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        $item = GalleryItem::create($validated);

        return response()->json([
            'message' => 'Image added to gallery successfully',
            'item' => $item->load('event'),
        ], 201);
    }

    /**
     * Update Gallery Item
     */
    public function update(Request $request, $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'caption' => 'nullable|string',
            'type' => 'required|string|in:image,video',
            'image_path' => 'required|string',
            'category' => 'required|string',
            'event_id' => 'nullable|exists:events,id',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        // If a new image path is provided and different from current, delete the old file
        if ($request->filled('image_path') && $request->image_path !== $item->image_path) {
            $this->deleteStoredFile($item->image_path);
        }

        $item->update($validated);

        return response()->json([
            'message' => 'Gallery item updated successfully',
            'item' => $item->load('event'),
        ]);
    }

    /**
     * Delete Gallery Item
     */
    public function destroy($id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        // Delete physical file from storage
        $this->deleteStoredFile($item->image_path);

        $item->delete();

        return response()->json([
            'message' => 'Gallery item deleted successfully',
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

        // Extract relative storage path (e.g., /storage/gallery/abc.jpg -> gallery/abc.jpg)
        $parsedPath = parse_url($filePath, PHP_URL_PATH);
        if (!$parsedPath) {
            return;
        }

        $relativePath = preg_replace('/^\/?storage\//', '', $parsedPath);

        if (!empty($relativePath)) {
            // Delete from storage/app/public
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }

            // Delete direct public copy if it exists (e.g. public/storage/...)
            $publicFilePath = public_path('storage/' . $relativePath);
            if (file_exists($publicFilePath) && is_file($publicFilePath)) {
                @unlink($publicFilePath);
            }
        }
    }
}
