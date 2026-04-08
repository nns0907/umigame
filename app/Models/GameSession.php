<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GameSession extends Model
{
    use SoftDeletes;
    protected $guarded = [];

    public function riddle(): BelongsTo
    {
        return $this->belongsTo(Riddle::class);
    }

    public function chatHistories(): HasMany
    {
        return $this->hasMany(ChatHistory::class);
    }
}
