<!--
  TicketComments Component

  Displays the ticket's comments with add/edit/delete functionality.

  Props:
  - ticketId: string - The ticket UUID
  - comments: TicketComment[] - Array of ticket comments
  - refresh: Function - Function to refresh ticket data
-->

<template>
    <div class="space-y-4">
        <!-- Add Comment Form -->
        <Card>
            <CardHeader>
                <CardTitle>{{ $t("comment.add") }}</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    <FormItemTextarea
                        :title="$t('comment.placeholder')"
                        v-model="newCommentContent"
                        :placeholder="$t('comment.placeholder')"
                        class="w-full"
                    />
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <FormItemSwitch
                                :id="`internal-${ticketId}`"
                                v-model="newCommentIsInternal"
                                :true-label="$t('comment.internal_label')"
                                :false-label="$t('comment.external_label')"
                            />
                        </div>
                        <Button
                            :disabled="!newCommentContent.trim() || isCommentLoading"
                            @click="handleAddComment"
                        >
                            <Icon
                                v-if="isCommentLoading"
                                name="solar:refresh-linear"
                                class="mr-2 shrink-0 h-4 w-4 animate-spin"
                            />
                            {{ $t("comment.add") }}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Comments List -->
        <div
            v-if="sortedComments && sortedComments.length > 0"
            class="space-y-3"
        >
            <div
                v-for="comment in sortedComments"
                :key="comment.id"
                class="relative"
            >
                <Card :class="comment.isInternal ? 'border-yellow-200 dark:border-yellow-900' : ''">
                    <CardHeader class="pb-3">
                        <div class="flex items-start justify-between">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <Avatar class="h-8 w-8">
                                        <AvatarFallback>
                                            {{ getInitials(comment.admin.firstName, comment.admin.lastName) }}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p class="text-sm font-medium">
                                            {{ comment.admin.firstName }} {{ comment.admin.lastName }}
                                        </p>
                                        <p class="text-xs text-muted-foreground">
                                            {{ formatDate(comment.createdAt) }}
                                            <span v-if="comment.createdAt !== comment.updatedAt">
                                                · {{ $t("common.edited") }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <Badge
                                    v-if="comment.isInternal"
                                    variant="secondary"
                                    class="text-xs"
                                >
                                    <Icon
                                        name="solar:lock-password-bold"
                                        class="mr-1 h-3 w-3 shrink-0"
                                    />
                                    {{ $t("comment.internal") }}
                                </Badge>
                                <DropdownMenu v-if="canEditComment(comment) || canDeleteComment">
                                    <DropdownMenuTrigger as-child>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8"
                                        >
                                            <Icon
                                                name="solar:menu-dots-bold"
                                                class="h-4 w-4 shrink-0"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            v-if="canEditComment(comment)"
                                            @click="handleEditComment(comment)"
                                        >
                                            <Icon
                                                name="solar:pen-bold"
                                                class="mr-2 h-4 w-4 shrink-0"
                                            />
                                            {{ $t("action.edit") }}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            v-if="canDeleteComment"
                                            class="text-destructive"
                                            @click="handleDeleteComment(comment.id)"
                                        >
                                            <Icon
                                                name="solar:trash-bin-trash-bold"
                                                class="mr-2 h-4 w-4"
                                            />
                                            {{ $t("action.delete") }}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <!-- Edit Mode -->
                        <div
                            v-if="editingCommentId === comment.id"
                            class="space-y-3"
                        >
                            <Textarea
                                v-model="editCommentContent"
                                rows="3"
                                class="w-full"
                            />
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <FormItemSwitch
                                        :id="`edit-internal-${comment.id}`"
                                        v-model="editCommentIsInternal"
                                        :true-label="$t('comment.internal_label')"
                                        :false-label="$t('comment.external_label')"
                                    />
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        @click="cancelEdit"
                                    >
                                        {{ $t("action.cancel") }}
                                    </Button>
                                    <Button
                                        size="sm"
                                        :disabled="!editCommentContent.trim() || isCommentLoading"
                                        @click="handleUpdateComment"
                                    >
                                        {{ $t("action.save") }}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <!-- Display Mode -->
                        <p
                            v-else
                            class="text-sm whitespace-pre-wrap"
                        >
                            {{ comment.content }}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div
            v-else
            class="text-center py-8 text-muted-foreground"
        >
            <Icon
                name="solar:chat-round-line-linear"
                class="mx-auto h-12 w-12 mb-2 opacity-50"
            />
            <p>{{ $t("comment.no_comments") }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { TicketComment } from '~/types';
import { useUserStore } from '~/stores/user';

const props = defineProps<{
    ticketId: string;
    comments: TicketComment[];
    refresh: () => Promise<void>;
}>();

const { t } = useI18n();
const { formatDate } = useGermanDateFormat();
const userStore = useUserStore();

// Helper function to get initials from first and last name
const getInitials = (firstName: string, lastName: string) => {
    return useInitials(`${firstName} ${lastName}`);
};

const { isCommentLoading, addComment, updateComment, deleteComment } = useTicketComments();

// New comment state
const newCommentContent = ref('');
const newCommentIsInternal = ref(true);

// Edit comment state
const editingCommentId = ref<string | null>(null);
const editCommentContent = ref('');
const editCommentIsInternal = ref(true);

// Sorted comments (newest first)
const sortedComments = computed(() => {
    if (!props.comments) return [];
    return [...props.comments].sort(
        (a: TicketComment, b: TicketComment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
});

// Check if current user can edit a comment (author only)
const canEditComment = (comment: TicketComment) => {
    return comment.adminId === userStore.user?.id;
};

// Check if current user can delete comments (super admin only)
const canDeleteComment = computed(() => {
    return userStore.user?.isSuperAdmin === true;
});

// Handle add comment
const handleAddComment = async () => {
    if (!newCommentContent.value.trim()) return;
    
    await addComment(
        props.ticketId,
        newCommentContent.value.trim(),
        newCommentIsInternal.value,
        props.refresh,
    );
    
    // Reset form
    newCommentContent.value = '';
    newCommentIsInternal.value = true;
};

// Handle edit comment
const handleEditComment = (comment: TicketComment) => {
    editingCommentId.value = comment.id;
    editCommentContent.value = comment.content;
    editCommentIsInternal.value = comment.isInternal;
};

// Cancel edit
const cancelEdit = () => {
    editingCommentId.value = null;
    editCommentContent.value = '';
    editCommentIsInternal.value = true;
};

// Handle update comment
const handleUpdateComment = async () => {
    if (!editingCommentId.value || !editCommentContent.value.trim()) return;
    
    await updateComment(
        props.ticketId,
        editingCommentId.value,
        editCommentContent.value.trim(),
        editCommentIsInternal.value,
        props.refresh,
    );
    
    // Reset edit state
    cancelEdit();
};

// Handle delete comment
const handleDeleteComment = async (commentId: string) => {
    // Confirm before deleting
    if (!confirm(t('comment.confirm_delete'))) return;
    
    await deleteComment(props.ticketId, commentId, props.refresh);
};
</script>
