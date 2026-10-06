<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\JourneyController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\EventExpenseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/settings', [SettingController::class, 'publicSettings']);
Route::get('/members', [MemberController::class, 'publicIndex']);
Route::get('/members/{id}', [MemberController::class, 'publicShow']);
Route::get('/members/{id}/statement', [MemberController::class, 'getStatement']);
Route::get('/events', [EventController::class, 'publicIndex']);
Route::get('/events/{id}', [EventController::class, 'publicShow']);
Route::get('/gallery', [GalleryController::class, 'publicIndex']);
Route::get('/journeys', [JourneyController::class, 'publicIndex']);
Route::get('/slider', [SliderController::class, 'publicIndex']);
Route::post('/contact', [ContactController::class, 'store']);

// Admin Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    
    // ==========================================
    // Shared Routes (super_admin & expense_manager)
    // ==========================================
    Route::middleware('role:super_admin,expense_manager')->group(function () {
        // Auth Profile
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);

        // Read-only access to Events (needed for dropdowns in expenses)
        Route::get('/events', [EventController::class, 'adminIndex']);
        Route::get('/events/{id}', [EventController::class, 'show']);

        // Event Expenses Management
        Route::get('/event-expenses', [EventExpenseController::class, 'index']);
        Route::post('/event-expenses', [EventExpenseController::class, 'store']);
        Route::put('/event-expenses/{id}', [EventExpenseController::class, 'update']);
        Route::delete('/event-expenses/{id}', [EventExpenseController::class, 'destroy']);
    });

    // ==========================================
    // Super Admin Exclusive Routes
    // ==========================================
    Route::middleware('role:super_admin')->group(function () {
        // Users Management
        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

        // Dashboard Analytics
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

        // Members Management
        Route::get('/members/next-id', [MemberController::class, 'getNextId']);
        Route::get('/members', [MemberController::class, 'adminIndex']);
        Route::post('/members', [MemberController::class, 'store']);
        Route::get('/members/{id}', [MemberController::class, 'show']);
        Route::put('/members/{id}', [MemberController::class, 'update']);
        Route::delete('/members/{id}', [MemberController::class, 'destroy']);
        Route::patch('/members/{id}/toggle-status', [MemberController::class, 'toggleStatus']);
        Route::get('/members/{id}/statement', [MemberController::class, 'getStatement']);

        // Events Management (Write operations)
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
        Route::post('/events/{id}/assign-fee', [EventController::class, 'assignBulkFee']);
        Route::put('/events/{id}/individual-fees', [EventController::class, 'updateIndividualFees']);

        // Payment & Ledger Management
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);
        Route::post('/payments/bulk', [PaymentController::class, 'bulkStore']);
        Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
        Route::get('/members/{id}/ledger', [PaymentController::class, 'memberLedger']);

        // Gallery Management
        Route::get('/gallery', [GalleryController::class, 'adminIndex']);
        Route::post('/gallery', [GalleryController::class, 'store']);
        Route::put('/gallery/{id}', [GalleryController::class, 'update']);
        Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

        // Messages Management
        Route::get('/messages', [ContactController::class, 'adminIndex']);
        Route::patch('/messages/{id}/read', [ContactController::class, 'markRead']);
        Route::delete('/messages/{id}', [ContactController::class, 'destroy']);

        // Financial Reports
        Route::get('/reports/member-payments', [ReportController::class, 'getMemberPaymentReport']);
        Route::get('/reports/dues', [ReportController::class, 'getDueReport']);
        Route::get('/reports/events/{id}', [ReportController::class, 'getEventReport']);

        // Media / File Upload
        Route::post('/upload', [UploadController::class, 'upload']);

        // Club Settings Management
        Route::get('/settings', [SettingController::class, 'adminSettings']);
        Route::post('/settings', [SettingController::class, 'updateSettings']);

        // Google Drive Settings
        Route::get('/settings/gdrive', [\App\Http\Controllers\Api\GoogleDriveController::class, 'getConfig']);
        Route::post('/settings/gdrive', [\App\Http\Controllers\Api\GoogleDriveController::class, 'saveConfig']);
        Route::get('/settings/gdrive/auth-url', [\App\Http\Controllers\Api\GoogleDriveController::class, 'getAuthUrl']);
        Route::post('/settings/gdrive/save-code', [\App\Http\Controllers\Api\GoogleDriveController::class, 'saveCode']);

        // Journey Management
        Route::get('/journeys', [JourneyController::class, 'adminIndex']);
        Route::post('/journeys', [JourneyController::class, 'store']);
        Route::put('/journeys/{id}', [JourneyController::class, 'update']);
        Route::delete('/journeys/{id}', [JourneyController::class, 'destroy']);

        // Slider Management
        Route::get('/slider', [SliderController::class, 'adminIndex']);
        Route::post('/slider', [SliderController::class, 'store']);
        Route::post('/slider/reorder', [SliderController::class, 'updateOrder']);
        Route::put('/slider/{id}', [SliderController::class, 'updateText']);
        Route::patch('/slider/{id}/toggle-status', [SliderController::class, 'toggleStatus']);
        Route::delete('/slider/{id}', [SliderController::class, 'destroy']);
    });
});
