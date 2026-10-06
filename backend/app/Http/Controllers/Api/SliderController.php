<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SliderImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SliderController extends Controller
{
    /**
     * Get active slider images for the public homepage.
     */
    public function publicIndex(): JsonResponse
    {
        $images = SliderImage::where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'images' => $images
        ]);
    }

    /**
     * Get all slider images for the admin portal.
     */
    public function adminIndex(): JsonResponse
    {
        $images = SliderImage::orderBy('order', 'asc')->get();

        return response()->json([
            'images' => $images
        ]);
    }

    /**
     * Upload a new slider image.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|image|max:10240', // 10MB Max
            'image_path' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sliders', 'public');
            $imagePath = url('/storage/' . $path);
        } elseif ($request->filled('image_path')) {
            $imagePath = $request->image_path;
        }

        if (!$imagePath) {
            return response()->json(['message' => 'Please provide an image'], 422);
        }

        $maxOrder = SliderImage::max('order') ?? 0;
        
        $sliderImage = SliderImage::create([
            'image_path' => $imagePath,
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'image' => $sliderImage
        ], 201);
    }

    /**
     * Update the text of a slider image.
     */
    public function updateText(Request $request, $id): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
        ]);

        $image = SliderImage::findOrFail($id);
        $image->title = $request->title;
        $image->subtitle = $request->subtitle;
        $image->save();

        return response()->json([
            'message' => 'Text updated successfully',
            'image' => $image
        ]);
    }

    /**
     * Update the order of slider images.
     */
    public function updateOrder(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:slider_images,id',
            'images.*.order' => 'required|integer',
        ]);

        foreach ($request->images as $img) {
            SliderImage::where('id', $img['id'])->update(['order' => $img['order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    /**
     * Toggle the active status of a slider image.
     */
    public function toggleStatus($id): JsonResponse
    {
        $image = SliderImage::findOrFail($id);
        $image->is_active = !$image->is_active;
        $image->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'image' => $image
        ]);
    }

    /**
     * Delete a slider image.
     */
    public function destroy($id): JsonResponse
    {
        $image = SliderImage::findOrFail($id);
        
        // Remove 'storage/' from path to delete using Storage facade
        $storagePath = str_replace('/storage/', '', $image->image_path);
        if (Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
        }

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }
}
