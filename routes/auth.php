<?php

use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Registro
    Route::get('register', [LoginController::class, 'showRegister'])->name('register');
    Route::post('register', [LoginController::class, 'register']);

    // Login
    Route::get('login', [LoginController::class, 'showLogin'])->name('login');
    Route::post('login', [LoginController::class, 'login']);
});

Route::middleware('auth')->group(function () {
    // Logout apuntando a LoginController
    Route::post('logout', [LoginController::class, 'logout'])->name('logout');
});

