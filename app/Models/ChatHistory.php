<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatHistory extends Model
{
    use SoftDeletes;
    protected $guarded = [];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }
}
