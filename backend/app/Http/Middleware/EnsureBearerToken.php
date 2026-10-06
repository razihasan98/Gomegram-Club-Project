<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBearerToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
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
    }
}
