<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);

        // Ensure Authorization Header is never lost on Apache, Vercel proxy, or Cloudflare
        $middleware->prepend(function (Request $request, $next) {
            $token = $request->header('X-Api-Token')
                  ?: $request->header('X-Admin-Token')
                  ?: $request->query('api_token')
                  ?: $request->header('X-Authorization')
                  ?: $request->server('HTTP_AUTHORIZATION')
                  ?: $request->server('REDIRECT_HTTP_AUTHORIZATION');

            if ($token) {
                if (!str_starts_with($token, 'Bearer ')) {
                    $token = 'Bearer ' . $token;
                }
                $request->headers->set('Authorization', $token);
            }
            return $next($request);
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
