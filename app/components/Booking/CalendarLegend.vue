<template>
    <div class="rounded-lg border bg-card p-3">
        <div class="flex flex-wrap items-center gap-4 text-xs md:text-sm">
            <div class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-sm border border-border/70 bg-background" />
                <span class="text-muted-foreground">{{ $t('booking.calendar.legend.available') }}</span>
            </div>
            <div class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-sm border border-success/50 bg-success/30" />
                <span class="text-muted-foreground">{{ $t('booking.calendar.legend.approved') }}</span>
            </div>
            <div class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-sm border border-warning/40 bg-warning/20" />
                <span class="text-muted-foreground">{{ $t('booking.calendar.legend.pending') }}</span>
            </div>
            <div class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-sm border border-destructive/45 bg-destructive/20" />
                <span class="text-muted-foreground">{{ $t('booking.calendar.legend.rejected') }}</span>
            </div>
            <div class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-sm border border-muted-foreground/25 bg-muted" />
                <span class="text-muted-foreground">{{ $t('booking.calendar.legend.canceled') }}</span>
            </div>
        </div>
    </div>
</template>
