import type { AccessLevel, CollectionType, SortField, SortDirection } from './enums'

/**
 * Data Transfer Object for uploading media
 * Note: authType is NOT sent by client - automatically determined by backend
 */
export interface UploadMediaDto {
  readonly file: File
  readonly accessLevel?: AccessLevel
  readonly collectionName?: CollectionType
  readonly modelType?: string
  readonly modelId?: string
  readonly directory?: string
  readonly context?: string
  readonly altText?: string
  readonly title?: string
  readonly description?: string
}

/**
 * Data Transfer Object for updating media metadata
 */
export interface UpdateMediaDto {
  readonly altText?: string
  readonly title?: string
  readonly description?: string
  readonly accessLevel?: AccessLevel
}

/**
 * Data Transfer Object for media queries
 */
export interface MediaQueryDto {
  readonly page?: number
  readonly length?: number
  readonly search?: string
  readonly accessLevel?: AccessLevel
  readonly collectionName?: CollectionType
  readonly modelType?: string
  readonly modelId?: string
  readonly mimeType?: string
  readonly sort_by?: SortField
  readonly sort_dir?: SortDirection
}
