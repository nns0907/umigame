<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:import-riddles')]
#[Description('Command description')]
class ImportRiddles extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sqlitePath = base_path('riddles.db');
        if (!file_exists($sqlitePath)) {
            $this->error("SQLite file not found at {$sqlitePath}");
            return;
        }

        $sqlitePdo = new \PDO("sqlite:{$sqlitePath}");
        $stmt = $sqlitePdo->query("SELECT * FROM riddles");
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $this->info("Importing " . count($rows) . " riddles...");

        foreach ($rows as $row) {
            \App\Models\Riddle::updateOrCreate(
                ['id' => $row['id']],
                [
                    'question' => $row['question'],
                    'answer' => $row['answer'],
                    'keywords' => $row['keywords'] ?? null,
                    'image_filename' => $row['image_filename'] ?? null,
                ]
            );
        }

        $this->info("Import completed successfully.");
    }
}
